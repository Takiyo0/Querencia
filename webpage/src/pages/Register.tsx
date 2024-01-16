import React, {useState} from "react";
import "../css/register.css";
import "../css/default.css";
import {CompetitionData, RestManager} from "../rest/RestManager";
import {getImageUriFromId} from "../App";
import SimpleImageSlider from "react-simple-image-slider";
import {Analytics} from "../rest/Analytics";

const logo = require("../assets/images/logo.png");

const dataTranslate: { [key: string]: string } = {
    name: "Nama",
    team_name: "Nama Tim",
    school: "Asal Sekolah",
    school_level: "Tingkat Sekolah",
    email: "Email",
    phone: "Nomor Telepon",
    class: "Kelas",
    gender: "Jenis Kelamin",
    back_number: "Nomor Punggung",
    identity_card: "Kartu Pelajar",
    pass_photo: "Pas Foto",
    statement_letter: "Surat Keterangan Sekolah",
    is_backup: "Apakah kamu cadangan?",
    names: "Nama-nama anggota tim",
    representativePhone: "Nomor Telepon Perwakilan Murid",
    representativeEmail: "Email Perwakilan Murid"
}

export default function Register() {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");
    const [competition, setCompetition] = React.useState<CompetitionData>();
    const [competitions, setCompetitions] = React.useState<CompetitionData[]>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [page, setPage] = React.useState<number>(0);
    const [data, setData] = React.useState<{ [key: string]: string | string[] }>({}); // page-type, value
    const [passPhotoAndStudentCardFile, setPassPhotoAndStudentCardFile] = React.useState<React.ChangeEvent<HTMLInputElement> | null>(null);
    const [teacherPassPhotoFile, setTeacherPassPhotoFile] = React.useState<React.ChangeEvent<HTMLInputElement> | null>(null);
    const [statementLetterFile, setStatementLetterFile] = React.useState<React.ChangeEvent<HTMLInputElement> | null>(null);
    const [paymentFile, setPaymentFile] = React.useState<React.ChangeEvent<HTMLInputElement> | null>(null);
    const [validation, setValidation] = React.useState<{
        participant: boolean,
        teacher: boolean,
        doc: boolean
    }>({participant: false, teacher: false, doc: false});
    const [customCompetitionId, setCustomCompetitionId] = React.useState<string>("");
    const sessionId = React.useMemo(() => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), []);

    const params = window.location.pathname.split("/");
    const [progress, setProgress] = React.useState<{ value: number, str: string }>({value: 0, str: ""});

    React.useEffect(() => {
        const abortController = new AbortController();

        if (params[2] === "RnV0c2FsIFB1dHJhSg") {
            window.location.href = "/register/RnV0c2FsIFB1dHJhUw"; // futsal
            setCustomCompetitionId("RnV0c2FsIFB1dHJhUw");
        } // futsal
        if (params[2] === "TW9kZXJuIERhbmNlSg") {
            window.location.href = "/register/TW9kZXJuIERhbmNlUw"; // md
            setCustomCompetitionId("TW9kZXJuIERhbmNlUw");
        } // md
        else {
            RestManager.getRegisterStatus(abortController.signal).then((data) => setIsOpen(data));
            RestManager.getCompetitionList(abortController.signal).then((data) => {
                setCompetitions(data.competitions);
                setCompetition(data.competitions.find((competition) => competition.id === params[2]));
                setLoading(false);
            });
        }

        return () => abortController.abort();
    }, []);

    React.useEffect(() => {
        check();
    }, [data, passPhotoAndStudentCardFile, statementLetterFile, paymentFile]);

    React.useEffect(() => {
        if (!competition) return;
        const isPageCompletion = page === 2;
        if (isPageCompletion) {
            setPaymentFile(null);
            setStatementLetterFile(null);
            setPassPhotoAndStudentCardFile(null);
        }
        Analytics.onPageChange([{type: "register", competition: competition.nickname, page: page + 1, isPageCompletion, data, sessionId}]);
    }, [page]);

    function check() {
        const doc = !!passPhotoAndStudentCardFile?.target.files![0] && !!statementLetterFile?.target.files![0] && !!paymentFile?.target.files![0];

        const participantValidData = getValidData("participant");
        const teacherValidData = getValidData("teacher");

        const participantValid = competition?.requiredData.participant.every((key) => Object.keys(participantValidData).includes(key)) || false;
        const teacherValid = competition?.requiredData.teacher.every((key) => Object.keys(teacherValidData).includes(key)) || false;

        setValidation({participant: participantValid, teacher: teacherValid, doc});
    }

    async function submit() {
        if (!competition) return;
        if (!passPhotoAndStudentCardFile?.target?.files || !teacherPassPhotoFile?.target?.files || !statementLetterFile?.target?.files || !paymentFile?.target?.files) return;
        if (!passPhotoAndStudentCardFile.target.files[0] || !teacherPassPhotoFile.target.files[0] || !statementLetterFile.target.files[0] || !paymentFile.target.files[0]) return;

        const customId = customCompetitionId && competitions.find(x => x.id === customCompetitionId) && competitions.find(x => x.id === customCompetitionId)!.id || "";

        const abortController = new AbortController();
        const fArrs = [passPhotoAndStudentCardFile.target.files[0], teacherPassPhotoFile.target.files[0], statementLetterFile.target.files[0], paymentFile.target.files[0]];

        const files = {
            passPhotoAndStudentCard: "",
            teacherPassPhoto: "",
            schoolLetter: "",
            paymentProof: ""
        }

        for (let i = 0; i < fArrs.length; i++) {
            const f = fArrs[i];
            const response = await RestManager.uploadFile(abortController.signal, f, (progress: number, uploaded: number, total: number) => {
                setProgress(d => {
                    console.log(progress, progress / 0.2);
                    const p = progress / 0.2;
                    return {value: d.value + p, str: `Uploading ${f.name} (${uploaded}MB/${total}MB)`}
                })
            });
            if (!response) {
                setProgress({value: 0, str: ""});
                return setError("Gagal mengunggah file");
            }
            console.log([i, response.url]);
            if (i === 0) files.passPhotoAndStudentCard = response.url;
            else if (i === 1) files.teacherPassPhoto = response.url;
            else if (i === 2) files.schoolLetter = response.url;
            else if (i === 3) files.paymentProof = response.url;
        }


        setProgress(d => ({...d, str: "Mengirim data ke server..."}));
        const teacherData = Object.entries(data).filter(([key]) => key.split("-")[0] === "1").map(([key, value]) => [key.split("-")[1], value]) as [string, string][];
        const participantData = Object.entries(data).filter(([key]) => key.split("-")[0] === "0").map(([key, value]) => [key.split("-")[1], value]) as [string, string | string[]][];
        const res = await RestManager.register(abortController.signal, customId, competition, teacherData, participantData, files);
        if (!res) {
            setProgress({value: 0, str: ""});
            return setError("Gagal mendaftar. Silahkan coba lagi nanti");
        }
        window.location.href = "/register/success?registerId=" + res.id;
        window.localStorage.setItem("registeredIds", JSON.stringify([...JSON.parse(window.localStorage.getItem("registeredIds") ?? "[]"), res.id]));
    }

    function getValidData(type: "participant" | "teacher" | "doc") {
        const d = type === "participant" ? Object.entries(data).filter(([key]) => key.split("-")[0] === "0") : type === "teacher" ? Object.entries(data).filter(([key]) => key.split("-")[0] === "1") : [];
        const validData: { [key: string]: string | string[] } = {};
        for (let i = 0; i < d.length; i++) {
            const n = d[i][0].split("-")[1];
            const t = d[i][1];

            const validateEmail = (email: string) => {
                return String(email)
                    .toLowerCase()
                    .match(
                        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    );
            };

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

    function renderInput(page: number, type: string, index: number) {

        switch (type) {
            case "name":
                return <div className={"register-parent-body-input"} key={index}>
                    <div className={"register-parent-body-input-title"}> Nama</div>
                    <input type={"text"} className={"register-parent-body-input-input"}
                           onChange={e => setData(d => ({...d, [`${page}-${type}`]: e.target.value}))}
                           value={data[`${page}-${type}`]}/>
                </div>

            case "team_name":
                return <div className={"register-parent-body-input"} key={index}>
                    <div className={"register-parent-body-input-title"}> Nama Tim</div>
                    <input type={"text"} className={"register-parent-body-input-input"}
                           onChange={e => setData(d => ({...d, [`${page}-${type}`]: e.target.value}))}
                           value={data[`${page}-${type}`]}/>
                </div>

            case "school":
                return <div className={"register-parent-body-input"} key={index}>
                    <div className={"register-parent-body-input-title"}> Asal Sekolah</div>
                    <input type={"text"} className={"register-parent-body-input-input"}
                           onChange={e => setData(d => ({...d, [`${page}-${type}`]: e.target.value}))}
                           value={data[`${page}-${type}`]}/>
                </div>

            case "school_level":
                return <div className={"register-parent-body-input"} key={index}>
                    <div className={"register-parent-body-input-title"}> Tingkat Sekolah</div>
                    <select className={"register-parent-body-input-input"}
                            onChange={e => setData(d => ({...d, [`${page}-${type}`]: e.target.value}))}
                            value={data[`${page}-${type}`]}>
                        <option value={""}>Pilih tingkat sekolah</option>
                        <option value={"Junior"}>SMP</option>
                        <option value={"Senior"}>SMA</option>
                    </select>
                </div>

            case "email":
                return <div className={"register-parent-body-input"} key={index}>
                    <div className={"register-parent-body-input-title"}> Email</div>
                    <div className={"register-parent-body-input-data-information"}> Email ini akan digunakan untuk
                        mengirimkan informasi terkait lomba. Pastikan email yang kamu masukkan adalah email yang valid.
                    </div>
                    <input type={"email"} className={"register-parent-body-input-input"} placeholder={"dummy@hello.com"}
                           onChange={e => setData(d => ({...d, [`${page}-${type}`]: e.target.value}))}
                           value={data[`${page}-${type}`]}/>
                </div>

            case "phone":
                return <div className={"register-parent-body-input"} key={index}>
                    <div className={"register-parent-body-input-title"}> Nomor Telepon</div>
                    <input type={"tel"} className={"register-parent-body-input-input"} placeholder={"08xxxxxxxxxx"}
                           onChange={e => setData(d => ({...d, [`${page}-${type}`]: e.target.value}))}
                           value={data[`${page}-${type}`]}/>
                </div>

            case "class":
                return <div className={"register-parent-body-input"} key={index}>
                    <div className={"register-parent-body-input-title"}> Kelas</div>
                    <input type={"text"} className={"register-parent-body-input-input"}
                           onChange={e => setData(d => ({...d, [`${page}-${type}`]: e.target.value}))}
                           value={data[`${page}-${type}`]}/>
                </div>

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

            case "back_number":
                return <div className={"register-parent-body-input"} key={index}>
                    <div className={"register-parent-body-input-title"}> Nomor Punggung</div>
                    <input type={"number"} className={"register-parent-body-input-input"}
                           onChange={e => setData(d => ({...d, [`${page}-${type}`]: e.target.value}))}
                           value={data[`${page}-${type}`]}/>
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
                return <div className={"register-parent-body-input"} key={index}>
                    <div className={"register-parent-body-input-title"}> Nomor Telepon Perwakilan Murid</div>
                    <input type={"tel"} className={"register-parent-body-input-input"} placeholder={"08xxxxxxxxxx"}
                           onChange={e => setData(d => ({...d, [`${page}-${type}`]: e.target.value}))}
                           value={data[`${page}-${type}`]}/>
                </div>

            case "representativeEmail":
                return <div className={"register-parent-body-input"} key={index}>
                    <div className={"register-parent-body-input-title"}> Email Perwakilan Murid</div>
                    <div className={"register-parent-body-input-data-information"}> Email ini akan digunakan untuk
                        mengirimkan informasi terkait lomba. Pastikan email yang kamu masukkan adalah email yang valid.
                    </div>
                    <input type={"email"} className={"register-parent-body-input-input"} placeholder={"dummy@hello.com"}
                           onChange={e => setData(d => ({...d, [`${page}-${type}`]: e.target.value}))}
                           value={data[`${page}-${type}`]}/>
                </div>

            case "names":
                return <div className={"register-parent-body-input"} key={index}>
                    <div className={"register-parent-body-input-title"}> Nama-nama anggota tim
                        ({competition?.participants.min} - {competition?.participants.max})
                    </div>
                    <div className={"register-parent-body-names-input"}>
                        {data[`${page}-${type}`] ? (data[`${page}-${type}`] as string[]).map((name, index) => {
                            return <div className={"register-parent-body-names-input-item"} key={index}>
                                <div className={"register-parent-body-names-input-title"}>{index + 1}</div>
                                <input type={"text"}
                                       className={"register-parent-body-input-input register-parent-body-input-input-name"}
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
                                       }} value={name}/>
                            </div>
                        }) : (new Array(competition!.participants.min)).fill("").map((_, index) => {
                            return <div className={"register-parent-body-names-input-item"} key={index}>
                                <div className={"register-parent-body-names-input-title"}>{index + 1}</div>
                                <input type={"text"}
                                       className={"register-parent-body-input-input register-parent-body-input-input-name"}
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
                                       }} value={""}/>
                            </div>
                        })}
                        <div className={"register-parent-body-names-input-buttons"}>
                            <div
                                className={`register-parent-body-names-input-buttons-add ${data[`${page}-${type}`] && ((data[`${page}-${type}`] as string[]).length ?? competition!.participants.min) >= competition!.participants.max ? "register-parent-body-names-input-buttons-disabled" : ""}`}
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
                                }}>+
                            </div>
                            <div
                                className={`register-parent-body-names-input-buttons-remove ${(data[`${page}-${type}`] as string[])?.length ? data[`${page}-${type}`] && ((data[`${page}-${type}`] as string[]).length ?? competition!.participants.min) <= competition!.participants.min ? "register-parent-body-names-input-buttons-disabled" : "" : "register-parent-body-names-input-buttons-disabled"}`}
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
                                }}>-
                            </div>
                        </div>
                    </div>
                </div>

        }
    }

    function downloadTemplate(url: string, name: string) {
        const a = document.createElement("a");
        a.href = url;
        a.download = `${name}.pdf`;
        a.click();
    }


    return (<div className={"register-parent"}>
        <div className={"register-parent-pictures"}>
            {competition && <SimpleImageSlider
                width={"90%"}
                height={"90%"}
                images={[{url: getImageUriFromId(competition?.id ?? "")}]}
                showBullets={true}
                showNavs={true}
            />}
        </div>
        {progress.str !== "" && <div className={"register-progress-parent"}>
            <div className={"register-progress-parent-small"}>
                <p className={"register-progress-parent-small-text"}>{progress.str}</p>
                <div className={"register-progress-parent-bar"}>
                    <div className={"register-progress-parent-bar-progress"} style={{width: `${progress.value}%`}}/>
                </div>
            </div>

        </div>}
        <div className={"preregister-parent-scroll"}>
            {loading && <div className={"register-parent-loading"}>Loading...</div>}
            {!loading && !isOpen && <div className={"register-parent-body"}>
                <img src={logo} alt={"Querencia logo"} className={"register-parent-body-logo"}/>
                <div className={"register-parent-body-title"}> Pendaftaran belum dibuka saat ini</div>
            </div>}
            {!loading && !!competition && isOpen && <div className={"register-parent-body"}>
                <div className={"back-button"} onClick={() => window.location.href = "/register"}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                         onClick={() => {
                             if (page === 0) window.location.href = "/register";
                             else setPage(page - 1);
                         }}>
                        <path fill="#fff"
                              d="M15.5 5.5l-7 7 7 7"
                              stroke="#000"
                              strokeLinecap="round"
                              strokeLinejoin="round"/>
                    </svg>
                    <span>Kembali</span>
                </div>
                <img src={logo} alt={"Querencia logo"} className={"register-parent-body-logo"}/>
                <div
                    className={"register-parent-body-title"}> {page === 0 ? "Data Peserta" : page === 1 ? "Data Pendamping" : page === 2 ? "Kelengkapan Data" : "Rangkuman Registrasi"} </div>
                {page === 0 && <div className={"register-parent-body-competition-list"}>
                    <div className={"register-parent-body-input"}>
                        <div className={"register-parent-body-input-title"}> Lomba</div>
                        <input type={"tel"} className={"register-parent-body-input-input"} disabled={true}
                               value={competition.name}/>
                    </div>
                    {!["RnV0c2FsIFB1dHJhSg", "TW9kZXJuIERhbmNlSg", "RnV0c2FsIFB1dHJhUw", "TW9kZXJuIERhbmNlUw"].includes(competition.id) ?
                        <div className={"register-parent-body-input"}>
                            <div className={"register-parent-body-input-title"}> Jenjang</div>
                            <input type={"tel"} className={"register-parent-body-input-input"} disabled={true}
                                   value={competition.schoolLevel === "Junior" ? "SMP" : competition.schoolLevel === "Senior" ? "SMA" : "Semua"}/>
                        </div> :
                        <div className={"register-parent-body-input"}>
                            <div className={"register-parent-body-input-title"}> Jenjang</div>
                            <select className={"register-parent-body-input-input"}
                                    onChange={e => setCustomCompetitionId(e.target.value)}
                                    value={customCompetitionId}>
                                <option
                                    value={competition.id === "RnV0c2FsIFB1dHJhUw" ? "RnV0c2FsIFB1dHJhUw" : "TW9kZXJuIERhbmNlUw"}>SMA
                                </option>
                                <option
                                    value={competition.id === "RnV0c2FsIFB1dHJhUw" ? "RnV0c2FsIFB1dHJhSg" : "TW9kZXJuIERhbmNlSg"}>SMP
                                </option>
                            </select>
                        </div>}

                    {competition.requiredData.participant.map((data, index) => {
                        return renderInput(page, data, index)
                    })}
                </div>}
                {page === 1 &&
                    <div className={"register-parent-body-competition-list"}>
                        {competition.requiredData.teacher.map((data, index) => renderInput(page, data, index))}
                    </div>}

                {page === 2 &&
                    <div className={"register-parent-body-competition-list"}>
                        <div className={"register-parent-body-input-data"}>
                            <div className={"register-parent-body-input-data-title"}> Pas Foto dan Kartu Pelajar
                                Peserta
                            </div>
                            <div className={"register-parent-body-input-data-information"}> Silahkan mendownload DOCS
                                dibawah ini dan
                                masukkan <span>PAS FOTO TERBARU</span>, <span>NAMA LENGKAP</span>, dan <span>KARTU PELAJAR</span> sesuai
                                template
                                yang telah disediakan. Format file yang diterima adalah <span>PDF</span> dengan ukuran
                                maksimal <span>10MB</span>
                            </div>
                            <div className={"register-parent-body-input-data-buttons"}>
                                <div className={"register-parent-body-input-data-buttons-download"}
                                     onClick={() => downloadTemplate(competition?.participants.min === -1 ? "https://cdn.redacted.redacted/RtNCgmsNz84h.docx" : "https://cdn.redacted.redacted/AyNIipDnzSbG.docx", "Template Pas Foto")}> Unduh
                                    Template
                                </div>
                                {/*<div className={"register-parent-body-input-data-buttons-upload"}> Panduan</div>*/}
                            </div>
                            <input type="file" className={"register-parent-body-input-data-file"} accept={"application/pdf"} size={10000000}
                                   onChange={e => setPassPhotoAndStudentCardFile(e)} multiple={false}/>
                        </div>


                        <div className={"register-parent-body-input-data"}>
                            <div className={"register-parent-body-input-data-title"}> Pas Foto Pendamping</div>
                            <div className={"register-parent-body-input-data-information"}> Silahkan mengupload <span>PAS FOTO TERBARU</span> guru
                                pendamping dengan format <span>JPG</span> atau <span>PNG</span> dengan ukuran
                                maksimal <span>2MB</span>.
                            </div>
                            <input type="file" className={"register-parent-body-input-data-file"} accept={"image/*"} size={2000000}
                                   onChange={e => setTeacherPassPhotoFile(e)} multiple={false}/>
                        </div>

                        <div className={"register-parent-body-input-data"}>
                            <div className={"register-parent-body-input-data-title"}> Surat Keterangan Sekolah</div>
                            <div className={"register-parent-body-input-data-information"}> Silahkan mengupload <span>SURAT KETERANGAN SEKOLAH</span> dengan
                                format <span>JPG</span> atau <span>PNG</span> dengan ukuran maksimal <span>2MB</span>.
                            </div>
                            <input type="file" className={"register-parent-body-input-data-file"} accept={"image/*"} size={2000000}
                                   onChange={e => setStatementLetterFile(e)} multiple={false}/>
                        </div>

                        <div className={"register-parent-body-input-data"}>
                            <div className={"register-parent-body-input-data-title"}> Bukti Pembayaran</div>
                            <div className={"register-parent-body-input-data-information"}> Silahkan membayar
                                sejumlah <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(competition.price))} (harga lomba)</span> dan <span>Rp 50.000,00 (Walk Out)</span> melalui <span>BCA a.n. Nunut Dumariana 6800365757</span>
                            </div>
                            <div className={"register-parent-body-input-data-buttons"}>
                                {/*<div className={"register-parent-body-input-data-buttons-upload"}> Panduan</div>*/}
                            </div>
                            <input type="file" className={"register-parent-body-input-data-file"} accept={"application/pdf"} size={10000000}
                                   onChange={e => setPaymentFile(e)} multiple={false}/>
                        </div>
                    </div>}
                <div className={"register-parent-body-buttons"}>
                    <div
                        className={`register-parent-body-buttons-back ${page === 0 ? "register-parent-body-buttons-disabled" : ""}`}
                        onClick={() => setPage(page - 1)}><span>Kembali</span></div>
                    <div
                        className={`register-parent-body-buttons-next ${page === 0 && !validation.participant ? "register-parent-body-buttons-disabled-grey" : page === 1 && !validation.teacher ? "register-parent-body-buttons-disabled-grey" : page === 2 && !validation.doc ? "register-parent-body-buttons-disabled-grey" : ""}`}
                        onClick={() => page === 2 ? submit() : setPage(page + 1)}>
                        <span>{page === 2 ? "Kirim" : "Selanjutnya"}</span>
                    </div>
                </div>
                <div className={"register-parent-contact-person"}>
                </div>
            </div>}
        </div>
    </div>)
}