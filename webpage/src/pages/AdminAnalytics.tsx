import React from "react";
import Typography from "@mui/material/Typography";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import {AnalyticsData, AnalyticsTypeString, RestManager} from "../rest/RestManager";
import CircularProgress from "@mui/material/CircularProgress";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import "../css/admin.css";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {defaultStyles, JsonView} from "react-json-view-lite";

const columns: GridColDef[] = [
    {field: 'type', headerName: 'Type', width: 150},
    {field: 'device', headerName: 'Device', width: 200},
    {field: 'data', headerName: 'Data', width: 700},
    {field: 'date', headerName: 'Date', width: 300},
    {field: 'ip', headerName: 'IP', width: 100},
    {field: 'id', headerName: 'Id', width: 130}
];

export default function AdminAnalytics() {
    const [data, setData] = React.useState<AnalyticsData[] | null>(null);
    const [anotherData, setAnotherData] = React.useState<{ totalData: number, loading: boolean }>({
        totalData: 0,
        loading: true
    });
    const [paginationModel, setPaginationModel] = React.useState({
        pageSize: 100,
        page: 0,
    });
    const [type, setType] = React.useState<-1 | 0 | 1 | 2 | 3 | 4>(-1);
    const abort = React.useRef(new AbortController());
    const [selectedAnalytics, setSelectedAnalytics] = React.useState<AnalyticsData | undefined>();

    React.useEffect(() => {
        fetchData();
        return () => abort.current.abort();
    }, []);

    React.useEffect(() => {
        fetchData();
    }, [paginationModel]);

    async function fetchData() {
        setAnotherData((d) => ({...d, loading: true}));
        const {
            data,
            totalData
        } = await RestManager.getAnalytics(abort.current.signal, paginationModel.page, paginationModel.pageSize, type).catch(() => ({
            data: [],
            totalData: 0
        }));
        setData(data);
        setAnotherData({totalData, loading: false});
    }

    function stringToHash(string: string) {
        let hash = 0;

        if (string.length === 0) {
            return hash;
        }

        for (let i = 0; i < string.length; i++) {
            const char = string.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        return hash;
    }

    return <>
        <Typography variant="h4" component="h4" gutterBottom color={"#fff"}>
            Analytics
        </Typography>

        <Dialog
            open={!!selectedAnalytics}
            onClose={() => setSelectedAnalytics(undefined)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {"Analytics Data"}
            </DialogTitle>
            <DialogContent>
                <React.Fragment>
                    <JsonView data={selectedAnalytics!} style={defaultStyles}/>
                </React.Fragment>
            </DialogContent>
        </Dialog>

        <div>
            <FormControl sx={{m: 1, minWidth: 150}}>
                <InputLabel id="demo-simple-select-autowidth-label" sx={{color: '#fff'}}>Type</InputLabel>
                <Select
                    value={`${type}`}
                    onChange={(event: SelectChangeEvent) => {
                        setType(event.target.value as any);
                        setPaginationModel((d) => ({...d, page: 0}));
                    }}
                    autoWidth
                    label="Type"
                    // change the colors to white
                    sx={{
                        color: "#fff",
                        "& .MuiSelect-icon": {
                            color: '#fff' // Set arrow color to white
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: '#fff' // Set outline color to white
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: '#fff' // Set outline color to white on hover
                        }
                    }}
                >
                    <MenuItem value={`${-1}`}>All</MenuItem>
                    <MenuItem value={`${0}`}>PAGE_OPEN</MenuItem>
                    <MenuItem value={`${1}`}>BUTTON_CLICK</MenuItem>
                    <MenuItem value={`${2}`}>PAGE_CHANGE</MenuItem>
                    <MenuItem value={`${3}`}>PAGE_CLOSE</MenuItem>
                    <MenuItem value={`${4}`}>PAGE_ERROR</MenuItem>
                </Select>
            </FormControl>
        </div>

        {data ? <DataGrid
            rows={data.map((d) => ({
                type: AnalyticsTypeString[d.type],
                device: d.device,
                data: Array.isArray(d.data) ? d.data.map(a => Object.entries(a).map(([key, value]) => `${key}: ${value}`).join("\n")).join("\n") : d.data,
                date: new Date(d.date).toLocaleString(),
                ip: d.ip,
                id: d.date
            }))}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            rowCount={anotherData.totalData}
            pageSizeOptions={[100, 250, 500, 1000]}
            sx={{color: "#fff"}}
            paginationMode={"server"}
            loading={anotherData.loading}
            getRowClassName={(params) => `analytics-${params.row.type}`}
            onRowClick={(params: any) => setSelectedAnalytics(data?.find(x => x.date === params.row.id))}
        /> : <CircularProgress sx={{color: "rgb(255,255,255)"}}/>}
    </>
}