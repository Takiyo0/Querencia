import React from "react";
import {CompetitionData} from "../../rest/RestManager";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import {Analytics} from "../../rest/Analytics";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Dialog, {DialogProps} from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from "@mui/material/Typography";

const style = {
    maxWidth: 600,
    width: "95vw",
    bgcolor: 'background.paper',
    boxShadow: 24
};
export default function CompetitionModal({comp, onClose}: { comp: CompetitionData, onClose: () => void }) {
    return <Dialog
        open={true}
        onClose={onClose}
        scroll={"body"}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
    >
        <Box sx={style}>
            <DialogTitle id="scroll-dialog-title">{comp.nickname} ({comp.name})</DialogTitle>
            <DialogContent dividers={false}>
                <div className={"preregister-parent-modal-body-list"}>
                    <div className={"preregister-parent-modal-body-list-key"}> Jenjang</div>
                    <div
                        className={"preregister-parent-modal-body-list-value"}> {["RnV0c2FsIFB1dHJhUw", "TW9kZXJuIERhbmNlUw"].includes(comp.id) ? "SMA/SMP" : comp.schoolLevel === "Junior" ? "SMP" : comp.schoolLevel === "Senior" ? "SMA" : "SMA/SMP"} </div>
                </div>
                <div className={"preregister-parent-modal-body-list"}>
                    <div className={"preregister-parent-modal-body-list-key"}> Harga</div>
                    <div className={"preregister-parent-modal-body-list-value"}>{comp.oldPrice !== comp.price ? <>
                        <small>{new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR'
                        }).format(Number(comp.oldPrice))}</small><b>{new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR'
                    }).format(Number(comp.price))}</b></> : new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR'
                    }).format(Number(comp.price))} + Rp 50.000,00 WO*
                    </div>
                </div>
                <Typography variant="body2" color="text.secondary" sx={{marginTop: 2}}>
                    *WO (walk out) adalah uang jaminan untuk mengikuti acara ini sepenuhnya. Uang WO akan
                    dikembalikan saat acara berakhir dan tidak akan dikembalikan jika anda membatalkan mengikuti
                    lomba.
                </Typography>
                <div className={"preregister-parent-modal-body-list"}>
                    <div className={"preregister-parent-modal-body-list-key"}> Jumlah Peserta</div>
                    <div
                        className={"preregister-parent-modal-body-list-value"}> {comp.participants.min === -1 ? `1 Peserta` : comp.participants.min === comp.participants.max ? `${comp.participants.min} Peserta` : `${comp.participants.min} - ${comp.participants.max} Peserta`} </div>
                </div>
                <div className={"preregister-parent-modal-body-list"}>
                    <div className={"preregister-parent-modal-body-list-key"}> PIC</div>
                    <div
                        className={"preregister-parent-modal-body-list-value"}> {comp.contacts.map(({
                                                                                                        name,
                                                                                                        number
                                                                                                    }) =>
                        <span>{name} - <a
                            href={`https://wa.me/${number.split("").map((a, i) => i === 0 ? "+62" : a).join("")}`}
                            target={"_blank"}
                            rel="noopener noreferrer">{number.split("").map((a, i) => i === 0 ? "+62" : a).join("")}</a><br/></span>)}</div>
                </div>
                <div className={"preregister-parent-modal-body-list"}
                     style={{display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 0"}}>
                    <Button variant="contained" size={"large"} onClick={() => Analytics.onButtonClick([{
                        type: "register",
                        competition: comp?.nickname
                    }], (() => window.location.href = `/register/${comp.id}`)())}>Daftar
                        Sekarang</Button>
                </div>
                <div className={"preregister-parent-modal-body-title-separator"}>Teknis Permainan</div>
                <ReactMarkdown children={comp.technical} remarkPlugins={[remarkGfm]}/>
                <Button variant="contained" size={"large"} onClick={() => Analytics.onButtonClick([{
                    type: "register",
                    competition: comp?.nickname
                }], (() => window.location.href = `/register/${comp.id}`)())}
                        sx={{marginTop: "10px"}}>Daftar Sekarang</Button>
            </DialogContent>
        </Box>
    </Dialog>

}