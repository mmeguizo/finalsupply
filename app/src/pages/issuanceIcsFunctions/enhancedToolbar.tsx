
import * as React from "react";
import { TextField, Toolbar, Typography, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const EnhancedTableToolbar = (props : {
    searchQuery: string;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => {

    const { searchQuery, onSearchChange } = props;

    return (
        <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }} >
            <Typography sx={{ flex: "1 1 100%" }} variant="h6" id="tableTitle" component={"div"} >
                Inventory Custodian Slip (ICS)
            </Typography>
            <TextField
                variant="outlined"  
                size="small"
                placeholder="Search PO#, RIS ID, description..."
                value={searchQuery}
                onChange={onSearchChange}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),  
                }}
                />
        </Toolbar>

    )

}


export default EnhancedTableToolbar;