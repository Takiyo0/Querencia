import React, {useState} from "react";
import {CompetitionData, RestManager} from "../rest/RestManager";
import "../css/register.css";
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import {getImageUriFromId} from "../App";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import {styled} from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import ButtonGroup from '@mui/material/ButtonGroup';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import LoadingButton from '@mui/lab/LoadingButton';
import SendIcon from '@mui/icons-material/Send';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {Analytics} from "../rest/Analytics";
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

export const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});


export default function RegisterBeta() {
    const [loading, setLoading] = React.useState(true);
    const [competition, setCompetition] = React.useState<CompetitionData>();
    const [competitions, setCompetitions] = React.useState<CompetitionData[]>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [page, setPage] = React.useState<0 | 1 | 2>(0);
    const [data, setData] = React.useState<{ [key: string]: string | string[] }>({}); // page-type, value
    const [passPhotoAndStudentCardFile, setPassPhotoAndStudentCardFile] = React.useState<React.ChangeEvent<HTMLInputElement> | null>(null);
    const [teacherPassPhotoFile, setTeacherPassPhotoFile] = React.useState<React.ChangeEvent<HTMLInputElement> | null>(null);
    const [statementLetterFile, setStatementLetterFile] = React.useState<React.ChangeEvent<HTMLInputElement> | null>(null);
    const [paymentFile, setPaymentFile] = React.useState<React.ChangeEvent<HTMLInputElement> | null>(null);
    const [customCompetitionId, setCustomCompetitionId] = React.useState<string>("");
    const sessionId = React.useMemo(() => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), []);
    const [registOpen, setRegistOpen] = React.useState<boolean>(true);
    const [error, setError] = React.useState<{ '0': boolean, '1': boolean, '2': boolean }>({
        '0': false,
        '1': false,
        '2': false
    });
    const [competitionClosed, setCompetitionClosed] = React.useState<boolean>(false);
    const [uploadError, setUploadError] = React.useState<string>("");
    const [unfinishedDocs, setUnfinishedDocs] = React.useState<string[]>([]);

    const params = window.location.pathname.split("/");
    const [stepPassed, setStepPassed] = React.useState<number[]>([]);
    const [progress, setProgress] = React.useState<number>(-1);
    const [videoSponsor, setVideoSponsor] = React.useState<string>("");
    const [sponsorTimeLeft, setSponsorTimeLeft] = React.useState<number>(6);
    const [banner, setBanner] = React.useState<string>("");

    const sponsorTimeout = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        const abortController = new AbortController();

        if (params[2] === "RnV0c2FsIFB1dHJhUw") setCustomCompetitionId("RnV0c2FsIFB1dHJhUw"); // futsal
        if (params[2] === "TW9kZXJuIERhbmNlUw") setCustomCompetitionId("TW9kZXJuIERhbmNlUw"); // md
        if (params[2] === "RnV0c2FsIFB1dHJhSg") {
            window.location.href = "/register/RnV0c2FsIFB1dHJhUw"; // futsal
            setCustomCompetitionId("RnV0c2FsIFB1dHJhUw");
        }
        if (params[2] === "TW9kZXJuIERhbmNlSg") {
            window.location.href = "/register/TW9kZXJuIERhbmNlUw"; // md
            setCustomCompetitionId("TW9kZXJuIERhbmNlUw");
        } // md
        else {
            RestManager.getRegisterStatus(abortController.signal).then((data) => setIsOpen(data));
            RestManager.getCompetitionList(abortController.signal).then((data) => {
                setCompetitions(data.competitions);
                const comp = data.competitions.find((competition) => competition.id === params[2]);
                setBanner(getImageUriFromId(comp?.id ?? ""));
                setCompetition(comp);
                setLoading(false);
            });
            RestManager.getOpenCompetitionList(abortController.signal).then((data) => {
                if (!data.open.includes(params[2])) setCompetitionClosed(true);
            });
        }

        sponsorTimeout.current = setTimeout(() => setVideoSponsor(""), 10 * 1000);
        RestManager.getRegisterStatus(abortController.signal).then((data) => setRegistOpen(data));

        return () => {
            abortController.abort();
            if (sponsorTimeout.current) clearTimeout(sponsorTimeout.current);
        };
    }, []);

    const steps = ['Data peserta', 'Data pendamping', 'Kelengkapan Registrasi'];
    const isStepFailed = (step: number) => {
        const errors: string[] = [];
        Object.entries(error).forEach(([key, value]) => value && errors.push(key));
        return errors.includes(`${step}`) && stepPassed.includes(step);
    };

    function RenderRegisterInput(page: 0 | 1 | 2, type: string, index: number) {
        switch (type) {
            case "name":
                return <Box key={index}
                            sx={{width: "100%", margin: "15px 0", padding: "0 10px", boxSizing: "border-box"}}>
                    <TextField id={type + "-input"} label={"Nama"} variant="outlined" sx={{width: "100%"}}
                               size={"medium"}
                               error={error[`${page}`] && !data[`${page}-${type}`]}
                               helperText={error[`${page}`] && !data[`${page}-${type}`] ? "Nama tidak boleh kosong" : ""}
                               onChange={e => setData(d => ({...d, [`${page}-${type}`]: e.target.value}))}
                               value={data[`${page}-${type}`]}
                               required={true}/>
                </Box>

            case "team_name":
                return <Box key={index}
                            sx={{width: "100%", margin: "15px 0", padding: "0 10px", boxSizing: "border-box"}}>
                    <TextField id={type + "-input"} label={"Nama Tim"} variant="outlined" sx={{width: "100%"}}
                               size={"medium"}
                               error={error[`${page}`] && !data[`${page}-${type}`]}
                               helperText={error[`${page}`] && !data[`${page}-${type}`] ? "Nama tim tidak boleh kosong" : ""}
                               onChange={e => setData(d => ({...d, [`${page}-${type}`]: e.target.value}))}
                               value={data[`${page}-${type}`]}
                               required={true}/>
                </Box>

            case "school":
                return <Box key={index}
                            sx={{width: "100%", margin: "15px 0", padding: "0 10px", boxSizing: "border-box"}}>
                    <TextField id={type + "-input"} label={"Asal Sekolah"} variant="outlined" sx={{width: "100%"}}
                               size={"medium"}
                               error={error[`${page}`] && !data[`${page}-${type}`]}
                               onChange={e => setData(d => ({...d, [`${page}-${type}`]: e.target.value}))}
                               value={data[`${page}-${type}`]}
                               required={true}/>
                </Box>

            case "email":
                return <Box key={index}
                            sx={{width: "100%", margin: "15px 0", padding: "0 10px", boxSizing: "border-box"}}>
                    <TextField id={type + "-input"} label={"Email"} variant="outlined" sx={{width: "100%"}}
                               placeholder={"dummy@hello.com"}
                               size={"medium"}
                               onChange={e => setData(d => ({...d, [`${page}-${type}`]: e.target.value}))}
                               error={error[`${page}`] && (!data[`${page}-${type}`] || !validateEmail(data[`${page}-${type}`] as string))}
                               helperText={error[`${page}`] && (!data[`${page}-${type}`] || !validateEmail(data[`${page}-${type}`] as string)) ? "Email tidak boleh kosong dan harus valid" : ""}
                               value={data[`${page}-${type}`]}
                               required={true}/>
                    <Typography variant="body1" component="div" gutterBottom color={"#fd6a6a"}>*Email ini akan digunakan
                        untuk mengirimkan informasi terkait lomba. Pastikan email yang kamu masukkan adalah email yang
                        valid.</Typography>
                </Box>

            case "phone":
                return <Box key={index}
                            sx={{width: "100%", margin: "15px 0", padding: "0 10px", boxSizing: "border-box"}}>
                    <TextField id={type + "-input"} label={"Nomor Telepon"} variant="outlined" sx={{width: "100%"}}
                               size={"medium"} placeholder={"08xxxxxxxxxx"}
                               error={error[`${page}`] && (!data[`${page}-${type}`] || !new RegExp(/^(^\+62|62|^08)(\d{3,4}-?){2}\d{3,4}$/g).test(data[`${page}-${type}`] as string))}
                               helperText={error[`${page}`] && (!data[`${page}-${type}`] || !new RegExp(/^(^\+62|62|^08)(\d{3,4}-?){2}\d{3,4}$/g).test(data[`${page}-${type}`] as string)) ? "Nomor telepon tidak boleh kosong dan harus valid" : ""}
                               onChange={e => setData(d => ({...d, [`${page}-${type}`]: e.target.value}))}
                               value={data[`${page}-${type}`]}
                               required={true}/>
                </Box>

            case "class":
                return <Box key={index}
                            sx={{width: "100%", margin: "15px 0", padding: "0 10px", boxSizing: "border-box"}}>
                    <TextField id={type + "-input"} label={"Kelas"} variant="outlined" sx={{width: "100%"}}
                               size={"medium"}
                               error={error[`${page}`] && !data[`${page}-${type}`]}
                               helperText={error[`${page}`] && !data[`${page}-${type}`] ? "Kelas tidak boleh kosong" : ""}
                               onChange={e => setData(d => ({...d, [`${page}-${type}`]: e.target.value}))}
                               value={data[`${page}-${type}`]}
                               required={true}/>
                </Box>

            case "gender":
                return <div className={"register-parent-body-input"} key={index}>
                    <div className={"register-parent-body-input-title"}> Jenis Kelamin</div>
                    <select className={"register-parent-body-input-input"}
                            onChange={e => setData(d => ({...d, [`${page}-${type}`]: e.target.value}))}
                            value={data[`${page}-${type}`]}>
                        <option value={""}>Pilih satu</option>
                        <option value={"male"}>Laki-laki</option>
                        <option value={"female"}>Perempuan</option>
                    </select>
                </div>

            case "is_backup":
                return <div className={"register-parent-body-input"} key={index}>
                    <div className={"register-parent-body-input-title"}> Apakah kamu cadangan?</div>
                    <select className={"register-parent-body-input-input"}
                            onChange={e => setData(d => ({...d, [`${page}-${type}`]: e.target.value}))}
                            value={data[`${page}-${type}`]}>
                        <option value={""}>Pilih satu</option>
                        <option value={"true"}>Ya</option>
                        <option value={"false"}>Tidak</option>
                    </select>
                </div>

            case "representativePhone":
                return <Box key={index}
                            sx={{width: "100%", margin: "15px 0", padding: "0 10px", boxSizing: "border-box"}}>
                    <TextField id={type + "-input"} label={"Nomor Telepon Perwakilan Murid"} variant="outlined"
                               sx={{width: "100%"}}
                               size={"medium"} placeholder={"08xxxxxxxxxx"}
                               error={error[`${page}`] && (!data[`${page}-${type}`] || !new RegExp(/^(^\+62|62|^08)(\d{3,4}-?){2}\d{3,4}$/g).test(data[`${page}-${type}`] as string))}
                               helperText={error[`${page}`] && (!data[`${page}-${type}`] || !new RegExp(/^(^\+62|62|^08)(\d{3,4}-?){2}\d{3,4}$/g).test(data[`${page}-${type}`] as string)) ? "Nomor telepon tidak boleh kosong dan harus valid" : ""}
                               onChange={e => setData(d => ({...d, [`${page}-${type}`]: e.target.value}))}
                               value={data[`${page}-${type}`]}
                               required={true}/>
                </Box>

            case "representativeEmail":
                return <Box key={index}
                            sx={{width: "100%", margin: "15px 0", padding: "0 10px", boxSizing: "border-box"}}>
                    <TextField id={type + "-input"} label={"Email Perwakilan Murid"} variant="outlined"
                               sx={{width: "100%"}} placeholder={"dummy@hello.com"}
                               size={"medium"}
                               onChange={e => setData(d => ({...d, [`${page}-${type}`]: e.target.value}))}
                               error={error[`${page}`] && (!data[`${page}-${type}`] || !validateEmail(data[`${page}-${type}`] as string))}
                               helperText={error[`${page}`] && (!data[`${page}-${type}`] || !validateEmail(data[`${page}-${type}`] as string)) ? "Email tidak boleh kosong dan harus valid" : ""}
                               value={data[`${page}-${type}`]}
                               required={true}/>
                    <Typography variant="body1" component="div" gutterBottom color={"#fd6a6a"}>*Email ini akan digunakan
                        untuk mengirimkan informasi terkait lomba. Pastikan email yang kamu masukkan adalah email yang
                        valid.</Typography>
                </Box>

            case "names": {
                if (!Array.isArray(data[`${page}-${type}`])) setData(d => ({
                    ...d,
                    [`${page}-${type}`]: new Array(competition!.participants.min).fill("")
                }))
                return <div className={"register-parent-body-input"} key={index} style={{padding: "0 10px"}}>
                    <Typography variant="subtitle1" component="div" gutterBottom color={"#ffffff"}>Nama-nama anggota tim
                        ({(competition?.participants.min === competition?.participants.max) ? competition?.participants.max : `${competition?.participants.min} - ${competition?.participants.max}`})</Typography>
                    <div className={"register-parent-body-names-input"}>
                        {data[`${page}-${type}`] && (data[`${page}-${type}`] as string[]).map((name, index) => {
                            return <TextField id={type + "-input"} label={`Peserta ke-${index + 1}`} variant="outlined"
                                              sx={{width: "100%", marginTop: 1, marginBottom: 1, paddingLeft: 1}}
                                              size={"medium"}
                                              onChange={e => {
                                                  let names = data[`${page}-${type}`] as string[];
                                                  if (!names) {
                                                      setData(d => ({
                                                          ...d,
                                                          [`${page}-${type}`]: new Array(competition!.participants.min).fill("")
                                                      }));
                                                      names = new Array(competition!.participants.min).fill("");
                                                  }
                                                  names[index] = e.target.value;
                                                  setData(d => ({...d, [`${page}-${type}`]: names}));
                                              }}
                                              value={name}
                                              autoComplete={"off"}
                                              error={error[`${page}`] && data[`${page}-${type}`] ? name === "" : false}
                                              helperText={error[`${page}`] && data[`${page}-${type}`] ? name === "" ? "Nama tidak boleh kosong" : "" : ""}
                                              required={true}/>
                        })}

                        <ButtonGroup variant="text" aria-label="text button group">
                            <Button startIcon={<RemoveIcon/>}
                                    disabled={data[`${page}-${type}`] ? ((data[`${page}-${type}`] as string[]).length ?? competition!.participants.min) <= competition!.participants.min : true}
                                    onClick={() => {
                                        let names = data[`${page}-${type}`] as string[];
                                        if (!names) {
                                            setData(d => ({
                                                ...d,
                                                [`${page}-${type}`]: new Array(competition!.participants.min).fill("")
                                            }));
                                            names = new Array(competition!.participants.min).fill("");
                                        } else names.pop();
                                        setData(d => ({...d, [`${page}-${type}`]: names}));
                                    }}/>
                            <Button startIcon={<AddIcon/>}
                                    disabled={data[`${page}-${type}`] ? ((data[`${page}-${type}`] as string[]).length ?? competition!.participants.min) >= competition!.participants.max : competition!.participants.min >= competition!.participants.max}
                                    onClick={() => {
                                        let names = data[`${page}-${type}`] as string[];
                                        if (!names) {
                                            setData(d => ({
                                                ...d,
                                                [`${page}-${type}`]: new Array(competition!.participants.min + 1).fill("")
                                            }));
                                            names = new Array(competition!.participants.min + 1).fill("");
                                        } else names.push("");
                                        setData(d => ({...d, [`${page}-${type}`]: names}));
                                    }}/>
                        </ButtonGroup>
                    </div>
                </div>
            }
        }
    }

    function onNext() {
        const doc = !!passPhotoAndStudentCardFile?.target.files![0] && !!statementLetterFile?.target.files![0] && !!paymentFile?.target.files![0] && !!teacherPassPhotoFile?.target.files![0];

        const participantValidData = getValidData("participant");
        const teacherValidData = getValidData("teacher");

        const participantValid = competition?.requiredData.participant.every((key) => Object.keys(participantValidData).includes(key)) || false;
        const teacherValid = competition?.requiredData.teacher.every((key) => Object.keys(teacherValidData).includes(key)) || false;

        setError({
            '0': !participantValid,
            '1': stepPassed.includes(1) ? !teacherValid : false,
            '2': !paymentFile?.target?.files?.[0]
        });

        if (page === 0 && participantValid) {
            setPage(1);
        }
        if (page === 1 && teacherValid) {
            setPage(2);
        }
        if (page === 2 && doc) {
            submit();
        } else if (page === 2 && ['VmlkZW8gRWRpdGluZ1M'].includes(competition?.id ?? "") && paymentFile?.target?.files?.[0] && !passPhotoAndStudentCardFile?.target?.files![0]) {
            setUnfinishedDocs(["Pas Foto dan Kartu Pelajar Peserta"]);
        } else if (page === 2 && ['VmlkZW8gRWRpdGluZ1M'].includes(competition?.id ?? "") && paymentFile?.target?.files?.[0]) {
            submit();
        } else if (page === 2 && paymentFile?.target?.files?.[0]) {
            const unfinishedDocs: string[] = [];
            if (!passPhotoAndStudentCardFile?.target.files![0]) unfinishedDocs.push("Pas Foto dan Kartu Pelajar Peserta");
            if (!statementLetterFile?.target.files![0]) unfinishedDocs.push("Surat Keterangan Sekolah");
            // if (!paymentFile?.target.files![0]) unfinishedDocs.push("Bukti Pembayaran");
            if (!teacherPassPhotoFile?.target.files![0]) unfinishedDocs.push("Pas Foto Pendamping");
            setUnfinishedDocs(unfinishedDocs);
        }
    }

    React.useEffect(() => {
        setStepPassed((d) => [...d, page]);
        Analytics.onPageChange([{
            type: "register",
            competition: competition?.nickname,
            page: page + 1,
            data: data,
            sessionId
        }]);
    }, [page]);

    async function submit() {
        setUploadError("");
        setProgress(-1);
        if (!competition) return;
        if (!paymentFile?.target?.files?.[0]?.name) return;

        const customId = customCompetitionId && competitions.find(x => x.id === customCompetitionId) && competitions.find(x => x.id === customCompetitionId)!.id || "";

        const abortController = new AbortController();

        const rawFiles = {
            passPhotoAndStudentCard: passPhotoAndStudentCardFile?.target.files?.[0],
            teacherPassPhoto: teacherPassPhotoFile?.target.files?.[0],
            schoolLetter: statementLetterFile?.target.files?.[0],
            paymentProof: paymentFile?.target.files?.[0]
        }
        const files = {
            passPhotoAndStudentCard: "",
            teacherPassPhoto: "",
            schoolLetter: "",
            paymentProof: ""
        }

        let fileProgress = [0, 0, 0, 0];
        const res = await Promise.all([...Object.entries(rawFiles)].filter(([, file]) => !!file).map(([key, file], index) => RestManager.uploadFile(abortController.signal, file!, (progress: number) => {
            fileProgress[index] = progress;
            setProgress((fileProgress.reduce((a, b) => a + b, 0) / ([...Object.entries(rawFiles)].filter(([, file]) => !!file).length)) * 0.8);
        }).then(x => {
            // @ts-ignore
            files[key] = x.url;
        }).catch(() => null)));

        setProgress(d => d + 10);
        if (res.includes(null)) {
            setUploadError("Gagal mengunggah file. Harap coba lagi dan lapor jika masih gagal.");
            return setProgress(-1);
        }

        const teacherData = Object.entries(data).filter(([key]) => key.split("-")[0] === "1").map(([key, value]) => [key.split("-")[1], value]) as [string, string][];
        const participantData = Object.entries(data).filter(([key]) => key.split("-")[0] === "0").map(([key, value]) => [key.split("-")[1], value]) as [string, string | string[]][];
        const regRes = await RestManager.register(abortController.signal, customId, competition, teacherData, participantData, files).catch(e => setUploadError(`Gagal mengunggah data. Harap coba lagi dan lapor jika masih gagal. ${e}`));

        if (!regRes) return setProgress(-1);
        setProgress(100);
        window.location.href = "/register/success?registerId=" + regRes.id;
        window.localStorage.setItem("registeredIds", JSON.stringify([...JSON.parse(window.localStorage.getItem("registeredIds") ?? "[]"), regRes.id]));

    }

    function validateEmail(email: string) {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    function getValidData(type: "participant" | "teacher" | "doc") {
        const d = type === "participant" ? Object.entries(data).filter(([key]) => key.split("-")[0] === "0") : type === "teacher" ? Object.entries(data).filter(([key]) => key.split("-")[0] === "1") : [];
        const validData: { [key: string]: string | string[] } = {};
        for (let i = 0; i < d.length; i++) {
            const n = d[i][0].split("-")[1];
            const t = d[i][1];

            switch (n) {
                case "names": {
                    if (Array.isArray(t)) {
                        const names = t.filter((name) => name !== "");
                        if (names.length >= competition!.participants.min && names.length === (!!t ? t.length : competition!.participants.max) && names.every((name) => name !== "")) validData[n] = names;
                    }
                    break;
                }

                case "name":
                case "team_name":
                case "school":
                case "school_level":
                case "class":
                case "gender":
                case "back_number":
                case "is_backup": {
                    if (typeof t === "string" && t !== "") validData[n] = t;
                    break;
                }

                case "email":
                case "representativeEmail": {
                    if (validateEmail(t as string)) validData[n] = t;
                    break;
                }

                case "phone":
                case "representativePhone": {
                    if (new RegExp(/^(^\+62|62|^08)(\d{3,4}-?){2}\d{3,4}$/g).test(t as string)) validData[n] = t;
                    break;
                }
            }
        }

        return validData;
    }

    return (<>
            <Box sx={{
                position: "fixed",
                top: 0,
                right: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "#101418",
                zIndex: -1
            }}/>
            {videoSponsor !== "" && <Box sx={{
                position: "fixed",
                top: 0,
                right: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.38)"
            }}>
                <Box sx={{maxWidth: "85vw", maxHeight: "70vh", width: "800px", zIndex: 101, backgroundColor: "#000"}}>
                    <video autoPlay muted src={videoSponsor} onEnded={() => setVideoSponsor("")}
                            onTimeUpdate={(e) => setSponsorTimeLeft(Math.round(e.currentTarget.duration - e.currentTarget.currentTime))}
                           style={{width: "100%", aspectRatio: "16/9", objectFit: "cover"}}/>
                    <Typography variant="body1" sx={{marginTop: 0.5, marginBottom: 0.5}} color={"#fff"} textAlign={"center"}>
                        Iklan berakhir dalam {sponsorTimeLeft} detik
                    </Typography>
                </Box>
            </Box>}
            <Dialog
                open={unfinishedDocs.length > 0}
                onClose={() => setUnfinishedDocs([])}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Belum semua kelengkapan data terisi."}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Beberapa data <strong>{unfinishedDocs.join(", ")}</strong> belum terisi, apakah anda ingin
                        mengunggahnya lain waktu? Kami akan mengingatkan lewat email anda setiap 2 hari / 5 hari sebelum
                        acara berlangsung.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUnfinishedDocs([])}>Saya ingin mengunggah sekarang</Button>
                    <LoadingButton variant="contained" loading={progress > -1} autoFocus
                                   onClick={() => submit()}>
                        Ya, Saya akan menyusulnya
                    </LoadingButton>
                </DialogActions>
            </Dialog>
            <div className="register-beta-parent">
                {banner === "" ? <Skeleton variant="rounded" width={"100%"} height={200}/> : <Box sx={{
                    backgroundImage: `url(${banner})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    width: "100%",
                    height: 200,
                    borderTopLeftRadius: "10px",
                    borderTopRightRadius: "10px"
                }}/>}
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
                        {competition?.name ?? <Skeleton variant="text" width={200} height={30}/>}
                    </Typography>
                </Box>
                {competitionClosed && <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0"}}>
                    <SentimentVeryDissatisfiedIcon sx={{fontSize: 80, color: "#fff"}}/>
                    <Typography variant="h6" component="h4" gutterBottom color={"#fff"} style={{margin: "0"}}>
                        Pendaftaran untuk lomba ini telah ditutup
                    </Typography>
                </Box>}
                {!registOpen && <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0"}}>
                    <SentimentVeryDissatisfiedIcon sx={{fontSize: 80, color: "#fff"}}/>
                    <Typography variant="h6" component="h4" gutterBottom color={"#fff"} style={{margin: "0"}}>
                        Pendaftaran telah ditutup
                    </Typography>
                </Box>}
                <Box sx={{padding: 2, boxSizing: "border-box", display: competitionClosed || !registOpen ? "none" : undefined}}>
                    <Box sx={{width: '100%', marginTop: 3}}>
                        <Stepper activeStep={page} alternativeLabel>
                            {steps.map((label, index) => {
                                const labelProps: {
                                    optional?: React.ReactNode;
                                    error?: boolean;
                                } = {};
                                if (isStepFailed(index)) {
                                    labelProps.optional = (
                                        <Typography variant="caption" color="error">
                                            Data tidak lengkap
                                        </Typography>
                                    );
                                    labelProps.error = true;
                                }

                                return (
                                    <Step key={label}
                                          completed={stepPassed.includes(index) && (index === 0 ? !error['0'] && Object.keys(getValidData("participant")).length === competition?.requiredData.participant.length : index === 1 ? !error['1'] && Object.keys(getValidData("teacher")).length === competition?.requiredData.teacher.length : !!paymentFile?.target.files![0] && (!['VmlkZW8gRWRpdGluZ1M'].includes(competition?.id ?? "") ? (!!passPhotoAndStudentCardFile?.target.files![0] && !!statementLetterFile?.target.files![0] && !!teacherPassPhotoFile?.target.files![0]) : (!!passPhotoAndStudentCardFile?.target.files![0])))}>
                                        <StepLabel {...labelProps}>{label}</StepLabel>
                                    </Step>
                                );
                            })}
                        </Stepper>
                    </Box>
                    {(() => {
                        switch (page) {
                            case 0:
                                return <>
                                    <Box sx={{
                                        width: "100%",
                                        margin: "15px 0",
                                        padding: "0 10px",
                                        boxSizing: "border-box"
                                    }}>
                                        <TextField id={"lomba"} variant="outlined"
                                                   sx={{width: "100%"}}
                                                   size={"medium"} disabled
                                                   value={competition?.name || "Loading..."}/>
                                    </Box>
                                    <Box sx={{
                                        width: "100%",
                                        margin: "15px 0",
                                        padding: "0 10px",
                                        boxSizing: "border-box"
                                    }}>
                                        {!["RnV0c2FsIFB1dHJhSg", "TW9kZXJuIERhbmNlSg", "RnV0c2FsIFB1dHJhUw", "TW9kZXJuIERhbmNlUw"].includes(competition?.id ?? "") ?
                                            <TextField id={"lomba"} variant="outlined"
                                                       sx={{width: "100%"}}
                                                       size={"medium"} disabled
                                                       value={competition ? ["VmlkZW8gRWRpdGluZ1M"].includes(competition.id) ? "UMUM" : (competition.schoolLevel === "Junior" ? "SMP" : competition?.schoolLevel === "Senior" ? "SMA" : "SMP/SMA") : "Loading..."}/> :
                                            <FormControl sx={{width: "100%"}}>
                                                <InputLabel id="demo-simple-select-helper-label">Jenjang</InputLabel>
                                                <Select
                                                    labelId="demo-simple-select-helper-label"
                                                    id="demo-simple-select-helper"
                                                    value={customCompetitionId}
                                                    label="Jenjang"
                                                    onChange={e => setCustomCompetitionId(e.target.value)}
                                                >
                                                    <MenuItem
                                                        value={competition?.id === "RnV0c2FsIFB1dHJhUw" ? "RnV0c2FsIFB1dHJhUw" : "TW9kZXJuIERhbmNlUw"}>SMA</MenuItem>
                                                    <MenuItem
                                                        value={competition?.id === "RnV0c2FsIFB1dHJhUw" ? "RnV0c2FsIFB1dHJhSg" : "TW9kZXJuIERhbmNlSg"}>SMP</MenuItem>
                                                </Select>
                                            </FormControl>}
                                    </Box>
                                    {competition?.requiredData.participant.map((type, index) => RenderRegisterInput(page, type, index))}
                                </>

                            case 1:
                                return competition && competition.requiredData.teacher.length > 0 ? competition.requiredData.teacher.map((type, index) => RenderRegisterInput(page, type, index)) :
                                    <Alert severity="success" sx={{margin: "20px 0"}}>Tidak ada data yang dibutuhkan
                                        untuk guru pendamping. Silahkan pergi ke halaman selanjutnya</Alert>

                            default:
                                return <>
                                    <LoadingButton variant="contained" endIcon={<SendIcon/>}
                                                   sx={{width: "100%", marginTop: "20px", marginBottom: "20px"}}
                                                   loading={progress > -1}
                                                   disabled={!paymentFile?.target?.files?.[0] || (['VmlkZW8gRWRpdGluZ1M'].includes(competition?.id ?? "") ? (!!passPhotoAndStudentCardFile?.target?.files?.[0]) : (!!passPhotoAndStudentCardFile?.target?.files?.[0] && !!statementLetterFile?.target?.files?.[0] && !!teacherPassPhotoFile?.target?.files?.[0]))}
                                                   onClick={() => onNext()}>
                                        {"Kirim dan unggah dokumen nanti"}
                                    </LoadingButton>

                                    <Typography variant="h6" component="h6" gutterBottom color={"#fff"}
                                                style={{margin: "20px 0"}}>Bukti Pembayaran* </Typography>
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
                                        a.n. Nunut Dumariana 6800365757 <br/>Jika memungkinkan, beri keterangan
                                        "sekolah_lomba_nama peserta" pada deskripsi transfer. </Typography>
                                    <Button component="label" variant="contained" color="secondary"
                                            startIcon={<CloudUploadIcon/>}>
                                        Unggah bukti pembayaran
                                        [{paymentFile?.target?.files ? trimText(paymentFile.target.files[0]?.name, 10) : "Belum ada file"}]
                                        <VisuallyHiddenInput type="file" onChange={e => setPaymentFile(e)}/>
                                    </Button>
                                    {!paymentFile?.target?.files?.[0]?.name &&
                                        <Alert severity={"error"} sx={{marginTop: 1}}>
                                            Mohon unggah bukti pembayaran dengan format png/jpg/jpeg terlebih dahulu
                                        </Alert>}

                                    <hr/>
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
                                    <Button component="label" variant="contained" color="secondary"
                                            startIcon={<CloudUploadIcon/>}>
                                        Unggah file
                                        [{passPhotoAndStudentCardFile?.target?.files ? trimText(passPhotoAndStudentCardFile.target.files[0]?.name, 10) : "Belum ada file"}]
                                        <VisuallyHiddenInput type="file"
                                                             onChange={e => setPassPhotoAndStudentCardFile(e)}/>
                                    </Button>

                                    {!['VmlkZW8gRWRpdGluZ1M'].includes(competition?.id ?? "") ? <>

                                        <hr/>
                                        <Typography variant="h6" component="h6" gutterBottom color={"#fff"}
                                                    style={{margin: "20px 0"}}>Pas Foto Pendamping </Typography>
                                        <Typography variant="subtitle2" component="h6" gutterBottom color={"#fff"}
                                                    style={{margin: "20px 0"}}>Silahkan mengupload pas foto terbaru guru
                                            pendamping dengan format PNG/JPG </Typography>
                                        <Button component="label" variant="contained" color="secondary"
                                                startIcon={<CloudUploadIcon/>}>
                                            Unggah pas foto pendamping
                                            [{teacherPassPhotoFile?.target?.files ? trimText(teacherPassPhotoFile.target.files[0]?.name, 10) : "Belum ada file"}]
                                            <VisuallyHiddenInput type="file"
                                                                 onChange={e => setTeacherPassPhotoFile(e)}/>
                                        </Button>

                                        <hr/>
                                        <Typography variant="h6" component="h6" gutterBottom color={"#fff"}
                                                    style={{margin: "20px 0"}}>Surat Keterangan Sekolah </Typography>
                                        <Typography variant="subtitle2" component="h6" gutterBottom color={"#fff"}
                                                    style={{margin: "20px 0"}}>Silahkan mengupload surat keterangan
                                            sekolah dengan format PNG/JPG </Typography>
                                        <Button component="label" variant="contained" color="secondary"
                                                startIcon={<CloudUploadIcon/>}>
                                            Unggah surat keterangan sekolah
                                            [{statementLetterFile?.target?.files ? trimText(statementLetterFile.target.files[0]?.name, 10) : "Belum ada file"}]
                                            <VisuallyHiddenInput type="file" onChange={e => setStatementLetterFile(e)}/>
                                        </Button>
                                    </> : <div/>}

                                    <LoadingButton variant="contained" endIcon={<SendIcon/>}
                                                   sx={{width: "100%", marginTop: "20px", marginBottom: "20px"}}
                                                   loading={progress > -1}
                                                   disabled={!paymentFile?.target?.files?.[0] || (['VmlkZW8gRWRpdGluZ1M'].includes(competition?.id ?? "") ? (!!passPhotoAndStudentCardFile?.target?.files?.[0]) : (!!passPhotoAndStudentCardFile?.target?.files?.[0] && !!statementLetterFile?.target?.files?.[0] && !!teacherPassPhotoFile?.target?.files?.[0]))}
                                                   onClick={() => onNext()}>
                                        {"Kirim dan unggah dokumen nanti"}
                                    </LoadingButton>
                                </>
                        }
                    })()}

                    <Box sx={{display: "flex", justifyContent: "space-between"}}>
                        <Button variant="outlined" endIcon={<ChevronLeftIcon/>} disabled={page === 0}
                                onClick={() => setPage(x => (x - 1) as 0 | 1 | 2)}>
                            Sebelumnya
                        </Button>
                        <LoadingButton variant="contained" endIcon={page === 2 ? <SendIcon/> : <ChevronRightIcon/>}
                                       sx={{alignSelf: "end"}} loading={progress > -1}
                                       disabled={page === 2 && (['VmlkZW8gRWRpdGluZ1M'].includes(competition?.id ?? "") ? (!paymentFile?.target?.files?.[0] || !passPhotoAndStudentCardFile?.target?.files?.[0]) : (!passPhotoAndStudentCardFile?.target?.files?.[0] || !statementLetterFile?.target?.files?.[0] || !paymentFile?.target?.files?.[0] || !teacherPassPhotoFile?.target?.files?.[0]))}
                                       onClick={() => onNext()}>
                            {page === 2 ? "Kirim" : "Selanjutnya"}
                        </LoadingButton>
                    </Box>
                    {progress !== -1 && <LinearProgress variant="determinate" value={progress} sx={{marginTop: 2}}/>}
                    {uploadError !== "" && <Alert severity="error" sx={{marginTop: 2}}>{uploadError}</Alert>}
                    <Alert severity="info" sx={{marginTop: 2}}>Sekarang kamu bisa mengunggah dokumen pada lain waktu.
                        Ayo daftar sekarang dan nikmati keseruannya! </Alert>
                    <Alert severity="info" sx={{marginTop: 2}}>Untuk info terkait pendaftaran, silahkan
                        menghubungi: <br/> - redacted (redacted) <br/> - redacted (redacted) <br/> -
                        redacted (redacted) </Alert>
                </Box>
            </div>
        </>
    )
}

export function trimText(str: string, c: number) {
    if (!str) return "";
    return str.length > c ? str.substring(0, c) + "..." : str;
}

export function downloadTemplate(url: string, name: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.pdf`;
    a.click();
}