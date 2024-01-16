import BaseRoute from "../../Base/Route";
import crypto from "crypto";
import RegistrationSchema from "../../Schema/Registration";
import {RestRouteManager} from "../RestRouteManager";
import {Email} from "../../Rest/Email";
import {createTicket} from "../../Rest/Canvas";
import {CustomMap} from "../../Base/CustomMap";
import multer from "multer";
import FormData from "form-data";
import axios from "axios";
import UnfinishedDataSchema from "../../Schema/UnfinishedData";
import AnalyticsSchema from "../../Schema/Analytics";
import SystemSchema from "../../Schema/System";

const storage = multer.memoryStorage();

export default class Register extends BaseRoute {
    private cachedQrBuffer: CustomMap<string, Buffer> = new CustomMap(1000 * 60 * 60 * 12);

    constructor(manager: RestRouteManager) {
        super();

        this.router.post('/', async (req, res) => {
            const {competitionId, data: _data} = req.body;
            if (!competitionId || !_data) return this.badRequest(res, 'Invalid data.');
            if (typeof competitionId !== 'string') return this.badRequest(res, 'Invalid competition ID.');
            const competition = manager.sheetsManager.competitions.get(competitionId);
            if (!competition) return this.badRequest(res, 'Competition not found.');
            if (!_data.teacher || !_data.participant) return this.badRequest(res, 'Invalid data II.');
            if (!_data.files.paymentProof) return this.badRequest(res, 'Payment proof is required.');

            // || !_data.files || !_data.files.passPhotoAndStudentCard || !_data.files.teacherPassPhoto || !_data.files.schoolLetter || !_data.files.paymentProof

            if (!Array.isArray(_data.teacher) || !Array.isArray(_data.participant)) return this.badRequest(res, 'Invalid data III.');

            const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const token = crypto.randomBytes(32).toString('hex');
            // 5 number
            const ticketId = Math.floor(10000 + Math.random() * 90000).toString();

            const data = await RegistrationSchema.create({
                id,
                competition: competition.name,
                competitionData: competition,
                schoolLevel: competition.schoolLevel,
                data: {
                    teacher: _data.teacher,
                    participant: _data.participant,
                    files: {
                        passPhotoAndStudentCard: _data.files.passPhotoAndStudentCard ?? undefined,
                        teacherPassPhoto: _data.files.teacherPassPhoto ?? undefined,
                        schoolLetter: _data.files.schoolLetter ?? undefined,
                        paymentProof: _data.files.paymentProof ?? undefined
                    }
                },
                status: 'pending',
                dateRegistered: new Date(),
                dateConfirmed: null,
                confirmedBy: null,
                token,
                ticketId
            });

            const emails = [];
            const tempEmails = [];
            data.data.teacher.filter(d => ["representativeEmail", "email"].includes(d[0])).forEach(d => tempEmails.push(d[1]));
            data.data.participant.filter(d => ["representativeEmail", "email"].includes(d[0])).forEach(d => tempEmails.push(d[1]));
            tempEmails.forEach(e => {
                if (!emails.includes(e)) emails.push(e)
            });

            if (["VmlkZW8gRWRpdGluZ1M"].includes(competition.id) ? (!_data.files.passPhotoAndStudentCard || !_data.files.paymentProof) : (!_data.files.passPhotoAndStudentCard || !_data.files.teacherPassPhoto || !_data.files.schoolLetter || !_data.files.paymentProof)) {
                await UnfinishedDataSchema.create({
                    id,
                    emails,
                    data: {
                        passPhotoAndStudentCard: _data.files.passPhotoAndStudentCard ?? undefined,
                        teacherPassPhoto: _data.files.teacherPassPhoto ?? undefined,
                        schoolLetter: _data.files.schoolLetter ?? undefined,
                        paymentProof: _data.files.paymentProof ?? undefined
                    },
                    lastModified: new Date()
                });
                await Email.sendPendingWithUnfinished(emails, `EXUBERANT 2023 - Registration Confirmation (Unfinished)`, competition.nickname, Object.entries(_data.files).filter(([k, v]) => ["VmlkZW8gRWRpdGluZ1M"].includes(competition.id) ? ["passPhotoAndStudentCard", "paymentProof"].includes(k) && !v : !v).map(([k]) => this.getName(k)), `https://redacted.redacted/register/completion/${data.id}?token=${data.token}`);
            } else await Email.sendPending(emails, `EXUBERANT 2023 - Registration Confirmation`, data.id, `https://redacted.redacted/register/completion/${data.id}?token=${data.token}`, competition.name, competition.nickname);

            await manager.sheetsManager.writeRegistration(data);
            res.json({success: true, id});
        });

        this.router.get('/:id/finish', async (req, res) => {
            const {id} = req.params;
            const {token} = req.query;
            if (!id || !token) return this.badRequest(res, 'Invalid data.');

            const [data, unfinishedData] = await Promise.all([RegistrationSchema.findOne({id: req.params.id}), UnfinishedDataSchema.findOne({id: req.params.id})]);
            if (!data) return this.badRequest(res, 'Registration not found.');
            if (data.token !== token) return this.badRequest(res, 'Invalid token.');

            if (!unfinishedData) return this.badRequest(res, 'Data already finished.');

            res.json({
                success: true,
                registerData: {
                    competition: data.competition,
                    competitionData: data.competitionData,
                    schoolLevel: data.schoolLevel,
                    dateRegistered: data.dateRegistered
                },
                data: unfinishedData.data
            });
        });

        this.router.post('/:id/finish', multer({limits: {fieldSize: 25 * 1024 * 1024}, storage}).fields([
            {name: 'passPhoto', maxCount: 1},
            {name: 'tchrPassPhoto', maxCount: 1},
            {name: 'schoolLetter', maxCount: 1},
            {name: 'paymentProof', maxCount: 1}
        ]), async (req, res) => {
            const {id} = req.params;
            const {token} = req.query;
            if (!id || !token) return this.badRequest(res, 'Invalid data.');
            const [passPhoto, tchrPassPhoto, schoolLetter, paymentProof] = [req.files['passPhoto'] ?? [], req.files['tchrPassPhoto'] ?? [], req.files['schoolLetter'] ?? [], req.files['paymentProof'] ?? []];
            if (!passPhoto.length && !tchrPassPhoto.length && !schoolLetter.length && !paymentProof.length) return this.badRequest(res, 'No file uploaded.');

            const [data, unfinishedData] = await Promise.all([RegistrationSchema.findOne({id: req.params.id}), UnfinishedDataSchema.findOne({id: req.params.id})]);
            if (!data) return this.badRequest(res, 'Registration not found.');
            if (data.token !== token) return this.badRequest(res, 'Invalid token.');

            if (!unfinishedData) return this.badRequest(res, 'Data already finished.');

            if (passPhoto.length && !unfinishedData.data.passPhotoAndStudentCard) unfinishedData.data.passPhotoAndStudentCard = await this.uploadFile(passPhoto[0], 'passPhoto');
            if (tchrPassPhoto.length && !unfinishedData.data.teacherPassPhoto) unfinishedData.data.teacherPassPhoto = await this.uploadFile(tchrPassPhoto[0], 'tchrPassPhoto');
            if (schoolLetter.length && !unfinishedData.data.schoolLetter) unfinishedData.data.schoolLetter = await this.uploadFile(schoolLetter[0], 'schoolLetter');
            if (paymentProof.length && !unfinishedData.data.paymentProof) unfinishedData.data.paymentProof = await this.uploadFile(paymentProof[0], 'paymentProof');

            unfinishedData.lastModified = new Date();
            await unfinishedData.save();

            // set the files variable
            await RegistrationSchema.updateOne({id: req.params.id}, {$set: {"data.files": unfinishedData.data}}, {new: true});
            const d = await RegistrationSchema.findOne({id: req.params.id});
            if (["VmlkZW8gRWRpdGluZ1M"].includes(data.competitionData.id ?? "") ? (d.data.files.passPhotoAndStudentCard !== "" && d.data.files.paymentProof !== "") : (d.data.files.passPhotoAndStudentCard !== "" && d.data.files.teacherPassPhoto !== "" && d.data.files.schoolLetter !== "" && d.data.files.paymentProof !== "")) {
                const emails = [];
                const tempEmails = [];
                data.data.teacher.filter(d => ["representativeEmail", "email"].includes(d[0])).forEach(d => tempEmails.push(d[1]));
                data.data.participant.filter(d => ["representativeEmail", "email"].includes(d[0])).forEach(d => tempEmails.push(d[1]));
                tempEmails.forEach(e => {
                    if (!emails.includes(e)) emails.push(e)
                });
                await Email.sendPending(emails, `EXUBERANT 2023 - Registration Confirmation`, data.id, `https://redacted.redacted/registration/${data.id}?token=${data.token}`, data.competitionData.name, data.competitionData.nickname);
                await UnfinishedDataSchema.deleteOne({id: req.params.id});
            }

            await manager.sheetsManager.updateRegistration(d);

            const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const device = req.headers['user-agent'];
            const date = new Date();
            AnalyticsSchema.create({
                ip,
                device,
                date,
                type: 3,
                data: {id, files: unfinishedData.data}
            }).then(() => void 0).catch(() => void 0);

            res.json({
                success: true
            });
        });

        this.router.get('/get/:id/ticket', async (req, res) => {
            const {token} = req.query;
            const {id} = req.params;
            if (!id || !token) return this.badRequest(res, 'Invalid data.');
            const data = await RegistrationSchema.findOne({id: req.params.id});
            if (!data) return this.badRequest(res, 'Registration not found.');
            if (data.token !== token) return this.badRequest(res, 'Invalid token.');
            if (data.status !== "Confirmed") return this.badRequest(res, 'Registration not confirmed.');

            let buffer = this.cachedQrBuffer.get(data.id);
            if (!buffer) {
                buffer = await createTicket(data.ticketId);
                this.cachedQrBuffer.set(data.id, buffer);
            }

            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': buffer.length
            });
            res.end(buffer);
        });

        this.router.get('/open', async (req, res) => {
            res.json({open: manager.registrationOpen});
        });

        this.router.get('/open/competition', async (req, res) => {
            res.json({open: manager.openRegistrations.length === 0 ? [...manager.sheetsManager.competitions.values()].map(x => x.id) : manager.openRegistrations});
        });

        this.router.post('/open/:id', this.isAuthenticated, async (req, res) => {
            if (!this.isAdmin(req, res, manager)) return;
            const {id} = req.params;
            const {open} = req.body;
            if (!id) return this.badRequest(res, 'Invalid data.');
            if (typeof open !== "boolean") return this.badRequest(res, 'Invalid data.');
            const competition = manager.sheetsManager.competitions.get(id);
            if (!competition) return this.badRequest(res, 'Competition not found.');
            if (open) {
                if (manager.openRegistrations.includes(id)) return this.badRequest(res, 'Competition already open.');
                await SystemSchema.findOneAndUpdate({id: "system"}, {$pull: {closedRegistrations: id}}, {upsert: true}).then(() => void 0).catch(() => void 0);
            } else {
                if (!manager.openRegistrations.includes(id)) return this.badRequest(res, 'Competition already closed.');
                await SystemSchema.findOneAndUpdate({id: "system"}, {$push: {closedRegistrations: id}}, {upsert: true}).then(() => void 0).catch(() => void 0);
            }

            await manager.syncOpenRegistrations();
            res.json({success: true, data: manager.openRegistrations});
        });

        this.router.post('/open', this.isAuthenticated, async (req, res) => {
            if (!this.isAdmin(req, res, manager)) return;
            await manager.syncRegistOpen("open");
            res.json({success: true});
        });

        this.router.post('/close', this.isAuthenticated, async (req, res) => {
            if (!this.isAdmin(req, res, manager)) return;
            await manager.syncRegistOpen("close");
            res.json({success: true});
        });

        // TODO: confirm registration by admin
        // TODO: create qr id system

    }

    private async uploadFile(file: any, key: string) {
        const form = new FormData();
        form.append(key, file.buffer, file.originalname);
        let response, triesLeft = 3;
        while (triesLeft > 0) {
            response = await axios.post('https://cdn.redacted.redacted/api/upload', form, {
                headers: {
                    ...form.getHeaders(),
                    Authorization: `redacted`,
                }
            }).catch(() => null);
            if (response) break;
            triesLeft--;
        }
        if (!response) return null;
        return response.data.url;
    }

    getName(n: string): string {
        switch (n) {
            case "passPhotoAndStudentCard":
                return "Pas Foto dan Kartu Pelajar";
            case "teacherPassPhoto":
                return "Pas Foto Guru Pendamping";
            case "schoolLetter":
                return "Surat Keterangan Sekolah";
            case "paymentProof":
                return "Bukti Pembayaran";
            default:
                return "Tidak Diketahui";
        }
    }
}