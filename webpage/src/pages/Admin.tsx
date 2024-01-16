import "../css/admin.css";
import React from 'react';
import {Outlet, useNavigate, useLocation} from "react-router-dom";

import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import Button from '@mui/material/Button';
import GoogleIcon from '@mui/icons-material/Google';
import CircularProgress from '@mui/material/CircularProgress';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import Paper from '@mui/material/Paper';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import {RestManager, UserData} from "../rest/RestManager";
import {Analytics} from "../rest/Analytics";
import SettingsIcon from '@mui/icons-material/Settings';

export default function Admin() {
    const [loading, setLoading] = React.useState<boolean>(true);
    const [user, setUser] = React.useState<UserData | null>(null);
    const [show, setShow] = React.useState<boolean>(false);
    const abort = React.useRef(new AbortController());
    const path = React.useMemo(() => window.location.pathname, []);
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        window.history.replaceState(null, "", "/admin");
        RestManager.getUser(abort.current.signal).then((user) => setUser(user)).catch(() => setUser(null)).finally(() => setLoading(false));
        return () => abort.current.abort();
    }, []);

    React.useEffect(() => {
        if (user?.admin) {
            setShow(true);
            window.history.replaceState(null, "", path);
            if (path === "/admin") navigate("/admin/home");
        }
    }, [user]);

    function getPathIndex(path: string) {
        if (path === "/admin/home") return 0;
        if (path === "/admin/registers") return 1;
        if (path.includes("/admin/analytics")) return 2;
        if (path.includes("/admin/config")) return 3;
        return 0;
    }

    function changePath(event: React.SyntheticEvent, value: any) {
        if (value === 0) navigate("/admin/home");
        if (value === 1) navigate("/admin/registers");
        if (value === 2) navigate("/admin/analytics");
        if (value === 3) navigate("/admin/config");
    }

    return (<>
        <div className="admin-home-header">
            <img src={"https://cdn.redacted.redacted/HY7uTw1t8qEe.png"} alt="Querencia Logo" onClick={() => navigate("/")}/>
            <div className="admin-home-header-text">
                Admin Panel
            </div>
        </div>
        <div className={!show ? "admin-home-content admin-home-content-center" : "admin-home-content"}>
            {show ? <Outlet/> : <>
                {loading ? <CircularProgress sx={{color: "rgb(255,255,255)"}}/> :
                    <>
                        {!!user?.user ? <Paper sx={{backgroundColor: "rgb(16, 20, 24)", padding: "10px", borderRadius: "10px", width: "100%", maxWidth: "500px", margin: "auto", marginTop: "20px", color: "rgb(255,153,153)", display: "flex", alignItems: "center", fontSize: "15px"}}>
                                <GppMaybeIcon sx={{width: 50, height: 50}} /> Access Denied. Contact site developer to gain access. <br/>
                                <Button variant="contained" startIcon={<GoogleIcon />} onClick={() => Analytics.onButtonClick([{type: "logout"}], (() => window.location.href = "/rest/auth/logout")())} sx={{backgroundColor: "rgb(141,198,255)", padding: "10px", borderRadius: "10px", margin: "auto", color: "rgb(59,59,59)"}}>
                                    Logout
                                </Button>
                        </Paper> :
                            <Button variant="contained" startIcon={<GoogleIcon />} onClick={() => Analytics.onButtonClick([{type: "login"}], (() => window.location.href = "/rest/auth/google")())} sx={{backgroundColor: "rgb(16, 20, 24)", padding: "10px", borderRadius: "10px", width: "100%", maxWidth: "400px", margin: "auto", marginTop: "20px", color: "white", display: "flex", alignItems: "center"}}>
                                Login to continue
                            </Button>
                        }
                    </>}
            </>}
        </div>

        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: "1px solid #2a2929" }} elevation={3}>
            <BottomNavigation
                showLabels
                value={getPathIndex(location.pathname)} onChange={changePath}
                sx={{ backgroundColor: "rgb(16, 20, 24)" }}
            >
                <BottomNavigationAction label="Home" icon={<SpaceDashboardIcon />} sx={{color: "rgb(255,255,255)"}} />
                <BottomNavigationAction label="Registrations" icon={<AppRegistrationIcon />} sx={{color: "rgb(255,255,255)"}} />
                <BottomNavigationAction label="Analytics" icon={<QueryStatsIcon />} sx={{color: "rgb(255,255,255)"}} />
                <BottomNavigationAction label="Settings" icon={<SettingsIcon />} sx={{color: "rgb(255,255,255)"}} />
            </BottomNavigation>
        </Paper>
    </>)
}