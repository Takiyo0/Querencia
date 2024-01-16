import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import {RestManager} from "../rest/RestManager";
import {Checkbox} from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";

export default function AdminConfig() {
    const [registrationOpen, setRegistrationOpen] = React.useState<boolean>(false);
    const [competitions, setCompetitions] = React.useState<{name: string, id: string, open: boolean}[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const abort = React.useMemo(() => new AbortController(), []);

    React.useEffect(() => {
        collectCompetitions();
        return () => abort.abort();
    }, []);

    async function collectCompetitions(tries?: number) {
        if (tries === undefined) tries = 0;
        if (tries > 5) return;
        setLoading(true);
        Promise.all([
            RestManager.getRegisterStatus(abort.signal),
            RestManager.getCompetitionList(abort.signal),
            RestManager.getOpenCompetitionList(abort.signal)
        ]).then(([compOpen, comps, openComps]) => {
            setRegistrationOpen(compOpen);
            setCompetitions(comps.competitions.map((comp) => {
                return ({name: `${comp.name} - ${["RnV0c2FsIFB1dHJhUw", "TW9kZXJuIERhbmNlUw"].includes(comp.id) ? "SMA/SMP" : ["VmlkZW8gRWRpdGluZ1M"].includes(comp.id) ? "Umum" : comp.schoolLevel === "Junior" ? "SMP" : comp.schoolLevel === "Senior" ? "SMA" : "Umum (SMA & SMP)"}`, id: comp.id, open: !!openComps.open.find((id) => id === comp.id)});
            }));
        }).catch(() => {
            if (tries !== undefined)  collectCompetitions(tries + 1);
        }).finally(() => setLoading(false));
    }

    function changeCompetitionOpen(id: string, open: boolean) {
        setLoading(true);
        RestManager.setClosedCompetition(abort.signal, id, open).then(() => collectCompetitions()).catch(() => collectCompetitions());
    }

    function changeRegistrationOpen(open: boolean) {
        setLoading(true);
        RestManager.setRegisterStatus(abort.signal, open).then(() => collectCompetitions()).catch(() => collectCompetitions());
    }

    return <>
        <Typography variant={"h4"} component={"h4"} gutterBottom color={"#fff"}>
            Config
        </Typography>

        <Box sx={{display: "flex", alignItems: "center", marginTop: 5}}>
            <Typography variant={"h6"} component={"h6"} gutterBottom color={"#fff"} sx={{borderRight: "1px white solid", paddingRight: 2, margin: 0}}>
                Registration Open
            </Typography>

            <Switch inputProps={{'aria-label': "Show rejected"}} disabled={loading}
                    onChange={(event) => changeRegistrationOpen(event.target.checked)}
                    checked={registrationOpen} color={"primary"} sx={{color: "#fff"}}/>
        </Box>

        {registrationOpen && <>
            <Typography variant={"h6"} component={"h6"} gutterBottom color={"#fff"} sx={{margin: 0}}>
                <Box sx={{display: "flex", marginTop: 5}}>
                    <Typography variant={"h6"} component={"h6"} gutterBottom color={"#fff"} sx={{borderRight: "1px white solid", paddingRight: 2, margin: 0}}>
                        Competitions
                    </Typography>

                    <Box sx={{display: "flex", flexDirection: "column", marginLeft: 2}}>
                        {competitions.filter(({id}) => !["RnV0c2FsIFB1dHJhSg", "TW9kZXJuIERhbmNlSg"].includes(id)).map(({name, id, open}, index) => {
                            return <FormControlLabel key={index} control={<Checkbox checked={open} disabled={loading} onChange={(event) => changeCompetitionOpen(id, event.target.checked)}  sx={{color: "#fff"}}/>} label={name}/>
                        })}
                    </Box>
                </Box>
            </Typography>
            </>}
    </>
}