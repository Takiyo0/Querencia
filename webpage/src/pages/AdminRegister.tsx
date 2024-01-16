import React from "react";
import "../css/admin.css";
import {Document, Page} from 'react-pdf';
import {useParams, useNavigate} from "react-router-dom";
import {RegistrationData, RestManager} from "../rest/RestManager";
import Viewer from 'react-viewer';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {JsonView, allExpanded, darkStyles, defaultStyles} from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import Chip from '@mui/material/Chip';
import {ToastContainer, toast} from 'react-toastify';
import WarningIcon from '@mui/icons-material/Warning';
import Alert from '@mui/material/Alert';
import 'react-toastify/dist/ReactToastify.css';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import {Analytics} from "../rest/Analytics";

export default function AdminRegister() {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [registration, setRegistration] = React.useState<RegistrationData | null>(null);
    const [modal, setModal] = React.useState<"none" | "approve" | "reject">("none");
    const [rejectReason, setRejectReason] = React.useState<string>("");
    const signal = React.useMemo(() => new AbortController(), []);
    const [imageViewer, setImageViewer] = React.useState<string[]>([]);
    const [error, setError] = React.useState<string>("");

    React.useEffect(() => {
        refreshData();
        return () => signal.abort();
    }, []);

    function refreshData() {
        RestManager.getRegistration(signal.signal, id).then((registration) => !registration?.data ? setError("Registration not found") : setRegistration(registration.data)).catch((d) => {
            setError(d);
            setRegistration(null);
        });
    }

    function renderPreview(link: string) {
        if (link.endsWith(".pdf")) {
            return <Document file={link} onLoadError={(e) => console.log(e)}>
                <Page pageNumber={1} width={200} height={400}/>
            </Document>
        } else {
            return <img src={link} alt={"Preview"}/>
        }
    }

    return (<>
        <ToastContainer
            position="bottom-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss={false}
            draggable={false}
            pauseOnHover={false}
            theme="light"
        />
        <Viewer
            visible={imageViewer.length > 0}
            onClose={() => {
                setImageViewer([])
            }}
            images={imageViewer.map((link) => ({src: link, alt: "Preview"}))}
        />

        {modal !== "none" && <div className={"admin-register-modal-parent"} onClick={() => setModal("none")}>
            <div className={"admin-register-modal"} onClick={(e) => e.stopPropagation()}>
                <button className={"admin-register-modal-close"} onClick={() => setModal("none")}>X</button>
                <h2>{modal === "approve" ? `Terima Pembayaran ${id}?` : `Tolak Pembayaran ${id}?`}</h2>
                <hr style={{width: "100%"}}/>
                <p>{modal === "approve" ?
                    <>
                        <span>Pastikan bahwa data pembayaran sudah benar dan sesuai dengan data yang diunggah oleh peserta. Sistem akan mengirimkan email kepada peserta bahwa pembayaran telah diterima serta mengirimkan tiket ke email peserta.</span>
                        <span>Apakah anda yakin ingin menerima pembayaran ini?</span>
                    </>
                    : <>
                        <span>Pastikan bahwa data pembayaran sudah benar dan sesuai dengan data yang diunggah oleh peserta. Sistem akan mengirimkan email kepada peserta bahwa pembayaran ditolak. <b>PENDAFTARAN YANG DITOLAK TIDAK BISA DIKEMBALIKAN.</b> Apakah anda yakin ingin menolak pembayaran ini?</span><br/>
                        <span>Alasan penolakan:</span><br/>
                        <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                                  placeholder={"Alasan penolakan"}
                                  style={{maxWidth: "100%", minWidth: "100%", minHeight: "60px", maxHeight: "200px"}}/>
                    </>}</p>
                <div className={"admin-register-modal-buttons"}>
                    <button onClick={() => setModal("none")}>Saya ingin mengecek lagi</button>
                    <button onClick={() => {
                        Analytics.onButtonClick([{
                            type: "admin",
                            action: modal === "approve" ? "approve" : "reject",
                            rejectReason
                        }], (() => void 0)());
                        if (modal === "approve") {
                            toast.promise(RestManager.approveRegistration(signal.signal, id ?? ""), {
                                pending: "Memproses...",
                                success: "Registrasi berhasil diterima!",
                                error: "Registrasi gagal diterima!"
                            }).then(() => refreshData()).catch(() => refreshData());
                        } else {
                            toast.promise(RestManager.rejectRegistration(signal.signal, id ?? "", rejectReason), {
                                pending: "Memproses...",
                                success: "Registrasi berhasil ditolak!",
                                error: "Registrasi gagal ditolak!"
                            }).then(() => refreshData()).catch(() => refreshData());
                        }
                    }}
                            className={modal === "approve" ? "admin-register-modal-buttons-approve" : "admin-register-modal-buttons-reject"}>{modal === "approve" ? "Terima Pembayaran" : "Tolak Pembayaran"}
                    </button>
                </div>
            </div>
        </div>}

        <Button component="label" variant="contained" startIcon={<ArrowBackIcon/>}
                onClick={() => navigate("/admin/registers")}>
            Kembali
        </Button>

        {registration ? <>
            <div className={"admin-register-data"}>
                <div className={"admin-register-data-values-parent"}>
                    <div className={"admin-register-data-values"}>
                        <h2>Data Lomba</h2>
                        {Object.entries(registration.competitionData).filter(([key]) => ["name", "price", "nickname", "schoolLevel"].includes(key)).map(([key, value]) =>
                            <p>{`${key}: ${trimString(value, 50)}`}</p>)}
                    </div>
                    <div className={"admin-register-data-values"}>
                        <h2>Data Peserta</h2>
                        {Object.entries(registration.data.participant).map(([key, value]) =>
                            <p>{`${value[0]}: ${value[1]}`}</p>)}
                    </div>
                    {!["VmlkZW8gRWRpdGluZ1M"].includes(registration.competitionData.id) &&
                        <div className={"admin-register-data-values"}>
                            <h2>Data Pendamping</h2>
                            {Object.entries(registration.data.teacher).map(([key, value]) =>
                                <p>{`${value[0]}: ${value[1]}`}</p>)}
                        </div>}
                    <div className={"admin-register-data-values"}>
                        <h2>Kelengkapan Data</h2>
                        <div className={"admin-register-data-values-completeness"}>
                            <div className={"admin-register-data-values-completeness-item"}>
                                <h3>Pas Foto dan Kartu Pelajar
                                    {registration.data.files.passPhotoAndStudentCard === "" &&
                                        <Chip color="error" size={"small"} label="Belum diupload"
                                              icon={<WarningIcon/>}/>}
                                </h3>
                                <a href={registration.data.files.passPhotoAndStudentCard} target={"_blank"}
                                   rel="noreferrer">Preview</a>&nbsp;&nbsp;
                                <a href={`/rest/file/download?url=${registration.data.files.passPhotoAndStudentCard}`}
                                   target={"_blank"}
                                   rel="noreferrer">Download</a><br/>
                                <span>Format yang diterima: {registration.data.files.passPhotoAndStudentCard.split(".")[3]}</span><br/>
                                {registration.data.files.passPhotoAndStudentCard.endsWith(".pdf") ? renderPreview(registration.data.files.passPhotoAndStudentCard) :
                                    <div
                                        className={"admin-register-data-values-completeness-preview"}
                                        onClick={() => setImageViewer([registration.data.files.passPhotoAndStudentCard])}>{renderPreview(registration.data.files.passPhotoAndStudentCard)}</div>}
                            </div>
                            {!["VmlkZW8gRWRpdGluZ1M"].includes(registration.competitionData.id) && <>
                                <div className={"admin-register-data-values-completeness-item"}>
                                    <h3>Pas Foto Pendamping
                                        {registration.data.files.teacherPassPhoto === "" &&
                                            <Chip color="error" size={"small"} label="Belum diupload"
                                                  icon={<WarningIcon/>}/>}</h3>
                                    <a href={registration.data.files.teacherPassPhoto} target={"_blank"}
                                       rel="noreferrer">Preview</a> &nbsp;&nbsp;
                                    <a href={`/rest/file/download?url=${registration.data.files.teacherPassPhoto}`}
                                       target={"_blank"}
                                       rel="noreferrer">Download</a><br/>
                                    <span>Format yang diterima: {registration.data.files.teacherPassPhoto.split(".")[3]}</span><br/>
                                    {registration.data.files.teacherPassPhoto.endsWith(".pdf") ? renderPreview(registration.data.files.teacherPassPhoto) :
                                        <div
                                            className={"admin-register-data-values-completeness-preview"}
                                            onClick={() => setImageViewer([registration.data.files.teacherPassPhoto])}
                                        >{renderPreview(registration.data.files.teacherPassPhoto)}</div>}
                                </div>

                                <div className={"admin-register-data-values-completeness-item"}>
                                    <h3>Surat Keterangan Sekolah
                                        {registration.data.files.schoolLetter === "" &&
                                            <Chip color="error" size={"small"} label="Belum diupload"
                                                  icon={<WarningIcon/>}/>}</h3>
                                    <a href={registration.data.files.schoolLetter} target={"_blank"}
                                       rel="noreferrer">Preview</a>&nbsp;&nbsp;
                                    <a href={`/rest/file/download?url=${registration.data.files.schoolLetter}`}
                                       target={"_blank"}
                                       rel="noreferrer">Download</a><br/>
                                    <span>Format yang diterima: {registration.data.files.schoolLetter.split(".")[3]}</span><br/>
                                    {registration.data.files.schoolLetter.endsWith(".pdf") ? renderPreview(registration.data.files.schoolLetter) :
                                        <div
                                            className={"admin-register-data-values-completeness-preview"}
                                            onClick={() => setImageViewer([registration.data.files.schoolLetter])}
                                        >{renderPreview(registration.data.files.schoolLetter)}</div>}
                                </div>
                            </>}

                            <div className={"admin-register-data-values-completeness-item"}>
                                <h3>Bukti Pembayaran
                                    {registration.data.files.paymentProof === "" &&
                                        <Chip color="error" label="Belum diupload" size={"small"}
                                              icon={<WarningIcon/>}/>}</h3>
                                <a href={registration.data.files.paymentProof} target={"_blank"}
                                   rel="noreferrer">Preview</a>&nbsp;&nbsp;
                                <a href={`/rest/file/download?url=${registration.data.files.paymentProof}`}
                                   target={"_blank"}
                                   rel="noreferrer">Download</a><br/>
                                <span>Format yang diterima: {registration.data.files.paymentProof.split(".")[3]}</span><br/>
                                {registration.data.files.paymentProof.endsWith(".pdf") ? renderPreview(registration.data.files.paymentProof) :
                                    <div
                                        className={"admin-register-data-values-completeness-preview"}
                                        onClick={() => setImageViewer([registration.data.files.paymentProof])}>{renderPreview(registration.data.files.paymentProof)}</div>}
                            </div>
                        </div>
                    </div>
                    <div className={"admin-register-data-values"}>
                        <h2>Aksi</h2>
                        <div className={"admin-register-data-values-actions"}>
                            <div className={"admin-register-data-values-actions-item"}
                                 style={{backgroundColor: registration.status.toLowerCase() === "pending" ? "#ffcc00" : registration.status.toLowerCase() === "confirmed" ? "#00ff00" : "#ff0000"}}>
                                <h3>Status</h3>
                                <p>{registration.status}</p>
                            </div>
                            {registration.status.toLowerCase() === "confirmed" &&
                                <div className={"admin-register-data-values-actions-item"}>
                                    <h3>Dikonfirmasi Oleh</h3>
                                    <p>{registration.confirmedBy} ({new Date(registration.dateConfirmed).toLocaleString()})</p>
                                </div>}
                            <div className={"admin-register-data-values-actions-item"}>
                                <h3>ID Tiket</h3>
                                <p>{registration.ticketId}</p>
                            </div>
                            <Alert severity="warning" sx={{maxWidth: "250px"}}>Pastikan peserta sudah mengunggah seluruh
                                data atau jika suatu
                                kondisi tercapai sebelum menerima registrasi.</Alert>
                            <Alert severity="warning" sx={{maxWidth: "250px"}}>Jika terjadi ketidakselarasan data,
                                silahkan hubungi administrator situs (arya).</Alert>
                            <div
                                className={`admin-register-data-values-actions-item admin-register-data-values-actions-item-button ${["confirmed", "rejected"].includes(registration.status.toLowerCase()) ? "admin-register-data-values-actions-item-button-disabled" : ""}`}
                                onClick={() => setModal("approve")}>
                                Terima Pembayaran
                            </div>
                            <div
                                className={`admin-register-data-values-actions-item admin-register-data-values-actions-item-button admin-register-data-values-actions-item-button-red ${registration.status.toLowerCase() === "rejected" ? "admin-register-data-values-actions-item-button-disabled" : ""}`}
                                onClick={() => setModal("reject")}>
                                Tolak Pembayaran
                            </div>
                        </div>
                    </div>

                    <div className={"admin-register-data-values"}>
                        <h2>Raw Data</h2>
                        <br/>
                        <React.Fragment>
                            <JsonView data={registration} style={defaultStyles}
                                      shouldExpandNode={(level: number, value: any) => {
                                          return !value?.contacts;
                                      }}/>
                        </React.Fragment>
                    </div>
                </div>
            </div>
        </> : error === "" ? <CircularProgress sx={{color: "rgb(255,255,255)"}}/> :
            <p style={{color: "rgb(255,255,255)"}}>{error}</p>}
    </>)
}

export function trimString(str: string, n: number) {
    return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
}