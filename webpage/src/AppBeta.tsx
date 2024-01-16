import React from "react";
import "./css/app.css";
import Box from "@mui/material/Box";
import {useMediaQuery} from "@mui/material";
import Typography from "@mui/material/Typography";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import InfoIcon from '@mui/icons-material/Info';
import Footer from "./pages/partials/Footer";


const didukung = [['sosro', 'https://cdn.redacted.redacted/ToLMVL4ZSwJ4.webp'], ['sunsport', 'https://cdn.redacted.redacted/pl31FxScT0Y3.webp'], ['karunia', 'https://cdn.redacted.redacted/Nrhxj75SfhVE.webp'], ['icanread', 'https://cdn.redacted.redacted/zQry3MB7BgOu.webp']]
const sponsor = [['binus', 'https://cdn.redacted.redacted/iyFQI7wkEZLq.webp'], ['gisma', 'https://cdn.redacted.redacted/Od2PgNzSWM0W.webp'], ['untar', 'https://cdn.redacted.redacted/HlRUMSUH8TAj.webp'], ['yabes', 'https://cdn.redacted.redacted/EXYV5iEn24Uq.webp'], ['rspk', 'https://cdn.redacted.redacted/kRG8ZowWquJg.webp'],  ['umn', 'https://cdn.redacted.redacted/JKpDQOfsYuqC.webp'], ['metropack', 'https://cdn.redacted.redacted/6rUjaGmFQdzi.webp']];

export default function AppBeta() {
    const mobile = useMediaQuery('(max-width:1130px)');

    return <>
        <img src={"https://cdn.redacted.redacted/q4iGqMxVUlM1.webp"} style={{position: "fixed", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: -1}}/>
        <canvas id="canvas" style={{position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: -1}}></canvas>
        <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", width: "100vw", zIndex: 1, backgroundColor: "rgba(0,0,0,0.29)"}}>
            <Box sx={{display: "flex", alignItems: "center", minHeight: "100vh", flexDirection: mobile ? "column" : "row"}}>
                <img src={"https://cdn.redacted.redacted/9xTxkrujE4IX.webp"} style={{maxWidth: "500px", width: "100vw", height: "auto", objectFit: "contain", animation: "flyRightIntro 1s ease-in-out forwards"}}/>
                <Box sx={mobile ? {height: 3, width: "200px", backgroundColor: "#fff", margin: 2} : {width: 3, height: "200px", backgroundColor: "#fff", margin: 2}}/>
                <Box sx={{display: "flex", flexDirection: "column", alignItems: mobile ? "center" : "baseline"}}>
                    <Typography variant={"h4"} component={"h4"} gutterBottom color={"#fff"} fontFamily={"'Signika Negative', sans-serif"} sx={{animation: "flyLeftIntro 1s ease-in-out forwards"}}>
                        We're now live!
                    </Typography>


                    {/*Information*/}
                    <Box sx={{display: "flex", alignItems: "center", height: "auto",opacity: 0, animation: "flyLeftIntro 1s ease-in-out forwards", animationDelay: "0.3s"}}>
                        <CalendarMonthIcon sx={{color: "#fff", marginRight: 1}} fontSize={"large"}/>
                        <Typography variant={"h6"} component={"h6"} gutterBottom color={"#fff"} sx={{margin: 0}}>
                            30th October - 4st November 2023
                        </Typography>
                    </Box>
                    <Box sx={{display: "flex", alignItems: "center", height: "auto", opacity: 0, animation: "flyLeftIntro 1s ease-in-out forwards", animationDelay: "0.6s"}}>
                        <LocationOnIcon sx={{color: "#fff", marginRight: 1}} fontSize={"large"}/>
                        <Typography variant={"h6"} component={"h6"} gutterBottom color={"#fff"} sx={{margin: 0}}>
                            SMAK PENABUR redacted
                        </Typography>
                    </Box>
                    <Button variant="contained" startIcon={<InfoIcon />} sx={{marginBottom: 2, opacity: 0, animation: "fadeIn 1s ease-in-out forwards", animationDelay: "0.8s"}} onClick={() => window.open("https://docs.google.com/spreadsheets/d/1la02A83PwZgM_OlD8xyN1hOcLF_tkeks/edit?usp=sharing&ouid=100289855580496909634&rtpof=true&sd=true", "_blank")}>
                        Jadwal Acara
                    </Button>

                    {/*End Information*/}
                    {/*<iframe style={{opacity: 0, animation: "fadeIn 1s ease-in-out forwards", animationDelay: "0.8s", maxWidth: "90vw", height: "auto", aspectRatio: "16/9"}} width="560" height="315" src="https://www.youtube.com/embed/23c23rc23r" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>*/}
                    {/*<iframe style={{opacity: 0, animation: "fadeIn 1s ease-in-out forwards", animationDelay: "0.8s", maxWidth: "90vw", height: "auto", aspectRatio: "16/9"}} width="560" height="315" src="https://www.youtube.com/embed/2rc2r23rc" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>*/}
                    {/*<iframe style={{opacity: 0, animation: "fadeIn 1s ease-in-out forwards", animationDelay: "0.8s", maxWidth: "90vw", height: "auto", aspectRatio: "16/9"}} width="560" height="315" src="https://www.youtube.com/embed/23rc23rc23rc" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>*/}
                    <iframe style={{opacity: 0, animation: "fadeIn 1s ease-in-out forwards", animationDelay: "0.8s", maxWidth: "90vw", height: "auto", aspectRatio: "16/9"}} width="560" height="315" src="https://www.youtube.com/embed/2rc23rc23rc23rc" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                </Box>
            </Box>

            <div style={{width: "100%", backgroundColor: "#fff", display: "flex", flexDirection: "column", alignItems: "center"}}>
                <div className={"page-5-title"} style={{marginTop: "100px", color: "black"}}>SPONSORED BY</div>
                <svg xmlns="http://www.w3.org/2000/svg" width="531" height="6" viewBox="0 0 531 6" fill="none" style={{marginBottom: 10}}>
                    <path
                        d="M0.113249 3L3 5.88675L5.88675 3L3 0.113249L0.113249 3ZM530.887 3L528 0.113249L525.113 3L528 5.88675L530.887 3ZM3 3.5L528 3.5L528 2.5L3 2.5L3 3.5Z"
                        fill="#000"/>
                </svg>
                <div className={"page-5-sponsors"}>
                    {sponsor.map(([, sponsor], i) => (
                        <img className={"page-5-sponsor"} key={i} src={sponsor} alt={"sponsor"}/>
                    ))}
                </div>

                <div className={"page-5-title"} style={{marginTop: "100px",color: "black"}} color={"#fff"}>SUPPORTED BY</div>
                <svg xmlns="http://www.w3.org/2000/svg" width="531" height="6" viewBox="0 0 531 6" fill="none" style={{marginBottom: 10}}>
                    <path
                        d="M0.113249 3L3 5.88675L5.88675 3L3 0.113249L0.113249 3ZM530.887 3L528 0.113249L525.113 3L528 5.88675L530.887 3ZM3 3.5L528 3.5L528 2.5L3 2.5L3 3.5Z"
                        fill="#000"/>
                </svg>
                <div className={"page-5-sponsors"}>
                    {didukung.map(([, sponsor], i) => (
                        <img className={"page-5-sponsor"} key={i} src={sponsor} alt={"sponsor"}/>
                    ))}
                </div>
            </div>
        </Box>


        <Footer/>
    </>
}