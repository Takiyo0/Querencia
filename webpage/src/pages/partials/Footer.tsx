import React from "react";
import "../../css/app.css";
import {Analytics} from "../../rest/Analytics";
import {PictureManager} from "../../assets/PictureManager";
import {useNavigate} from "react-router-dom";
import {RestManager} from "../../rest/RestManager";
const penaburLogo = require("../../assets/images/penabur.png");
const osisLogo = require("../../assets/images/osis.png");

export default function Footer() {
    const navigate = useNavigate();
    const [version, setVersion] = React.useState("");
    const signal = React.useMemo(() => new AbortController(), []);

    React.useEffect(() => {
        RestManager.getVersion(signal.signal).then((data) => setVersion(data));
        return () => signal.abort();
    }, [signal]);

    return <div className={"footer"}>
        <div className={"footer-content-parent"}>
            <div className={"footer-content-gen3"}>
                <div className={"footer-content-gen4"}>
                    <p className={"footer-page-title"}>Pages</p>
                    {[
                        {name: "Home", target: "/"},
                        {name: "Competitions", target: "/register"},
                        {name: "Privacy & Policy", target: "/privacy-policy"},
                        {name: "Admin", target: "/admin"},
                    ].map(({name, target}, i) => (
                        <p className={"footer-link"} key={i} onClick={() => Analytics.onButtonClick([{from: "home", to: name}], navigate(target))}>{name}</p>
                    ))}
                </div>

                <div className={"footer-content-gen4"}>
                    <p className={"footer-page-title"}>Links</p>
                    {[
                        {name: "Proposal", link: "https://office.redacted.redacted/s/GoiKmt7BYHDdSqE"},
                        {name: "Proposal Lomba", link: "https://office.redacted.redacted/s/S9EXty2oWgQTtAq"},
                        {name: "Merch", link: "https://merch.redacted.redacted"},
                        {name: "Moodle", link: "https://moodle.redacted.redacted"},
                        {name: "Links", link: "https://links.redacted.redacted"},
                        {name: "Office", link: "https://office.redacted.redacted"},
                        {name: "CDN", link: "https://cdn.redacted.redacted"}
                    ].map(({name, link}, i) => (
                        <p className={"footer-link"} key={i} onClick={() => Analytics.onButtonClick([{from: "home", to: name}], window.open(link, "_blank"))}>{name}</p>
                    ))}
                </div>

                <div className={"footer-content-gen4"}>
                    <p className={"footer-page-title"}>Social Media</p>
                    {[
                        {name: "Instagram", link: "https://instagram.com/redacted"},
                        {name: "Facebook", link: "https://facebook.com/redacted"},
                        {name: "TikTok", link: "https://www.tiktok.com/@redacted"},
                        {name: "YouTube", link: "https://youtube.com/@redacted"},
                        {name: "Website", link: "https://bpkpenabur.or.id/redacted"},
                    ].map(({name, link}, i) => (
                        <p className={"footer-link"} key={i} onClick={() => Analytics.onButtonClick([{from: "home", to: name}], window.open(link, "_blank"))}>{name}</p>
                    ))}
                </div>
            </div>
            <div className={"footer-content-gen2"}>
                <div className={"footer-fixed"}>
                    <img src={PictureManager.querencia} alt={"querencia logo"} className={"footer-querencia-logo"}/>
                    <div className={"footer-copyright"}>Copyright (C) 2023. All Rights Reserved.</div>
                </div>
                <div className={"footer-content"} style={{marginTop: "10px"}}>
                    <img src={penaburLogo} alt={"logo of SMAK PENABUR redacted"} className={"footer-logo"}/>
                    <img src={osisLogo} alt={"logo of OSIS SMAK PENABUR redacted"} className={"footer-logo"}/>
                </div>
            </div>
        </div>
        <div className={"footer-information"}>
            <div className={"footer-information-title"}>Made with ♥ by redacted, redacted, & redacted</div>
            <div className={"footer-information-version"}>{version}</div>
        </div>
    </div>
}