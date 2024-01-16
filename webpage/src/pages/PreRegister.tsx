import React, {useEffect, useState} from 'react';
import {CompetitionData, RestManager} from "../rest/RestManager";
import "../css/preregister.css";
import {getImageUriFromId} from "../App";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import CircularProgress from "@mui/material/CircularProgress";
import {Analytics} from "../rest/Analytics";
import {useNavigate} from "react-router-dom";
import CompetitionModal from "./partials/CompetitionModal";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert"; // Grid version 2

const Querencia = require("../assets/images/logo.png");

export default function PreRegister() {
    const [competitions, setCompetitions] = useState<CompetitionData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedCompetition, setSelectedCompetition] = useState<CompetitionData | null>(null);
    const [openCompetitions, setOpenCompetitions] = useState<string[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const abortController = new AbortController();
        // RestManager.getCompetitionList(abortController.signal).then((data) => setCompetitions(data.competitions));
        // RestManager.getRegisterStatus(abortController.signal).then((data) => setIsOpen(data));
        Promise.all([
            RestManager.getCompetitionList(abortController.signal),
            RestManager.getRegisterStatus(abortController.signal),
            RestManager.getOpenCompetitionList(abortController.signal)
        ]).then(([data, status, openComps]) => {
            setCompetitions(data.competitions);
            setIsOpen(status);
            setOpenCompetitions(openComps.open);
        }).catch(() => setIsOpen(false)).finally(() => setLoading(false));

        return () => abortController.abort();
    }, []);

    function getDiscountPercentage(oldPrice: string, newPrice: string) {
        const [o, n] = [Number(oldPrice), Number(newPrice)];
        return Math.round((o - n) / o * 100);
    }

    return (<>
        <div className={"preregister-parent"}>
            {selectedCompetition &&
                <CompetitionModal comp={selectedCompetition} onClose={() => setSelectedCompetition(null)}/>}
            <div className={"preregister-parent-scroll"}>
                <div className={"preregister-parent-body"}>
                    <img src={Querencia} alt={"Querencia logo"} className={"preregister-parent-body-logo"}
                         onClick={() => Analytics.onButtonClick([{
                             from: "preRegister",
                             to: "home"
                         }], (() => navigate("/"))())}/>
                    {loading ? <CircularProgress sx={{color: "rgb(255,255,255)"}}/> : isOpen ? <>
                        <div className={"preregister-parent-body-title"}> Pilih kompetisi yang ingin kamu ikuti</div>
                        {/*<div className={"preregister-parent-body-competition-list"}>*/}
                        {/*    {competitions.filter(({id}) => !["RnV0c2FsIFB1dHJhSg", "TW9kZXJuIERhbmNlSg"].includes(id)).map((competition) => {*/}
                        {/*            return (<div className={"preregister-parent-body-competition-list-item"} key={competition.id} style={{backgroundImage: `url(${getImageUriFromId(competition.id)})`}} onClick={() => setSelectedCompetition(competition)}>*/}
                        {/*                <div className={"preregister-parent-body-competition-list-item-black-overlay"}/>*/}
                        {/*                <div className={"preregister-parent-body-competition-list-item-title"}>{competition.name}</div>*/}
                        {/*            </div>)*/}
                        {/*        }*/}
                        {/*    )}*/}
                        {/*</div>*/}
                        <Grid container rowSpacing={1} spacing={1} columns={{xs: 4, sm: 8, md: 12}} sx={{marginTop: 2}}>
                            {competitions.filter(({id}) => !["RnV0c2FsIFB1dHJhSg", "TW9kZXJuIERhbmNlSg"].includes(id)).map((competition, index) => {
                                    return <Grid xs={4} sm={4} md={4} key={index}>
                                        <Card sx={{maxWidth: 345, position: "relative", overflow: "hidden"}}>
                                            {!openCompetitions.includes(competition.id) && <Box sx={{position: "absolute", top: 0, left: 0, bottom: 0, right: 0, backgroundColor: "rgba(44,44,44,0.93)", zIndex: 501, display: "flex", alignItems: "center", justifyContent: "center"}}>
                                                <Typography variant="h5" color="text.primary" sx={{padding: 1}}>
                                                    Sudah Tutup
                                                </Typography>
                                            </Box>}
                                                <CardMedia
                                                sx={{height: 140}}
                                                image={getImageUriFromId(competition.id)}
                                                title={competition.name}
                                            />
                                            {competition.price !== competition.oldPrice && <div
                                                className="ribbon text-center">{getDiscountPercentage(competition.oldPrice, competition.price)}%<br/>Diskon!
                                            </div>}
                                            <CardContent>
                                                <Typography gutterBottom variant="h5" component="div">
                                                    {competition.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Jenjang: {["RnV0c2FsIFB1dHJhUw", "TW9kZXJuIERhbmNlUw"].includes(competition.id) ? "SMA/SMP" : ["VmlkZW8gRWRpdGluZ1M"].includes(competition.id) ? "Umum" : competition.schoolLevel === "Junior" ? "SMP" : competition.schoolLevel === "Senior" ? "SMA" : "Umum (SMA & SMP)"}<br/>
                                                    Harga: {competition.price !== competition.oldPrice ? <><small style={{
                                                    color: "#ff7373",
                                                    fontSize: "12px",
                                                    textDecoration: "line-through",
                                                    marginRight: "3px"
                                                }}>{new Intl.NumberFormat('id-ID', {
                                                    style: 'currency',
                                                    currency: 'IDR'
                                                }).format(Number(competition.oldPrice))}</small><b>{new Intl.NumberFormat('id-ID', {
                                                    style: 'currency',
                                                    currency: 'IDR'
                                                }).format(Number(competition.price))}</b></> : new Intl.NumberFormat('id-ID', {
                                                    style: 'currency',
                                                    currency: 'IDR'
                                                }).format(Number(competition.price))} <br/> + Rp 50.000,00 WO<br/>
                                                </Typography>
                                            </CardContent>
                                            <CardActions>
                                                <Button size="small" onClick={() => Analytics.onButtonClick([{
                                                    type: "preRegister",
                                                    competition: competition.nickname
                                                }], setSelectedCompetition(competition))}>Info / Daftar</Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                }
                            )}
                        </Grid>

                        <Typography variant="body2" color="text.secondary" sx={{marginTop: 2}}>
                            *WO (walk out) adalah uang jaminan untuk mengikuti acara ini sepenuhnya. Uang WO akan
                            dikembalikan saat acara berakhir dan tidak akan dikembalikan jika anda membatalkan mengikuti
                            lomba.
                        </Typography>
                    </> : <>
                        <div className={"preregister-parent-body-title"}> Pendaftaran sudah tutup </div>
                        <Alert severity="info" sx={{marginTop: 2}}>Harap untuk melengkapi kelengkapan data yang belum lengkap melalui: <br/> - redacted (redacted) <br/> - redacted (redacted) <br/> -
                            redacted (redacted) </Alert>
                    </>}
                </div>
            </div>
        </div>
    </>)
}