import React from "react";
import {useParams} from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {CompetitionData, RestManager} from "../rest/RestManager";
import {VisuallyHiddenInput, trimText, downloadTemplate} from "./RegisterBeta";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import LoadingButton from "@mui/lab/LoadingButton";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";
import WarningIcon from '@mui/icons-material/Warning';

export default function RegisterCompletion() {
    const {id} = useParams<{ id: string }>();
    const [competition, setCompetition] = React.useState<CompetitionData>();
    const [data, setData] = React.useState<{
        passPhotoAndStudentCard: string,
        teacherPassPhoto: string,
        schoolLetter: string,
        paymentProof: string
    } | undefined>();
    const [registrationDate, setRegistrationDate] = React.useState<Date | undefined>();
    const query = new URLSearchParams(window.location.search);
    const [passPhotoAndStudentCardFile, setPassPhotoAndStudentCardFile] = React.useState<React.ChangeEvent<HTMLInputElement> | null>(null);
    const [teacherPassPhotoFile, setTeacherPassPhotoFile] = React.useState<React.ChangeEvent<HTMLInputElement> | null>(null);
    const [statementLetterFile, setStatementLetterFile] = React.useState<React.ChangeEvent<HTMLInputElement> | null>(null);
    const [paymentFile, setPaymentFile] = React.useState<React.ChangeEvent<HTMLInputElement> | null>(null);
    const [uploadError, setUploadError] = React.useState<string>("");
    const [uploadLoading, setUploadLoading] = React.useState<boolean>(false);
    const [allowSend, setAllowSend] = React.useState(false);
    const [progress, setProgress] = React.useState<number>(-1);

    const [loading, setLoading] = React.useState<"loadingPage" | "invalidRequestData" | "notFound" | "invalidToken" | "dataCompletedAlready" | "dataIsNotPending" | "unknownError" | "done">("loadingPage");
    const abort = React.useMemo(() => new AbortController(), []);
    React.useEffect(() => {
        fetch();
        return () => abort.abort();
    }, []);

    function fetch() {
        setLoading("loadingPage");
        RestManager.getRegistrationCompletionStatus(abort.signal, id!, query.get("token") ?? "").then(res => {
            if (res.success) {
                setCompetition(res.registerData.competitionData);
                setData(res.data);
                setRegistrationDate(res.registerData.dateRegistered);
                setLoading("done");
            }
        }).catch((reason) => {
            console.log(reason.response.data.error);
            switch (reason?.response?.data?.error) {
                case "Invalid data.":
                    return setLoading("invalidRequestData");

                case "Registration not found.":
                    return setLoading("notFound");

                case "Invalid token.":
                    return setLoading("invalidToken");

                case "Registration not pending.":
                    return setLoading("dataIsNotPending");

                case "Data already finished.":
                    return setLoading("dataCompletedAlready");

                default:
                    return setLoading("unknownError");
            }
        })
    }

    React.useEffect(() => {
        setAllowSend(!!(passPhotoAndStudentCardFile?.target?.files?.[0] || teacherPassPhotoFile?.target?.files?.[0] || statementLetterFile?.target?.files?.[0] || paymentFile?.target?.files?.[0]));
    }, [passPhotoAndStudentCardFile, teacherPassPhotoFile, statementLetterFile, paymentFile]);

    async function send() {
        setUploadError("");
        setProgress(-1);
        if (!allowSend) return;
        setUploadLoading(true);
        const formData = new FormData();
        if (passPhotoAndStudentCardFile?.target?.files?.[0]) formData.append("passPhoto", passPhotoAndStudentCardFile.target.files[0], passPhotoAndStudentCardFile.target.files[0].name);
        if (teacherPassPhotoFile?.target?.files?.[0]) formData.append("tchrPassPhoto", teacherPassPhotoFile.target.files[0], teacherPassPhotoFile.target.files[0].name);
        if (statementLetterFile?.target?.files?.[0]) formData.append("schoolLetter", statementLetterFile.target.files[0], statementLetterFile.target.files[0].name);
        if (paymentFile?.target?.files?.[0]) formData.append("paymentProof", paymentFile.target.files[0], paymentFile.target.files[0].name);

        const response = await RestManager.completeRegister(abort.signal, id!, query.get("token") ?? "", formData, (progress: number) => {
            setProgress(progress);
        }).catch(err => `Error: ${err}`).finally(() => {
            setUploadLoading(false);
            setProgress(-1);
        });
        if (typeof response === "string") setUploadError(response);
        else fetch();
    }

    return <Box sx={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#101418",
        zIndex: -1,
        overflowY: "auto"
    }}>
        <Box sx={{
            maxWidth: "550px",
            width: "90vw",
            backgroundColor: "rgb(31 37 44)",
            left: "50%",
            transform: "translateX(-50%)",
            borderRadius: "10px",
            margin: "100px 0",
            position: "relative",
        }}>
            <Box sx={{
                backgroundImage: `url(https://cdn.redacted.redacted/zhdnIYcMSrPb.webp)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "100%",
                height: 200,
                borderTopLeftRadius: "10px",
                borderTopRightRadius: "10px"
            }}/>
            <Box sx={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "100%",
                height: "200px",
                backgroundColor: "#00000080",
                borderTopLeftRadius: "10px",
                borderTopRightRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <Typography variant="h4" component="h4" gutterBottom color={"#fff"} style={{margin: "0"}}>
                    Kelengkapan Data
                </Typography>
            </Box>
            {loading === "loadingPage" && <Box sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                boxSizing: "border-box"
            }}><CircularProgress sx={{color: "rgb(255,255,255)"}}/></Box>}
            {!["loadingPage", "done"].includes(loading) && <Box sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                padding: "20px",
                boxSizing: "border-box"
            }}>
                <WarningIcon sx={{fontSize: 80}} color={"error"}/>
                <Typography variant="h6" component="h6" gutterBottom color={"#fff"} style={{margin: "20px 0"}}>
                    {loading}
                </Typography>
            </Box>}
            {loading === "done" && <Box sx={{
                padding: "20px"
            }}>
                <TextField id={"lomba"} variant="outlined"
                           sx={{width: "100%"}}
                           size={"medium"} disabled
                           value={competition ? `${competition.nickname} (${competition.name})` : "Loading..."}/>
                <TextField id={"lomba"} variant="outlined"
                           sx={{width: "100%", marginTop: '10px'}}
                           size={"medium"} disabled
                           value={competition ? (competition.schoolLevel === "Junior" ? "SMP" : competition?.schoolLevel === "Senior" ? "SMA" : "SMP/SMA") : "Loading..."}/>
                <TextField id={"lomba"} variant="outlined"
                           sx={{width: "100%", marginTop: '10px'}}
                           size={"medium"} disabled
                           value={registrationDate ? `Terdaftar ${(new Date(registrationDate).toLocaleString())}` : "Loading..."}/>


                {data && data.passPhotoAndStudentCard === "" && <>
                    <Typography variant="h6" component="h6" gutterBottom color={"#fff"}
                                style={{margin: "20px 0"}}>Pas Foto dan Kartu Pelajar
                        Peserta </Typography>
                    <Typography variant="subtitle2" component="h6" gutterBottom color={"#fff"}
                                style={{margin: "20px 0"}}>Silahkan mendownload dan mengisi docs
                        template dibawa ini. Kemudian upload dengan format PDF </Typography>
                    <Button variant="outlined" startIcon={<DownloadIcon/>} sx={{marginRight: 2}}
                            onClick={() => downloadTemplate(competition?.participants.min === -1 ? "https://cdn.redacted.redacted/RtNCgmsNz84h.docx" : "https://cdn.redacted.redacted/AyNIipDnzSbG.docx", "Template Pas Foto")}>
                        Unduh template
                    </Button>
                    <Button component="label" variant="contained" startIcon={<CloudUploadIcon/>}
                            disabled={uploadLoading}>
                        Unggah file
                        [{passPhotoAndStudentCardFile?.target?.files ? trimText(passPhotoAndStudentCardFile.target.files[0]?.name, 10) : "Belum ada file"}]
                        <VisuallyHiddenInput type="file"
                                             onChange={e => setPassPhotoAndStudentCardFile(e)}/>
                    </Button>

                    <hr/>
                </>}

                {data && !["VmlkZW8gRWRpdGluZ1M"].includes(competition?.id ?? "") && data.teacherPassPhoto === "" && <>
                    <Typography variant="h6" component="h6" gutterBottom color={"#fff"}
                                style={{margin: "20px 0"}}>Pas Foto Pendamping </Typography>
                    <Typography variant="subtitle2" component="h6" gutterBottom color={"#fff"}
                                style={{margin: "20px 0"}}>Silahkan mengupload pas foto terbaru guru
                        pendamping dengan format PNG/JPG </Typography>
                    <Button component="label" variant="contained" startIcon={<CloudUploadIcon/>}
                            disabled={uploadLoading}>
                        Unggah pas foto pendamping
                        [{teacherPassPhotoFile?.target?.files ? trimText(teacherPassPhotoFile.target.files[0]?.name, 10) : "Belum ada file"}]
                        <VisuallyHiddenInput type="file" onChange={e => setTeacherPassPhotoFile(e)}/>
                    </Button>

                    <hr/>
                </>}
                {data && !["VmlkZW8gRWRpdGluZ1M"].includes(competition?.id ?? "") && data.schoolLetter === "" && <>
                    <Typography variant="h6" component="h6" gutterBottom color={"#fff"}
                                style={{margin: "20px 0"}}>Surat Keterangan Sekolah </Typography>
                    <Typography variant="subtitle2" component="h6" gutterBottom color={"#fff"}
                                style={{margin: "20px 0"}}>Silahkan mengupload surat keterangan
                        sekolah dengan format PNG/JPG </Typography>
                    <Button component="label" variant="contained" startIcon={<CloudUploadIcon/>}
                            disabled={uploadLoading}>
                        Unggah surat keterangan sekolah
                        [{statementLetterFile?.target?.files ? trimText(statementLetterFile.target.files[0]?.name, 10) : "Belum ada file"}]
                        <VisuallyHiddenInput type="file" onChange={e => setStatementLetterFile(e)}/>
                    </Button>

                    <hr/>
                </>}

                {data && data.paymentProof === "" && <>
                    <Typography variant="h6" component="h6" gutterBottom color={"#fff"}
                                style={{margin: "20px 0"}}>Bukti Pembayaran </Typography>
                    <Typography variant="subtitle2" component="h6" gutterBottom color={"#fff"}
                                style={{margin: "20px 0"}}>Silahkan mengupload sejumlah: <br/> -
                        Harga lomba : {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR'
                        }).format(Number(competition?.price ?? 0))} <br/> - Walkout (WO) : Rp
                        50.000,00 <br/> <strong>TOTAL : {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR'
                        }).format(Number((competition?.price ?? 0)) + 50000)}</strong> melalui BCA
                        a.n. Nunut Dumariana 6800365757 </Typography>
                    <Button component="label" variant="contained" startIcon={<CloudUploadIcon/>}
                            disabled={uploadLoading}
                            sx={{marginBottom: 3}}>
                        Unggah bukti pembayaran
                        [{paymentFile?.target?.files ? trimText(paymentFile.target.files[0]?.name, 10) : "Belum ada file"}]
                        <VisuallyHiddenInput type="file" onChange={e => setPaymentFile(e)}/>
                    </Button>
                </>}

                <LoadingButton variant="contained" loading={uploadLoading} autoFocus sx={{width: "100%", marginTop: 1}}
                               disabled={!allowSend}
                               onClick={() => send()}>
                    Kirim
                </LoadingButton>
                {progress !== -1 && <LinearProgress variant="determinate" value={progress} sx={{marginTop: 2}}/>}
                {uploadError !== "" && <Alert severity="error" sx={{marginTop: 2}}>{uploadError}</Alert>}
                <Alert severity="info" sx={{marginTop: 2}}>Untuk info terkait kelengkapan data, silahkan
                    menghubungi: <br/> - redacted (redacted) <br/> - redacted (redacted) <br/> -
                    redacted (redacted) </Alert>
            </Box>}
        </Box>
    </Box>
}