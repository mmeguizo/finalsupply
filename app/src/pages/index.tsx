import * as React from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { useQuery } from "@apollo/client";
import {
  currencyFormat,
  formatCategory,
  formatBarChartData,
  currencyFormatWithRoundingSymbol,
} from "../utils/generalUtils";
// @ts-ignore
import { GET_USERS_COUNT } from "../graphql/queries/user.query.js";
// @ts-ignore
import { GET_ALL_DASHBOARD_DATA } from "../graphql/queries/purchaseorder.query.js";
import CircularProgress from "@mui/material/CircularProgress";
// Sample data - replace with your actual data
let pieChartData: any[] = [];

export default function DashboardPage() {
  const { data, loading, error } = useQuery(GET_ALL_DASHBOARD_DATA);
  const {
    data: usersCountData,
    loading: usersCountLoading,
    error: usersCountError,
  } = useQuery(GET_USERS_COUNT);

  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  // State for processed data
  const [processedData, setProcessedData] = React.useState({
    totalAmount: 0,
    totalItems: 0,
    totalOrders: 0,
    usersCount: 0,
    barChartData: [],
    totalCategory: [],
  });

  React.useEffect(() => {
    setIsLoading(loading || usersCountLoading);
  }, [loading, usersCountLoading]);

  // Process data when it changes
  React.useEffect(() => {
    if (data) {
      setIsLoading(false);
      setIsError(false);
      // Use reduce to count categories
      const categoryCounts = data.getAllCategory.reduce((acc: any, e: any) => {
        const category = e.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});
      console.log(categoryCounts)
      // Create pieChartData based on the counts
       pieChartData = [
        {
          value: categoryCounts["property acknowledgement reciept"] || 0,
          label: "PAR",
        },
        {
          value: categoryCounts["inventory custodian slip"] || 0,
          label: "ICS",
        },
        { value: categoryCounts["requisition issue slip"] || 0, label: "RIS" },
      ];


      setProcessedData({
        totalAmount: data.getAllTotalPurchaseOrderAmount || 0,
        usersCount: usersCountData?.countAllUsers || 0,
        totalItems: data.getTotalPurchaseOrderItems || 0,
        totalOrders: data.getTotalPurchaseOrders || 0,
        barChartData: formatBarChartData(
          data.getPurchaseOrderForBarCharts || []
        ),
        totalCategory: data.getAllCategory || [],
      });
    }
  }, [data, usersCountData]);
  console.log(pieChartData)

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography> */}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Users
              </Typography>
              {/* Display loading indicator */}
              {isLoading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant="h5">{processedData.usersCount}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                PO
              </Typography>
              {isLoading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant="h5">
                  {processedData.totalOrders}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Items
              </Typography>
              {isLoading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant="h5">{processedData.totalItems}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Amount
              </Typography>
              {isLoading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant="h5">
                  &#8369;
                  {currencyFormatWithRoundingSymbol(processedData.totalAmount)}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Purchase Orders
            </Typography>
            <BarChart
              loading={isLoading}
              xAxis={[
                {
                  scaleType: "band",
                  data: processedData.barChartData.map(
                    (item: any) => item.month
                  ),
                },
              ]}
              series={[
                {
                  data: processedData.barChartData.map(
                    (item: any) => item.amount
                  ),
                },
              ]}
              height={300}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Distribution by Category
            </Typography>
            <PieChart
              loading={isLoading}
              series={[
                {
                  data: pieChartData,
                  highlightScope: { faded: "global", highlighted: "item" },
                },
              ]}
              height={300}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
