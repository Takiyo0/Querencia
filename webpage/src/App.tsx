import React, {useEffect, useState} from 'react';
import "./css/app.css";
import ReactPlayer from 'react-player';
import {CompetitionData, RestManager} from "./rest/RestManager";
import {pictureData} from "./assets/pictureData";
import "./css/preregister.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {PictureManager} from "./assets/PictureManager";
import Viewer from "react-viewer";
import {Analytics} from "./rest/Analytics";
import {useNavigate} from "react-router-dom";
import Footer from "./pages/partials/Footer";
import Button from '@mui/material/Button';
import CompetitionModal from "./pages/partials/CompetitionModal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const video = require("./assets/video/intro.mp4");
const recapVideo = require("./assets/video/recap.mp4");
const penaburLogo = require("./assets/images/penabur.png");
const osisLogo = require("./assets/images/osis.png");

export function getImageUriFromId(id: string) {
    // @ts-ignore
    let res = PictureManager.registrations[id as any];
    if (!res) res = "https://source.unsplash.com/user/c_v_r/1900x800";
    return res;
}

const didukung = [['sosro', 'https://cdn.redacted.redacted/ToLMVL4ZSwJ4.webp'], ['sunsport', 'https://cdn.redacted.redacted/pl31FxScT0Y3.webp'], ['karunia', 'https://cdn.redacted.redacted/Nrhxj75SfhVE.webp'], ['icanread', 'https://cdn.redacted.redacted/zQry3MB7BgOu.webp']]
    const sponsor = [['binus', 'https://cdn.redacted.redacted/iyFQI7wkEZLq.webp'], ['gisma', 'https://cdn.redacted.redacted/Od2PgNzSWM0W.webp'], ['untar', 'https://cdn.redacted.redacted/HlRUMSUH8TAj.webp'], ['yabes', 'https://cdn.redacted.redacted/EXYV5iEn24Uq.webp'], ['rspk', 'https://cdn.redacted.redacted/kRG8ZowWquJg.webp'],  ['umn', 'https://cdn.redacted.redacted/JKpDQOfsYuqC.webp'], ['metropack', 'https://cdn.redacted.redacted/6rUjaGmFQdzi.webp']]

