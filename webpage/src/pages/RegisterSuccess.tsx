import React, {useState} from "react";
import { useLocation } from 'react-router-dom';
import "../css/register.css";
import "../css/default.css";
import {Analytics} from "../rest/Analytics";

export default function RegisterSuccess() {
    const [isValid, setIsValid] = useState<boolean>(false);
    const useQuery = () => new URLSearchParams(useLocation().search);
    let query = useQuery();

    React.useEffect(() => {
        const regId = query.get("registerId");
        const regs = localStorage.getItem("registeredIds");
        if (regId && regs) {
            const registeredIds = JSON.parse(regs);
            if (registeredIds.includes(regId)) {
                setIsValid(true);
                localStorage.setItem("registeredIds", JSON.stringify(registeredIds.filter((id: string) => id !== regId)));
            }
        }
    }, [])

    return <div className={"register-success-parent"}>
        <div className={"register-success-parent-body"}>
            {isValid ? <>
                <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                    <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                    <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
                <div className={"register-success-parent-body-title"}> Pendaftaran berhasil </div>
                <hr className={"register-success-parent-body-divider"}/>
                <div className={"register-success-parent-body-information"}> Untuk melihat informasi lebih lanjut, silahkan cek email yang sudah terdaftar. </div>
                <div className={"register-success-parent-body-information register-success-parent-body-information-2"}> Jika kamu tidak menerima email, silahkan hubungi kami melalui: <br/> redacted - redacted <br/>
                    redacted - redacted <br/>
                    redacted - redacted </div>
            </> : <>
                <div className={"register-success-parent-body-not-valid"}> Pendaftaran tidak valid </div>
            </>}
        </div>
    </div>
}