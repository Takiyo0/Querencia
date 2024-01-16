import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import Register from './pages/Register';
import PreRegister from "./pages/PreRegister";
import RegisterSuccess from "./pages/RegisterSuccess";
import AdminHome from "./pages/AdminHome";
import Ticket from "./pages/Ticket";
import AdminRegister from "./pages/AdminRegister";
import {pdfjs} from 'react-pdf';
import AdminRegisters from "./pages/AdminRegisters";
import Admin from "./pages/Admin";
import AdminGetData from "./pages/AdminGetData";
import {Analytics} from "./rest/Analytics";
import AdminAnalytics from "./pages/AdminAnalytics";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AdminSponsor from "./pages/AdminSponsor";
import {createTheme, ThemeProvider} from '@mui/material/styles';
import RegisterBeta from "./pages/RegisterBeta";
import RegisterCompletion from "./pages/RegisterCompletion";
import AdminConfig from "./pages/AdminConfig";
import AppBeta from "./AppBeta";

const theme = createTheme({
    palette: {
        primary: {
            main: '#00a151', // Dark green as the primary color
        },
        secondary: {
            main: '#388e3c', // A different shade of green for secondary color
        },
        mode: "dark"
    },
    // You can further customize typography, spacing, etc. here
});


pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const router = createBrowserRouter([{
    path: '/',
    element: <AppBeta/>
}, {
    path: '/old',
    element: <App/>
}, {
    path: '/register',
    element: <PreRegister/>
}, {
    path: '/register/:id',
    element: <RegisterBeta/>
}, {
    path: '/register/success',
    element: <RegisterSuccess/>
}, {
    path: '/register/completion/:id',
    element: <RegisterCompletion/>
}, {
    path: "/admin",
    element: <Admin/>,
    children: [{
        path: "home",
        element: <AdminHome/>
    }, {
        path: "registers",
        element: <AdminRegisters/>
    }, {
        path: "analytics",
        element: <AdminAnalytics/>
    }, {
        path: "register/:id",
        element: <AdminRegister/>
    }, {
        path: "sponsor",
        element: <AdminSponsor/>
    }, {
        path: "config",
        element: <AdminConfig/>
    }, {
        path: "get",
        element: <AdminGetData/>
    }]
}, {
    path: '/ticket/:id',
    element: <Ticket/>
}, {
    path: 'privacy-policy',
    element: <PrivacyPolicy/>
}])

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <ThemeProvider theme={theme}>
        <RouterProvider router={router}/>
    </ThemeProvider>
);

let temp = "";
setInterval(checkPageChange, 1000);

function checkPageChange() {
    if (temp !== window.location.pathname && window.location.pathname.indexOf("/admin") === -1) {
        temp = window.location.pathname;
        Analytics.onPageOpen([{
            location: window.location.pathname,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            language: navigator.language
        }]);
    }
}

// handle errors
window.addEventListener("error", (e) => {
    Analytics.onPageError([{
        error: e.error,
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
    }]);
});