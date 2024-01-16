import "../css/ticket.css";
import React from 'react';
import {useParams} from "react-router-dom";
import axios from "axios";

export default function Ticket() {
    const [err, setErr] = React.useState<string>("");
    const [imageLink, setImageLink] = React.useState<string>("");
    const {id} = useParams<{ id: string }>();
    const query = new URLSearchParams(window.location.search);

    React.useEffect(() => {
        const abortController = new AbortController();
        axios.get(`/rest/register/get/${id}/ticket?token=${query.get("token")}`, { signal: abortController.signal }).then(res => {
            if (res.data?.error) {
                setErr(res.data.error);
            } else {
                setImageLink(`/rest/register/get/${id}/ticket?token=${query.get("token")}`);
            }
        }).catch(err => { setErr(err.message) });

        return () => abortController.abort();
    }, []);

    return (<div className="ticket-parent">
        {err && <div className="error">{err}</div>}
        {imageLink && <img src={imageLink} alt="ticket"/>}
        {imageLink && <div className={"ticket-download"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 94 89" fill="none">
                <rect width="94" height="89" rx="44.5" fill="#B0DB78"/>
                <path d="M50 13C50 11.3431 48.6569 10 47 10C45.3431 10 44 11.3431 44 13L50 13ZM44.8787 60.1213C46.0503 61.2929 47.9497 61.2929 49.1213 60.1213L68.2132 41.0294C69.3848 39.8579 69.3848 37.9584 68.2132 36.7868C67.0416 35.6152 65.1421 35.6152 63.9706 36.7868L47 53.7574L30.0294 36.7868C28.8579 35.6152 26.9584 35.6152 25.7868 36.7868C24.6152 37.9584 24.6152 39.8579 25.7868 41.0294L44.8787 60.1213ZM44 13L44 58L50 58L50 13L44 13Z" fill="#3F2D17" fill-opacity="0.85"/>
                <path d="M21 54V68.5596" stroke="#3F2D17" stroke-opacity="0.85" stroke-width="6" stroke-linecap="round"/>
                <path d="M72.999 54V68.5596" stroke="#3F2D17" stroke-opacity="0.85" stroke-width="6" stroke-linecap="round"/>
                <path d="M21 68.5594H73" stroke="#3F2D17" stroke-opacity="0.85" stroke-width="6" stroke-linecap="round"/>
            </svg>
            <a href={imageLink} download>Download</a>
        </div>}
    </div>)
}