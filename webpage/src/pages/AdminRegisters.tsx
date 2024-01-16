import React from 'react';

import Typography from '@mui/material/Typography';
import {DataGrid, GridColDef, GridValueGetterParams} from '@mui/x-data-grid';
import {RegistrationData, RestManager} from "../rest/RestManager";
import {useNavigate} from "react-router-dom";
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

const columns: GridColDef[] = [
    {field: 'competition', headerName: 'Nama Lomba', width: 150},
    {field: 'schoolLevel', headerName: 'Jenjang', width: 130},
    {field: 'participantData', headerName: 'Data Peserta', width: 300},
    {field: 'teacherData', headerName: 'Data Pendamping', width: 300},
    {field: 'status', headerName: 'Status', width: 130},
    {field: 'dateRegistered', headerName: 'Tanggal Registrasi', width: 200},
    {field: 'dateConfirmed', headerName: 'Tanggal Diterima', width: 270},
    {field: 'id', headerName: 'Id', width: 130}
];

export default function AdminRegisters() {
    const abort = React.useRef(new AbortController());
    const [registrations, setRegistrations] = React.useState<RegistrationData[]>([]);
    const [realRegistrations, setRealRegistrations] = React.useState<RegistrationData[]>([]);
    const [hideRejected, setHideRejected] = React.useState<boolean>(true);
    const navigate = useNavigate();

    React.useEffect(() => {
        RestManager.getRegistrations(abort.current.signal).then((registrations) => setRealRegistrations(registrations.data)).catch(() => setRealRegistrations([]));
        return () => abort.current.abort();
    }, []);

    React.useEffect(() => {
        setRegistrations(realRegistrations.filter((registration) => !hideRejected || registration.status !== "Rejected"));
    }, [hideRejected, realRegistrations]);

    return (<div>
        <Typography variant="h4" component="h4" gutterBottom color={"#fff"}>
            Registrations
        </Typography>
        <FormControlLabel control={<Switch inputProps={{'aria-label': "Show rejected"}} defaultChecked
                                           onChange={(event) => setHideRejected(event.target.checked)}
                                           value={hideRejected} color={"primary"} sx={{color: "#fff"}}/>}
                          label="Sembunyikan registrasi ditolak" sx={{color: "#fff"}}/>
        <DataGrid
            rows={registrations.map((registration) => ({
                id: registration.id,
                competition: registration.competition,
                schoolLevel: registration.schoolLevel,
                participantData: registration.data.participant.map(([key, value]) => `${key}: ${value}`).join("\n"),
                teacherData: registration.data.teacher.map(([key, value]) => `${key}: ${value}`).join("\n"),
                status: registration.status,
                dateRegistered: new Date(registration.dateRegistered).toLocaleString(),
                dateConfirmed: registration.dateConfirmed ? `${new Date(registration.dateConfirmed).toLocaleString()} by ${registration.confirmedBy}` : "Not Confirmed"
            }))}
            columns={columns}
            initialState={{
                pagination: {
                    paginationModel: {page: 0, pageSize: 20},
                },
            }}
            pageSizeOptions={[20, 50]}
            onRowClick={(params: any) => navigate(`/admin/register/${params.row.id}`)}
            sx={{color: "#fff"}}
        />
    </div>)
}