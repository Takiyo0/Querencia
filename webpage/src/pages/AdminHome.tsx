import React from 'react';
import "../css/admin.css";
import {RegistrationData, RestManager, Stats, UserData} from "../rest/RestManager";
import {useParams, useNavigate} from "react-router-dom";
import DataTable from 'react-data-table-component';
import {Skeleton} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import RestoreIcon from '@mui/icons-material/Restore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Paper from '@mui/material/Paper';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import Button from '@mui/material/Button';
import {Analytics} from "../rest/Analytics";

export default function AdminHome() {
    const [registrations, setRegistrations] = React.useState<RegistrationData[]>([]);
    const [user, setUser] = React.useState<UserData | null>(null);
    const [stats, setStats] = React.useState<Stats | null>(null);
    const navigate = useNavigate();

    function stringToColor(string: string) {
        let hash = 0;
        let i;

        /* eslint-disable no-bitwise */
        for (i = 0; i < string.length; i += 1) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }

        let color = '#';

        for (i = 0; i < 3; i += 1) {
            const value = (hash >> (i * 8)) & 0xff;
            color += `00${value.toString(16)}`.slice(-2);
        }
        /* eslint-enable no-bitwise */

        return color;
    }

    function stringAvatar(name: string) {
        return {
            sx: {
                bgcolor: stringToColor(name),
            },
            children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
        };
    }

    React.useEffect(() => {
        const abortController = new AbortController();
        RestManager.isLoggedIn(abortController.signal).then((loggedIn) => {
            if (loggedIn) RestManager.getUser(abortController.signal).then((user) => setUser(user));
        }).catch(() => void 0);
        RestManager.getRegistrations(abortController.signal).then((registrations) => setRegistrations(registrations.data)).catch(() => setRegistrations([]));
        RestManager.getStats(abortController.signal).then((stats) => setStats(stats)).catch(() => setStats(null));

        return () => {
            abortController.abort();
        }
    }, [])

    function greeting() {
        const date = new Date();
        const hour = date.getHours();
        if (hour < 12) {
            return "Selamat Pagi";
        } else if (hour < 15) {
            return "Selamat Siang";
        } else if (hour < 18) {
            return "Selamat Sore";
        } else {
            return "Selamat Malam";
        }
    }

    // @ts-ignore
    return (<>
        <div className="admin-home-home-header">
            {user ? <Avatar {...stringAvatar((user.user.username.givenName + " " + user.user.username.surname) || "")}
                            sx={{width: 65, height: 65}}/> : <Skeleton variant={"circular"} height={65} width={65} sx={{ bgcolor: '#5d5d5d' }}/>}
            {user ? <div className="admin-home-home-header-text"> {greeting()}, <br/>
                <span>{user.user.username.givenName} {user.user.username.surname}</span>
            </div> : <Skeleton variant={"text"} height={65} width={200} sx={{ bgcolor: '#5d5d5d', marginLeft: "20px" }}/>}
        </div>
        <div className="admin-home-home-content">
            <div className="admin-home-home-content-card">
                <div className="admin-home-home-content-card-title">
                    <AppRegistrationIcon sx={{width: 45, height: 45}}/>
                    <div className="admin-home-home-content-card-title-text">
                        Registrations
                    </div>
                </div>
                <div className="admin-home-home-content-card-content">
                    <div className="admin-home-home-content-card-content-item">
                        <div className="admin-home-home-content-card-content-item-title">
                            Registrasi
                        </div>
                        <div className="admin-home-home-content-card-content-item-value">
                            {stats ? ((stats.registrations.total ?? 0) - stats.registrations.rejected) + ` registrasi` : <Skeleton animation="wave" sx={{bgcolor: '#5d5d5d'}}/>}
                        </div>
                    </div>
                    <div className="admin-home-home-content-card-content-item">
                        <div className="admin-home-home-content-card-content-item-title">
                            Registrasi Diterima
                        </div>
                        <div className="admin-home-home-content-card-content-item-value">
                            {stats ? stats.registrations.confirmed + " registrasi" : <Skeleton animation="wave" sx={{bgcolor: '#5d5d5d'}}/>}
                        </div>
                    </div>
                    <div className="admin-home-home-content-card-content-item">
                        <div className="admin-home-home-content-card-content-item-title">
                            Registrasi Menunggu
                        </div>
                        <div className="admin-home-home-content-card-content-item-value">
                            {stats ? stats.registrations.pending + " registrasi" : <Skeleton animation="wave" sx={{bgcolor: '#5d5d5d'}}/>}
                        </div>
                    </div>
                    <div className="admin-home-home-content-card-content-item">
                        <div className="admin-home-home-content-card-content-item-title">
                            Registrasi Ditolak
                        </div>
                        <div className="admin-home-home-content-card-content-item-value">
                            {stats ? stats.registrations.rejected + " registrasi" : <Skeleton animation="wave" sx={{bgcolor: '#5d5d5d'}}/>}
                        </div>
                    </div>
                    <div className="admin-home-home-content-card-content-item">
                        <div className="admin-home-home-content-card-content-item-title">
                            Total Registrasi
                        </div>
                        <div className="admin-home-home-content-card-content-item-value">
                            {stats ? stats.registrations.total! + " registrasi" : <Skeleton animation="wave" sx={{bgcolor: '#5d5d5d'}}/>}
                        </div>
                    </div>
                </div>

                <div className="admin-home-home-content-card-content-buttons">
                    <Button size="small" onClick={() => Analytics.onButtonClick([{from: "admin/home", to: "admin/registers"}], navigate("/admin/registers"))}>
                        Lihat Semua
                    </Button>
                </div>
            </div>
            {/*<div className="admin-home-home-content-card">*/}
            {/*    <div className="admin-home-home-content-card-title">*/}
            {/*        <SpaceDashboardIcon sx={{width: 50, height: 50}}/>*/}
            {/*        <div className="admin-home-home-content-card-title-text">*/}
            {/*            Dashboard*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*    <div className="admin-home-home-content-card-content">*/}
            {/*        <div className="admin-home-home-content-card-content-item">*/}
            {/*            <div className="admin-home-home-content-card-content-item-title">*/}
            {/*                Total Registrasi*/}
            {/*            </div>*/}
            {/*            <div className="admin-home-home-content-card-content-item-value">*/}
            {/*                {registrations.length}*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>
        {/*<DataTable*/}
        {/*    columns={[{*/}
        {/*        name: 'Nama Lomba',*/}
        {/*        selector: (row: RegistrationData) => row.competition,*/}
        {/*        sortable: true,*/}
        {/*    },*/}
        {/*        {*/}
        {/*            name: 'Jenjang',*/}
        {/*            selector: (row: RegistrationData) => row.schoolLevel,*/}
        {/*            sortable: true,*/}
        {/*        },*/}
        {/*        {*/}
        {/*            name: 'Data Peserta',*/}
        {/*            selector: (row: RegistrationData) => row.data.participant.map(([key, value]) => `${key}: ${value}`).join("\n"),*/}
        {/*        },*/}
        {/*        {*/}
        {/*            name: 'Data Pendamping',*/}
        {/*            selector: (row: RegistrationData) => row.data.teacher.map(([key, value]) => `${key}: ${value}`).join("\n"),*/}
        {/*        },*/}
        {/*        {*/}
        {/*            name: 'Status',*/}
        {/*            selector: (row: RegistrationData) => row.status,*/}
        {/*            sortable: true,*/}
        {/*        },*/}
        {/*        {*/}
        {/*            name: 'Tanggal Registrasi',*/}
        {/*            selector: (row: RegistrationData) => new Date(row.dateRegistered).toLocaleDateString(),*/}
        {/*            sortable: true,*/}
        {/*        },*/}
        {/*        {*/}
        {/*            name: 'Tanggal Diterima',*/}
        {/*            selector: (row: RegistrationData) => row.dateConfirmed ? `${new Date(row.dateConfirmed).toLocaleDateString()} by ${row.confirmedBy}` : "Not Confirmed",*/}
        {/*            sortable: true,*/}
        {/*        },*/}
        {/*        {*/}
        {/*            name: 'ID',*/}
        {/*            selector: (row: RegistrationData) => row.id*/}
        {/*        }]}*/}
        {/*    data={registrations}*/}
        {/*    pagination={true}*/}
        {/*    onRowClicked={(row) => navigate(`/admin/register/${row.id}`)}*/}
        {/*/>*/}
    </>)
}