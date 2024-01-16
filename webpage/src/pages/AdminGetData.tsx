import React from "react";

import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsIcon from '@mui/icons-material/Directions';


import { QrReader } from 'react-qr-reader';

const Test = () => {
    const [data, setData] = React.useState('No result');

    return (
        <>
            <QrReader
                onResult={(result, error) => {
                    if (!!result) {
                        setData(result?.getText());
                    }

                    if (!!error) {
                        console.info(error);
                    }
                }}
             constraints={{ deviceId: "445eed02944d0b87ddd25ba9f5cb43d698eb2a9fa24fd621faa53e441b8091bc" }} />
            <p>{data}</p>
        </>
    );
};

export default function AdminGetData() {
    return <>
        <Paper
            component="form"
            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400, backgroundColor: "transparent", margin: "auto", boxShadow: "0px 2px 1px -1px rgb(255 255 255 / 20%), 0px 1px 1px 0px rgb(255 255 255 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)" }}
        >
            <InputBase
                sx={{ ml: 1, flex: 1, color: "white" }}
                placeholder="Search registration by id"
                inputProps={{ 'aria-label': 'search registration by id' }}
            />
            <IconButton type="button" sx={{ p: '10px', color: "white" }} aria-label="search">
                <SearchIcon fill={"white"} />
            </IconButton>
        </Paper>
        <Test />
    </>
}