import React from "react";
import {RestManager, SponsorData} from "../rest/RestManager";

import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import FileCopyIcon from '@mui/icons-material/FileCopyOutlined';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from "@mui/material/Typography";
import Stack from '@mui/material/Stack';
import CreateIcon from '@mui/icons-material/Create';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {styled} from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LoadingButton from '@mui/lab/LoadingButton';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Backdrop from '@mui/material/Backdrop';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import CircularProgress from "@mui/material/CircularProgress";

const VisuallyHiddenInput = styled('input')({
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

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 250,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
};

const actions = [
    {icon: <CreateIcon/>, name: 'Create'}
];

export default function AdminSponsor() {
    const [sponsor, setSponsor] = React.useState<SponsorData[] | undefined>();
    const [open, setOpen] = React.useState(false);
    const [sendLoading, setSendLoading] = React.useState(false);
    const [deleteLoading, setDeleteLoading] = React.useState(false);
    const [modifyLoading, setModifyLoading] = React.useState(false);
    const [disabled, setDisabled] = React.useState<boolean>(true);
    const [newData, setNewData] = React.useState<SponsorData>({id: "", name: "", icon: "", video: null, views: 0});
    const [iconFile, setIconFile] = React.useState<React.ChangeEvent<HTMLInputElement> | null>(null);
    const [videoFile, setVideoFile] = React.useState<React.ChangeEvent<HTMLInputElement> | null>(null);
    const [deletion, setDeletion] = React.useState<string>("");
    const [modify, setModify] = React.useState<SponsorData | null>(null);
    const [modifiedIcon, setModifiedIcon] = React.useState<React.ChangeEvent<HTMLInputElement> | null>(null);
    const [modifiedVideo, setModifiedVideo] = React.useState<React.ChangeEvent<HTMLInputElement> | null>(null);

    const abort = React.useMemo(() => new AbortController(), []);

    function handleClose() {
        setOpen(false);
        setIconFile(null);
        setVideoFile(null);
        setNewData({id: "", name: "", icon: "", video: null, views: 0});
    }

    function handleModifyClose() {
        setModify(null);
        setModifiedIcon(null);
        setModifiedVideo(null);
    }

    async function handleAdd() {
        if (newData.name.length === 0 || !iconFile || !iconFile.target.files) return;
        setSendLoading(true);
        await RestManager.createSponsorship(abort.signal, newData.name, iconFile.target.files[0], videoFile && videoFile.target.files ? videoFile.target.files[0] : null);
        handleClose();
        getSponsors().finally(() => setSendLoading(false));

    }

    async function handleModify() {
        if (!modify || (!modifiedIcon && !modifiedVideo)) return handleModifyClose();
        setModifyLoading(true);
        await RestManager.updateSponsorship(abort.signal, modify.id, {icon: modifiedIcon && modifiedIcon.target.files ? modifiedIcon.target.files[0] : null, video: modifiedVideo && modifiedVideo.target.files ? modifiedVideo.target.files[0] : null});
        handleModifyClose();
        getSponsors().finally(() => setModifyLoading(false));
    }

    async function getSponsors() {
        const response = await RestManager.getSponsorship(abort.signal).then(x => x.data).catch(() => []);
        setSponsor(response);
    }

    async function handleDelete() {
        if (deletion.length === 0) return;
        setDeleteLoading(true);
        await RestManager.deleteSponsorship(abort.signal, deletion);
        setDeletion("");
        getSponsors().finally(() => setDeleteLoading(false));
    }

    React.useEffect(() => {
        if (newData.name.length > 0 && iconFile) setDisabled(false);
        else setDisabled(true);
    }, [newData, iconFile, videoFile]);

    React.useEffect(() => {
        getSponsors();
        return () => abort.abort();
    }, []);

    return <>
        <Typography variant="h4" component="h4" gutterBottom color={"#fff"}>
            Sponsorship
        </Typography>
        <Box sx={{width: '100%'}}>
            <Grid container spacing={{xs: 2, md: 3}} columns={{xs: 4, sm: 8, md: 12}}>
                {sponsor ? sponsor.length ? sponsor.map((s, i) => <Card sx={{width: 230, margin: 1}}>
                    <CardMedia
                        sx={{height: 140}}
                        image={s.icon}
                        title={s.name + "'s logo"}
                    />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            {s.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Video available? {s.video ? "Yes" : "No"}<br/>
                            Views: {s.views} view{s.views > 1 ? "s" : ""}
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button size="small" onClick={() => setDeletion(s.id)}>Delete</Button>
                        <Button size="small" onClick={() => setModify(s)}>Edit</Button>
                    </CardActions>
                </Card>) : <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", width: "100%"}}>
                    <SentimentVeryDissatisfiedIcon sx={{color: "white"}} fontSize={'large'} />
                    <Typography variant="h6" component="h6" gutterBottom color={"#fff"}>
                        No sponsors found
                    </Typography>
                </Box> : <CircularProgress sx={{color: "rgb(255,255,255)"}}/>}
            </Grid>
        </Box>
        <Box sx={{height: 320, position: 'fixed', bottom: 67, right: 10, flexGrow: 1}}>
            <SpeedDial
                ariaLabel="SpeedDial basic example"
                sx={{position: 'absolute', bottom: 16, right: 16}}
                icon={<SpeedDialIcon/>}
            >
                {actions.map((action) => (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        onClick={() => setOpen(true)}
                    />
                ))}
            </SpeedDial>
        </Box>
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Add Sponsor</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Add a sponsor to the website to be displayed on the sponsor page.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Sponsor name"
                    type="name"
                    fullWidth
                    variant="standard"
                    required={true}
                    value={newData.name}
                    onChange={(e: any) => setNewData((d) => ({...d, name: e.target.value}))}
                />
                <Button component="label" variant="contained" startIcon={<CloudUploadIcon/>} sx={{marginTop: 1}}>
                    Upload Sponsor Logo
                    [{iconFile && iconFile.target.files ? iconFile.target.files[0].name : "No file selected"}]
                    <VisuallyHiddenInput type="file" onChange={(e) => setIconFile(e)}/>
                </Button>
                <Button component="label" variant="contained" startIcon={<CloudUploadIcon/>} sx={{marginTop: 1}}>
                    Upload Sponsor Video (optional)
                    [{videoFile && videoFile.target.files ? videoFile.target.files[0].name : "No file selected"}]
                    <VisuallyHiddenInput type="file" onChange={(e) => setVideoFile(e)}/>
                </Button>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <LoadingButton
                    loading={sendLoading}
                    loadingPosition="start"
                    startIcon={<SaveIcon/>}
                    variant="outlined"
                    disabled={disabled}
                    onClick={handleAdd}
                >
                    Save
                </LoadingButton>
            </DialogActions>
        </Dialog>

        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={!!modify}
            onClose={handleModifyClose}
            closeAfterTransition
            slots={{backdrop: Backdrop}}
            slotProps={{
                backdrop: {
                    timeout: 500,
                },
            }}
        >
            <Fade in={!!modify}>
                <Box sx={style}>
                    <img src={modify?.icon} alt={modify?.name + "'s logo"} style={{width: "100%"}}/>
                    <Box sx={{p: 2}}>
                        <Typography id="transition-modal-title" variant="h6" component="h2">
                            {modify?.name}
                        </Typography>
                        <Button component="label" variant="contained" startIcon={<CloudUploadIcon/>}
                                sx={{marginTop: 1}}>
                            Upload Sponsor Logo
                            [{modifiedIcon && modifiedIcon.target.files ? modifiedIcon.target.files[0].name : modify?.icon ? modify.icon.replace("https://cdn.redacted.redacted/", "") : "Not set"}]
                            <VisuallyHiddenInput type="file" onChange={(e) => setModifiedIcon(e)}/>
                        </Button>
                        <Button component="label" variant="contained" startIcon={<CloudUploadIcon/>}
                                sx={{marginTop: 1}}>
                            Upload Sponsor Video (optional)
                            [{modifiedVideo && modifiedVideo.target.files ? modifiedVideo.target.files[0].name : modify?.video ? modify.video : "Not set"}]
                            <VisuallyHiddenInput type="file" accept={"image/png, image/jpeg"} onChange={(e) => setModifiedVideo(e)}/>
                        </Button>
                        <Box sx={{display: "flex", justifyContent: "flex-end", marginTop: 2}}>
                            <Button onClick={handleModifyClose}>Cancel</Button>
                            <LoadingButton
                                loading={modifyLoading}
                                loadingPosition="start"
                                startIcon={<SaveIcon/>}
                                variant="outlined"
                                onClick={handleModify}
                                sx={{marginLeft: 5}}
                            >
                                Save
                            </LoadingButton>
                        </Box>
                    </Box>
                </Box>
            </Fade>
        </Modal>

        <Dialog
            open={deletion.length > 0}
            onClose={() => setDeletion("")}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {"Confirm you want to delete " + sponsor?.find(x => x.id === deletion)?.name ?? "unknown error" + "?"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    This will delete all data related to this sponsor, including the logo and video and will be removed
                    from the site. This action cannot be undone.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setDeletion("")}>Cancel</Button>
                <LoadingButton
                    loading={deleteLoading}
                    loadingPosition="start"
                    startIcon={<DeleteIcon/>}
                    variant="outlined" color="error"
                    onClick={handleDelete}
                >
                    Confirm
                </LoadingButton>
            </DialogActions>
        </Dialog>
    </>
}