function App() {
    const [competitions, setCompetitions] = React.useState<CompetitionData[]>([]);
    const [registOpen, setRegistOpen] = React.useState(false);
    const [showIntro, setShowIntro] = React.useState(true);
    const [introStep, setIntroStep] = React.useState(0); // 0 = loading; 1 = osis presents; 2 = intro video; 3 = querencia
    const [loadingProgress, setLoadingProgress] = React.useState(0);
    const [introAnimationState, setIntroAnimationState] = React.useState(0); // 0: opening, 1: closing
    const [showNextPage, setShowNextPage] = React.useState(false);
    const [galleryPage, setGalleryPage] = React.useState(0); // 0: opening, 1: basketball, 2: futsal, 3: md, 4: solo vocal, 5: panitia, 6: closing
    const [countdown, setCountdown] = React.useState("3 hari 10 jam 20 menit");
    const [imagePopup, setImagePopup] = React.useState("");
    const [userScrolled, setUserScrolled] = React.useState(false);
    const [showNotWorking, setShowNotWorking] = React.useState(false);
    const [selectedCompetition, setSelectedCompetition] = useState<CompetitionData | null>(null);
    const [imageViewer, setImageViewer] = React.useState<string[]>([]);
    const [sponsors, setSponsors] = React.useState<string[]>([]);
    const [openCompetitions, setOpenCompetitions] = React.useState<string[]>([]);
    const navigate = useNavigate();

    const params = new URLSearchParams(window.location.search);

    const vidRef = React.useRef<HTMLVideoElement>(null);

    const transitions = [{
        fadeIn: 1000,
        duration: -1,
        fadeOut: 1000
    }, { // osis presents
        fadeIn: 1000,
        duration: 3000,
        fadeOut: 1000
    }]

    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;
        RestManager.getCompetitionList(signal).then((data) => setCompetitions(data.competitions));
        RestManager.getRegisterStatus(signal).then((data) => setRegistOpen(data));
        RestManager.getSponsorsClient(signal).then((data) => setSponsors(data.sponsors));
        RestManager.getOpenCompetitionList(signal).then((data) => setOpenCompetitions(data.open));

        let i: NodeJS.Timeout;
        let k: NodeJS.Timeout;

        if (params.get("intro") === "true") {
            setLoadingProgress(15);
            loadVideoToCacheByUrl(video).then(() => {
                setLoadingProgress(100);
                doneLoading();
                setTimeout(() => setShowNotWorking(true), 2000)
            });
        } else {
            startPage();
        }

        const j = setInterval(() => {
            setCountdown(getCountdownString);
        }, 1000);

        const f = () => {
            if (window.scrollY > 0) {
                setUserScrolled(true);
            } else {
                setUserScrolled(false);
            }
        };

        window.addEventListener("scroll", f);

        return () => {
            clearInterval(i);
            clearInterval(j);
            clearInterval(k);
            window.removeEventListener("scroll", f);
            abortController.abort();
        }

    }, []);

    async function loadVideoToCacheByUrl(url: string): Promise<void> {
        const video = document.createElement("video");
        video.src = url;
        video.preload = "auto";
        video.load();
        await new Promise((resolve) => {
            video.onloadeddata = () => {
                resolve(1);
            }
        });
    }

    async function doneLoading() {
        setIntroAnimationState(2);
        await wait(1000);
        setIntroStep((prev) => 1);
        setIntroAnimationState(0);
        await wait(1000);
        setIntroAnimationState(1);
        await wait(transitions[1].duration);
        setIntroAnimationState(2);
        await wait(1000);
        setIntroStep((prev) => 2);
        setIntroAnimationState(0);
        await wait(1000);
    }

    async function wait(ms: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    async function resetIntro() {
        setIntroAnimationState(0);
        await wait(1000);
        startPage();
    }

    async function startPage() { // used to start the page after intro
        setShowIntro(false);
        setIntroStep((prev) => 0);
        await wait(1000);
        setShowNextPage(true);
    }

    function renderIntro(i: number) {
        switch (i) {
            case 0: {
                return (<div className={"loading" + (introAnimationState === 2 ? " fade-out" : " fade-in")}>
                    <img src={PictureManager.exuberant} alt="logo of EXUBERANT"/>
                    <div className="loading-p">
                        <div className="loading-text">Please wait while we prepare things...</div>
                        <div className={"loading-parent"}>
                            <div className={"loading-child"} style={{width: `${loadingProgress}%`}}/>
                        </div>
                    </div>
                </div>);
            }

            case 1: {
                return (<div className={"osis-presents" + (introAnimationState === 2 ? " fade-out" : " fade-in")}>
                    <div className="osis-presents-text-parent">
                        <div className="osis-presents-text">OSIS SMAK PENABUR</div>
                        <div className="osis-presents-text">redacted</div>
                    </div>
                    <div className="osis-presents-text osis-presents-text-presents">Presents</div>
                </div>);
            }

            case 2: {
                return (<div className={"intro-video" + (introAnimationState === 2 ? " fade-out" : " fade-in")}>
                    <video autoPlay muted onEnded={() => resetIntro()} ref={vidRef}>
                        <source src={video} type="video/mp4"/>
                    </video>
                </div>);
            }
        }
    }

    function videoTrailerButton(next: boolean) {
        const videoDiv = document.getElementsByClassName("page-4-trailer-video")[0];
        if (next) {
            videoDiv.scrollLeft = videoDiv.scrollWidth;
        } else {
            videoDiv.scrollLeft = 0;
        }
    }

    function renderGallery(pageIndex: number) {
        return <>
            {Object.values(pictureData)[pageIndex].map((url) => {
                return <div className="page-4-gallery-photo" style={{backgroundImage: `url(${url})`}}
                            onClick={() => setImageViewer([...Object.values(pictureData)[pageIndex]].sort((name) => name === url ? -1 : 1))}/>
            })}
        </>
    }

    function getCountdownString() {
        // Set the target date and time for the countdown
        const targetDate = new Date('2023-10-30T00:00:00+07:00').getTime();

        // Get the current time
        const now = new Date().getTime();

        // Calculate the time remaining in milliseconds
        const timeRemaining = targetDate - now;

        if (timeRemaining <= 0) {
            return 'Countdown expired!';
        } else {
            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

            return `${days} Days ${hours} Hours ${minutes} Minutes`;
        }
    }


    return (<>
            <Viewer
                visible={imageViewer.length > 0}
                onClose={() => {
                    setImageViewer([])
                }}
                images={imageViewer.map((link) => ({src: link, alt: "Preview"}))}
            />
            {selectedCompetition &&
                <CompetitionModal comp={selectedCompetition} onClose={() => setSelectedCompetition(null)}/>}

            <div className="page-1-parent" style={{backgroundImage: `url(${PictureManager.homePicture.normal}`}}>
                {showIntro ? <>
                    {renderIntro(introStep)}
                    {showNotWorking && <div className={"stuck fade-in"}>Stuck? Refresh the page</div>}
                </> : <>
                    <div className="home">
                        <div className="background"
                             style={{backgroundImage: `url(${PictureManager.homePicture.normal})`}}/>
                        <div className="background-filter"/>
                        <div className="home-center-container">
                            <img src={PictureManager.querencia} alt="logo of EXUBERANT"/>
                            {/*<button className={`page-1-daftar transition ${registOpen ? "" : "regist-close"}`} onClick={() => registOpen ? Analytics.onButtonClick([{from: "home", to: "register"}], (() => window.location.href = "/register")()) : void 0}>*/}
                            {/*    <p>Daftar</p>*/}
                            {/*    <svg xmlns="http://www.w3.org/2000/svg" width="62" height="61" viewBox="0 0 62 61" fill="none">*/}
                            {/*        <path d="M30.5039 15.25L27.778 17.9054L38.4148 28.5938H15.2539V32.4062H38.4148L27.778 43.0298L30.5039 45.75L45.7539 30.5L30.5039 15.25Z" fill="#1D3827"/>*/}
                            {/*        <path d="M30.5039 57.1875C25.2256 57.1875 20.0659 55.6223 15.6771 52.6899C11.2884 49.7574 7.8678 45.5894 5.84788 40.7129C3.82797 35.8364 3.29947 30.4704 4.32921 25.2935C5.35895 20.1167 7.90069 15.3614 11.633 11.6291C15.3653 7.89679 20.1206 5.35505 25.2974 4.3253C30.4743 3.29556 35.8403 3.82406 40.7168 5.84398C45.5933 7.86389 49.7613 11.2845 52.6938 15.6732C55.6262 20.062 57.1914 25.2217 57.1914 30.5C57.1833 37.5755 54.369 44.3589 49.3659 49.362C44.3628 54.3651 37.5794 57.1794 30.5039 57.1875ZM30.5039 7.62501C25.9797 7.62501 21.557 8.96661 17.7952 11.4801C14.0335 13.9937 11.1015 17.5663 9.37017 21.7461C7.63882 25.926 7.18582 30.5254 8.06846 34.9627C8.95109 39.4 11.1297 43.476 14.3288 46.6751C17.528 49.8742 21.6039 52.0528 26.0412 52.9355C30.4785 53.8181 35.0779 53.3651 39.2578 51.6338C43.4377 49.9024 47.0102 46.9705 49.5238 43.2087C52.0373 39.4469 53.3789 35.0243 53.3789 30.5C53.3719 24.4354 50.9595 18.6211 46.6712 14.3327C42.3828 10.0444 36.5686 7.63208 30.5039 7.62501Z" fill="#1D3827"/>*/}
                            {/*    </svg>*/}
                            {/*</button>*/}
                            {/*<Button variant="contained" size="large" sx={{borderRadius: "20px"}}*/}
                            {/*        onClick={() => registOpen ? Analytics.onButtonClick([{*/}
                            {/*            from: "home",*/}
                            {/*            to: "register"*/}
                            {/*        }], (() => navigate("/register"))()) : void 0}>Registrasi Sekarang!</Button>*/}
                        </div>
                        <div className="home-gradient"/>
                        {!userScrolled && showNextPage && <a className={"scroll-div"}><span></span></a>}
                    </div>
                </>}
            </div>

            {showNextPage && <>
                {imagePopup !== "" && <div className="image-popup" onClick={() => Analytics.onButtonClick([{
                    from: "home",
                    to: "home",
                    type: "imageClick"
                }], setImagePopup(""))}><img src={imagePopup} alt={"Image popup from selected image"}/></div>}
                <div className="page-2-parent">
                    <div className="page-2">
                        <div className="about-content">
                            <div className="about-content-text">
                                <div className="about-title">About</div>
                                <svg xmlns="http://www.w3.org/2000/svg" width="171" height="6" viewBox="0 0 171 6"
                                     fill="none" className="about-title-underline">
                                    <path
                                        d="M0.113249 3L3 5.88675L5.88675 3L3 0.113249L0.113249 3ZM170.887 3L168 0.113249L165.113 3L168 5.88675L170.887 3ZM3 3.5H168V2.5H3V3.5Z"
                                        fill="white"/>
                                </svg>
                                <div>EXUBERANT adalah acara tahunan SMAK PENABUR redacted yang berisikan perlombaan
                                    akademik dan non-akedemik untuk jenjang SMP dan SMA setingkat.
                                </div>
                            </div>
                            <div className="about-image"
                                 style={{backgroundImage: `url(${PictureManager.homePicture.normal})`}}/>
                        </div>
                    </div>

                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 238" fill="none" className="page-2-wave">
                        <path
                            d="M-218 0.399994L-182.4 22.4275C-146.933 44.125 -75.3333 88.675 -4.66666 92.8C66.4 96.925 138 62.275 208.667 75.2275C279.733 88.675 351.333 149.725 422 167.628C493.067 185.2 564.667 158.8 635.333 123.573C706.4 88.675 778 44.125 848.667 53.2C919.733 62.275 991.333 123.325 1062 158.8C1133.07 194.275 1204.67 202.525 1275.33 172C1346.4 141.475 1418 70.525 1488.67 48.8275C1559.73 26.8 1631.33 53.2 1666 66.4L1702 79.6V238H1666.4C1630.93 238 1559.33 238 1488.67 238C1417.6 238 1346 238 1275.33 238C1204.27 238 1132.67 238 1062 238C990.933 238 919.333 238 848.667 238C777.6 238 706 238 635.333 238C564.267 238 492.667 238 422 238C350.933 238 279.333 238 208.667 238C137.6 238 66 238 -4.66666 238C-75.7333 238 -147.333 238 -182 238H-218V0.399994Z"
                            fill="#1D3827"/>
                    </svg>
                </div>
                <div className="page-3-parent">
                    <div className="page-3-fireflies-background"/>
                    <div className="page-3-gradient-background"
                         style={{backgroundImage: `url(${PictureManager.gradient})`}}/>
                    <div className="page-3">
                        <img src={PictureManager.querencia} alt="logo of EXUBERANT" className="page-3-logo"/>
                        <div className="page-3-content">
                            Tahun ini, EXUBERANT hadir dengan judul QUERENCIA dan slogan
                            “When Dreams and Reality Collide”
                            QUERENCIA bermakna tempat di mana seseorang merasa aman dan nyaman. Aman dan nyaman untuk
                            tumbuh dan berkembang serta saling terhubung satu dengan yang lain.
                        </div>
                    </div>

                    <div className="page-3-informations">
                        <div>
                            <div className="page-3-information">
                                <svg xmlns="http://www.w3.org/2000/svg" width="66" height="75" viewBox="0 0 66 75"
                                     fill="none">
                                    <path
                                        d="M24.3779 34.375H18.9613V40.625H24.3779V34.375ZM35.2113 34.375H29.7946V40.625H35.2113V34.375ZM46.0446 34.375H40.6279V40.625H46.0446V34.375ZM51.4613 12.5H48.7529V6.25H43.3363V12.5H21.6696V6.25H16.2529V12.5H13.5446C10.5383 12.5 8.15501 15.3125 8.15501 18.75L8.12793 62.5C8.12793 64.1576 8.69861 65.7473 9.71443 66.9194C10.7303 68.0915 12.108 68.75 13.5446 68.75H51.4613C54.4404 68.75 56.8779 65.9375 56.8779 62.5V18.75C56.8779 15.3125 54.4404 12.5 51.4613 12.5ZM51.4613 62.5H13.5446V28.125H51.4613V62.5Z"
                                        fill="white"/>
                                </svg>
                                <div className="page-3-information-title">30 Oktober - 4 November 2023</div>
                            </div>
                            <div className="page-3-information">
                                <svg xmlns="http://www.w3.org/2000/svg" width="66" height="52" viewBox="0 0 66 52"
                                     fill="none">
                                    <g clipPath="url(#clip0_80_149)">
                                        <path
                                            d="M62.9458 47.0652L58.503 36.4H53.628L56.3353 46.8H8.67079L11.378 36.4H6.50304L2.05704 47.0652C0.929293 49.7796 2.92804 52 6.50304 52H58.503C62.078 52 64.0768 49.7796 62.9458 47.0652ZM48.753 13C48.753 9.55219 47.041 6.24558 43.9935 3.80761C40.9461 1.36964 36.8128 0 32.503 0C28.1933 0 24.06 1.36964 21.0126 3.80761C17.9651 6.24558 16.253 9.55219 16.253 13C16.253 25.415 32.503 39 32.503 39C32.503 39 48.753 25.415 48.753 13ZM23.728 13.156C23.728 12.2342 23.955 11.3215 24.3961 10.47C24.8371 9.6184 25.4835 8.84469 26.2984 8.19303C27.1133 7.54137 28.0806 7.02453 29.1452 6.67202C30.2099 6.31952 31.3508 6.13826 32.503 6.1386C34.8299 6.1386 37.0614 6.87807 38.7068 8.19433C40.3521 9.51059 41.2764 11.2958 41.2764 13.1573C41.2764 15.0188 40.3521 16.804 38.7068 18.1203C37.0614 19.4365 34.8299 20.176 32.503 20.176C30.1758 20.176 27.9438 19.4364 26.2982 18.1199C24.6525 16.8034 23.728 15.0178 23.728 13.156Z"
                                            fill="white"/>
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_80_149">
                                            <rect width="65" height="52" fill="white"
                                                  transform="translate(0.00292969)"/>
                                        </clipPath>
                                    </defs>
                                </svg>
                                <div className="page-3-information-title">SMAK PENABUR redacted</div>
                            </div>
                        </div>
                        <div className={`page-3-daftar transition ${registOpen ? "" : "regist-close"}`}
                             onClick={() => registOpen ? Analytics.onButtonClick([{
                                 from: "home",
                                 to: "register"
                             }], (() => window.location.href = "/register")()) : void 0}>
                            <p>Daftar</p>
                            <svg xmlns="http://www.w3.org/2000/svg" width="62" height="61" viewBox="0 0 62 61"
                                 fill="none">
                                <path
                                    d="M30.5039 15.25L27.778 17.9054L38.4148 28.5938H15.2539V32.4062H38.4148L27.778 43.0298L30.5039 45.75L45.7539 30.5L30.5039 15.25Z"
                                    fill="#1D3827"/>
                                <path
                                    d="M30.5039 57.1875C25.2256 57.1875 20.0659 55.6223 15.6771 52.6899C11.2884 49.7574 7.8678 45.5894 5.84788 40.7129C3.82797 35.8364 3.29947 30.4704 4.32921 25.2935C5.35895 20.1167 7.90069 15.3614 11.633 11.6291C15.3653 7.89679 20.1206 5.35505 25.2974 4.3253C30.4743 3.29556 35.8403 3.82406 40.7168 5.84398C45.5933 7.86389 49.7613 11.2845 52.6938 15.6732C55.6262 20.062 57.1914 25.2217 57.1914 30.5C57.1833 37.5755 54.369 44.3589 49.3659 49.362C44.3628 54.3651 37.5794 57.1794 30.5039 57.1875ZM30.5039 7.62501C25.9797 7.62501 21.557 8.96661 17.7952 11.4801C14.0335 13.9937 11.1015 17.5663 9.37017 21.7461C7.63882 25.926 7.18582 30.5254 8.06846 34.9627C8.95109 39.4 11.1297 43.476 14.3288 46.6751C17.528 49.8742 21.6039 52.0528 26.0412 52.9355C30.4785 53.8181 35.0779 53.3651 39.2578 51.6338C43.4377 49.9024 47.0102 46.9705 49.5238 43.2087C52.0373 39.4469 53.3789 35.0243 53.3789 30.5C53.3719 24.4354 50.9595 18.6211 46.6712 14.3327C42.3828 10.0444 36.5686 7.63208 30.5039 7.62501Z"
                                    fill="#1D3827"/>
                            </svg>
                        </div>
                    </div>

                    <div className="page-3-merch">
                        <div className="page-3-gradient"/>
                        <div className="page-3-merch-button transition" onClick={() => Analytics.onButtonClick([{
                            from: "home",
                            to: "merch"
                        }], window.open("https://merch.redacted.redacted"))}>
                            CHECK OUT OUR MERCH!!!
                            <svg width="169" height="115" viewBox="0 0 169 115" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M39.8999 5.75L31.9199 14.375L74.0999 57.5L31.9199 100.625L39.8999 109.25L91.1999 57.5L39.8999 5.75Z"
                                    fill="black"/>
                                <path
                                    d="M94.8999 5.75L86.9199 14.375L129.1 57.5L86.9199 100.625L94.8999 109.25L146.2 57.5L94.8999 5.75Z"
                                    fill="black"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className={"page-4-parent"}>
                    <img className={"page-3-left-tree-first"} src={PictureManager.leftTree} alt="tree"/>
                    <img className={"page-3-right-tree-first"} src={PictureManager.rightTree} alt="tree"/>
                    <img className={"page-3-left-tree-second"} src={PictureManager.leftTree} alt="tree"/>
                    <img className={"page-3-right-tree-second"} src={PictureManager.rightTree} alt="tree"/>
                    <img className={"page-3-left-root"} src={PictureManager.leftRoot} alt="tree"/>
                    <img className={"page-3-right-root"} src={PictureManager.rightRoot} alt="tree"/>
                    <div className={"page-4-trailer"}>
                        <div className={"page-4-trailer-title"}>TRAILER</div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="531" height="6" viewBox="0 0 531 6" fill="none"
                             className={"page-4-trailer-title-underline"}>
                            <path
                                d="M0.113249 3L3 5.88675L5.88675 3L3 0.113249L0.113249 3ZM530.887 3L528 0.113249L525.113 3L528 5.88675L530.887 3ZM3 3.5L528 3.5L528 2.5L3 2.5L3 3.5Z"
                                fill="white"/>
                        </svg>
                        <div className={"page-4-trailer-video-parent"}>
                            <div className={"page-4-trailer-video"}>
                                <iframe width="100%" style={{aspectRatio: "2.38/1"}}
                                        src="https://www.youtube.com/embed/23rc23rc23r23rc"
                                        title="YouTube video player" frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen></iframe>
                                {/*<ReactPlayer url={recapVideo} controls={true} height={"auto"} width={"100%"} />*/}
                                {/*<ReactPlayer url={recapVideo} controls={true} height={"auto"} width={"100%"} />*/}
                                {/*<img src={PictureManager.trailerThumbnail} alt={"trailer coming soon"} style={{aspectRatio: "16/9", width: "100%"}} />*/}
                            </div>
                        </div>
                    </div>
                    <div className={"page-4-gallery"}>
                        <div className={"page-4-trailer-title"}>Gallery</div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="531" height="6" viewBox="0 0 531 6" fill="none"
                             className={"page-4-trailer-title-underline"}>
                            <path
                                d="M0.113249 3L3 5.88675L5.88675 3L3 0.113249L0.113249 3ZM530.887 3L528 0.113249L525.113 3L528 5.88675L530.887 3ZM3 3.5L528 3.5L528 2.5L3 2.5L3 3.5Z"
                                fill="white"/>
                        </svg>
                        <div className={"page-4-gallery-photos"}>
                            <div className={"page-4-gallery-selector-parent"}>
                                {["Opening", "Basketball", "Futsal", "MD", "Solo Vocal", "Panitia", "Closing"].map((v, i) => (
                                    <div className={"page-4-gallery-selector" + (i === galleryPage ? " selected" : "")}
                                         key={i}
                                         onClick={() => Analytics.onButtonClick([{type: "changeGalleryCategory"}], setGalleryPage(i))}>
                                        <p>{v}</p></div>
                                ))}
                            </div>
                            <div className={"page-4-gallery-photos-parent"}>
                                {renderGallery(galleryPage)}
                            </div>
                        </div>
                        <div className={"page-4-recap"}>
                            <div className={"page-4-trailer-title"}>RECAP</div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="531" height="6" viewBox="0 0 531 6"
                                 fill="none" className={"page-4-trailer-title-underline"}>
                                <path
                                    d="M0.113249 3L3 5.88675L5.88675 3L3 0.113249L0.113249 3ZM530.887 3L528 0.113249L525.113 3L528 5.88675L530.887 3ZM3 3.5L528 3.5L528 2.5L3 2.5L3 3.5Z"
                                    fill="white"/>
                            </svg>
                            <div className={"page-4-trailer-video-parent"}>
                                <div className={"page-4-recap-video"}>
                                    <ReactPlayer url={recapVideo} controls={true} height={"auto"} width={"100%"}
                                                 light={PictureManager.recapThumbnail}/>
                                </div>
                            </div>
                        </div>
                        <div className={"page-4-register"}>
                            <div className={"page-4-register-gradient"}/>
                            <div className={"page-4-register-title"}>REGISTRATION</div>
                            {!registOpen &&
                                <div className={"page-4-register-not-open"}>Registration is closed.</div>}
                            <div className={"page-4-register-competitions-parent-parent"}>
                                <div className={"page-4-register-competitions-button page-4-previous"}
                                     onClick={() => document.getElementsByClassName("page-4-register-competitions-parent")[0].scrollLeft -= 800}/>
                                <div className={"page-4-register-competitions-parent"}>
                                    {competitions.filter(({id}) => !["RnV0c2FsIFB1dHJhSg", "TW9kZXJuIERhbmNlSg"].includes(id)).map((comp, i) => (
                                        <div className={"page-4-register-competition transition"} key={i}
                                             style={{backgroundImage: `url(${getImageUriFromId(comp.id)})`, pointerEvents: registOpen && openCompetitions.includes(comp.id)  ? "auto" : "none"}}
                                             onClick={() => Analytics.onButtonClick([{
                                                 type: "competitionRegisterClicked",
                                                 competition: comp.nickname
                                             }], setSelectedCompetition(comp))}>
                                            <section className={"page-4-register-competition-black"}/>
                                            <span>{comp.nickname}</span>
                                            <div className={"page-4-register-competition-content transition"}>
                                                <div className={"page-4-register-competition-content-data"}>
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="800"
                                                        height="800"
                                                        fill="#FFF"
                                                        viewBox="0 0 32 32"
                                                    >
                                                        <path
                                                            d="M31 7H1a1 1 0 00-1 1v16a1 1 0 001 1h30a1 1 0 001-1V8a1 1 0 00-1-1zm-5.91 16H6.91A6 6 0 002 18.09v-4.18A6 6 0 006.91 9h18.18A6 6 0 0030 13.91v4.18A6 6 0 0025.09 23zM30 11.86A4 4 0 0127.14 9H30zM4.86 9A4 4 0 012 11.86V9zM2 20.14A4 4 0 014.86 23H2zM27.14 23A4 4 0 0130 20.14V23zM7.51.71a1 1 0 00-.76-.1 1 1 0 00-.61.46l-2 3.43a1 1 0 001.74 1l1.5-2.56 5.07 2.93a1 1 0 001-1.74zM24.49 31.29a1 1 0 00.5.14.78.78 0 00.26 0 1 1 0 00.61-.46l2-3.43a1 1 0 10-1.74-1l-1.48 2.56-5.07-2.93a1 1 0 00-1 1.74z"></path>
                                                        <path
                                                            d="M16 10a6 6 0 106 6 6 6 0 00-6-6zm0 10a4 4 0 114-4 4 4 0 01-4 4z"></path>
                                                    </svg>
                                                    <p>{comp.oldPrice !== comp.price &&
                                                        <small>{new Intl.NumberFormat('id-ID', {
                                                            style: 'currency',
                                                            currency: 'IDR'
                                                        }).format(Number(comp.oldPrice))}</small>} {new Intl.NumberFormat('id-ID', {
                                                        style: 'currency',
                                                        currency: 'IDR'
                                                    }).format(Number(comp.price))} <br/> + Rp 50.000,00 WO</p>
                                                </div>
                                                <div className={"page-4-register-competition-content-data"}>
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="800"
                                                        height="800"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            stroke="#fff"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="1.5"
                                                            d="M18 7.16a.605.605 0 00-.19 0 2.573 2.573 0 01-2.48-2.58c0-1.43 1.15-2.58 2.58-2.58a2.58 2.58 0 012.58 2.58A2.589 2.589 0 0118 7.16zM16.97 14.44c1.37.23 2.88-.01 3.94-.72 1.41-.94 1.41-2.48 0-3.42-1.07-.71-2.6-.95-3.97-.71M5.97 7.16c.06-.01.13-.01.19 0a2.573 2.573 0 002.48-2.58C8.64 3.15 7.49 2 6.06 2a2.58 2.58 0 00-2.58 2.58c.01 1.4 1.11 2.53 2.49 2.58zM7 14.44c-1.37.23-2.88-.01-3.94-.72-1.41-.94-1.41-2.48 0-3.42 1.07-.71 2.6-.95 3.97-.71M12 14.63a.605.605 0 00-.19 0 2.573 2.573 0 01-2.48-2.58c0-1.43 1.15-2.58 2.58-2.58a2.58 2.58 0 012.58 2.58c-.01 1.4-1.11 2.54-2.49 2.58zM9.09 17.78c-1.41.94-1.41 2.48 0 3.42 1.6 1.07 4.22 1.07 5.82 0 1.41-.94 1.41-2.48 0-3.42-1.59-1.06-4.22-1.06-5.82 0z"
                                                        ></path>
                                                    </svg>
                                                    <p>{comp.participants.min === -1 ? `1 Peserta` : comp.participants.min === comp.participants.max ? `${comp.participants.min} Peserta` : `${comp.participants.min} - ${comp.participants.max} Peserta`}</p>
                                                </div>
                                                <div className={"page-4-register-competition-content-data"}>
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        id="Layer_1"
                                                        width="800"
                                                        height="800"
                                                        version="1.1"
                                                        viewBox="0 0 48 48"
                                                        xmlSpace="preserve"
                                                    >
                                                        <style id="style2" type="text/css"></style>
                                                        <path
                                                            id="path4"
                                                            fill="#fff"
                                                            d="M10.756 13.802l4.824 2.275v5.34a.5.5 0 00.5.5h15.84a.5.5 0 00.5-.5v-5.34l4.11-1.938v3.578a1.498 1.498 0 00-1.001 1.409c0 .828.673 1.501 1.501 1.501.828 0 1.501-.673 1.501-1.501 0-.652-.42-1.202-1.001-1.409V13.35a.495.495 0 00-.068-.238c-.01-.019-.022-.034-.035-.051a.481.481 0 00-.159-.142c-.008-.005-.012-.015-.021-.019l-13.03-6.28a.503.503 0 00-.435 0l-13.03 6.28a.5.5 0 00.004.902zm20.664 7.115H16.58v-7.04l1.459-.233a37.48 37.48 0 0111.921 0l1.459.233v7.04zm5.61-1.29a.502.502 0 010-1.002.502.502 0 010 1.002zM24 7.625l11.868 5.72-3.448 1.626V13.45a.5.5 0 00-.037-.185c-.008-.02-.022-.037-.033-.056a.461.461 0 00-.066-.097c-.017-.018-.037-.031-.057-.047a.455.455 0 00-.09-.06c-.024-.012-.049-.018-.075-.026-.022-.007-.041-.019-.065-.023l-1.879-.3a38.477 38.477 0 00-12.239 0l-1.88.3c-.023.004-.042.016-.064.023-.026.008-.051.014-.075.026-.033.016-.061.038-.089.06-.019.016-.04.029-.057.047-.027.029-.046.063-.065.097-.011.019-.025.035-.033.056a.496.496 0 00-.037.185v1.521l-3.448-1.626L24 7.625z"
                                                        ></path>
                                                        <path
                                                            id="path6"
                                                            fill="#fff"
                                                            d="M7.5 41.5h33a.5.5 0 00.5-.5V30a.5.5 0 00-.5-.5H30V24a.5.5 0 00-.5-.5h-11a.5.5 0 00-.5.5v8H7.5a.5.5 0 00-.5.5V41a.5.5 0 00.5.5zm32.5-11v10H30v-10h10zm-21-6h10v16H19v-16zM8 33h10v7.5H8V33z"
                                                        ></path>
                                                    </svg>
                                                    <p>{["RnV0c2FsIFB1dHJhUw", "TW9kZXJuIERhbmNlUw"].includes(comp.id) ? "SMA/SMP" : (comp.schoolLevel === "Senior" ? "SMA" : comp.schoolLevel === "Junior" ? "SMP" : "SMA/SMP")}</p>
                                                </div>
                                            </div>
                                        </div>))}
                                </div>
                                <div className={"page-4-register-competitions-button page-4-next"}
                                     onClick={() => document.getElementsByClassName("page-4-register-competitions-parent")[0].scrollLeft += 800}/>
                            </div>
                        </div>
                    </div>

                    <svg xmlns="http://www.w3.org/2000/svg" width="1440" height="238" viewBox="0 0 1440 238" fill="none"
                         className={"page-3-wave"}>
                        <path
                            d="M-267 0.399902L-231.4 22.4274C-195.933 44.1249 -124.333 88.6749 -53.6667 92.7999C17.4 96.9249 89 62.2749 159.667 75.2274C230.733 88.6749 302.333 149.725 373 167.627C444.067 185.2 515.667 158.8 586.333 123.572C657.4 88.6749 729 44.1249 799.667 53.1999C870.733 62.2749 942.333 123.325 1013 158.8C1084.07 194.275 1155.67 202.525 1226.33 172C1297.4 141.475 1369 70.5249 1439.67 48.8274C1510.73 26.7999 1582.33 53.1999 1617 66.3999L1653 79.5999V238H1617.4C1581.93 238 1510.33 238 1439.67 238C1368.6 238 1297 238 1226.33 238C1155.27 238 1083.67 238 1013 238C941.933 238 870.333 238 799.667 238C728.6 238 657 238 586.333 238C515.267 238 443.667 238 373 238C301.933 238 230.333 238 159.667 238C88.6 238 17 238 -53.6667 238C-124.733 238 -196.333 238 -231 238H-267V0.399902Z"
                            fill="#ACB88E"/>
                    </svg>
                </div>
                <div className={"page-5-parent"}>
                    <div className={"page-5-title"}>COUNTDOWN</div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="531" height="6" viewBox="0 0 531 6" fill="none">
                        <path
                            d="M0.113249 3L3 5.88675L5.88675 3L3 0.113249L0.113249 3ZM530.887 3L528 0.113249L525.113 3L528 5.88675L530.887 3ZM3 3.5L528 3.5L528 2.5L3 2.5L3 3.5Z"
                            fill="#1D3827"/>
                    </svg>
                    <div className={"page-5-countdown"}>
                        <span>{countdown}</span>
                    </div>
                    {/*<div className={"page-5-title"} style={{marginTop: "100px"}}>OUR SPONSORS</div>*/}
                    {/*<svg xmlns="http://www.w3.org/2000/svg" width="531" height="6" viewBox="0 0 531 6" fill="none">*/}
                    {/*    <path*/}
                    {/*        d="M0.113249 3L3 5.88675L5.88675 3L3 0.113249L0.113249 3ZM530.887 3L528 0.113249L525.113 3L528 5.88675L530.887 3ZM3 3.5L528 3.5L528 2.5L3 2.5L3 3.5Z"*/}
                    {/*        fill="#1D3827"/>*/}
                    {/*</svg>*/}
                    {/*<div className={"page-5-sponsors"}>*/}
                    {/*    {sponsors.map((sponsor, i) => (*/}
                    {/*        <img className={"page-5-sponsor"} key={i} src={sponsor} alt={"sponsor"}/>*/}
                    {/*    ))}*/}
                    {/*</div>*/}
                    <div className={"page-5-title"} style={{marginTop: "100px"}}>SPONSORED BY</div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="531" height="6" viewBox="0 0 531 6" fill="none">
                        <path
                            d="M0.113249 3L3 5.88675L5.88675 3L3 0.113249L0.113249 3ZM530.887 3L528 0.113249L525.113 3L528 5.88675L530.887 3ZM3 3.5L528 3.5L528 2.5L3 2.5L3 3.5Z"
                            fill="#1D3827"/>
                    </svg>
                    <div className={"page-5-sponsors"}>
                        {sponsor.map(([, sponsor], i) => (
                            <img className={"page-5-sponsor"} key={i} src={sponsor} alt={"sponsor"}/>
                        ))}
                    </div>

                    <div className={"page-5-title"} style={{marginTop: "100px"}}>SUPPORTED BY</div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="531" height="6" viewBox="0 0 531 6" fill="none">
                        <path
                            d="M0.113249 3L3 5.88675L5.88675 3L3 0.113249L0.113249 3ZM530.887 3L528 0.113249L525.113 3L528 5.88675L530.887 3ZM3 3.5L528 3.5L528 2.5L3 2.5L3 3.5Z"
                            fill="#1D3827"/>
                    </svg>
                    <div className={"page-5-sponsors"}>
                        {didukung.map(([, sponsor], i) => (
                            <img className={"page-5-sponsor"} key={i} src={sponsor} alt={"sponsor"}/>
                        ))}
                    </div>
                </div>

                <Footer/>
            </>}
        </>
    );
}

export default App;
