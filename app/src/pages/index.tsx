import * as React from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent,
  CardHeader,
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { GET_ALL_DASHBOARD_DATA } from '../graphql/queries/purchaseorder.query.js';
import { useQuery } from '@apollo/client';
import { currencyFormat, formatCategory ,formatBarChartData, currencyFormatWithRoundingSymbol } from '../utils/generalUtils';
// Sample data - replace with your actual data
const barChartData = [
  { month: 'Jan', amount: 2400 },
  { month: 'Feb', amount: 1398 },
  { month: 'Mar', amount: 9800 },
  { month: 'Apr', amount: 3908 },
  { month: 'May', amount: 4800 },
  { month: 'Jun', amount: 3800 },
];

const pieChartData = [
  { id: 0, value: 35, label: 'PAR' },
  { id: 1, value: 45, label: 'RIS' },
  { id: 2, value: 20, label: 'ICS' },
];

export default function DashboardPage() {

  const { data , loading , error } = useQuery(GET_ALL_DASHBOARD_DATA);
  console.log('Dashboard Data:', data); // Add this to debug

  const totalAmount = data?.getAllTotalPurchaseOrderAmount || 0;
  const totalPurchaseOrderitems = data?.getTotalPurchaseOrderItems || 0;
  const totalPurchaseOrders = data?.getTotalPurchaseOrders || 0;
  const formattedBarChartData = formatBarChartData(data?.getPurchaseOrderForBarCharts || []);
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
                Total Items
              </Typography>
              <Typography variant="h5">{totalPurchaseOrderitems}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Purchase Orders
              </Typography>
              <Typography variant="h5">{totalPurchaseOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Deliveries
              </Typography>
              <Typography variant="h5">12</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Amount
              </Typography>
              <Typography variant="h5">&#8369;{currencyFormatWithRoundingSymbol(totalAmount)}</Typography>
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
              xAxis={[{ 
                scaleType: 'band', 
                data: formattedBarChartData.map(item => item.month) 
              }]}
              series={[{ 
                data: formattedBarChartData.map(item => item.amount) 
              }]}
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
              series={[{
                data: pieChartData,
                highlightScope: { faded: 'global', highlighted: 'item' },
              }]}
              height={300}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
