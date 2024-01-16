import BaseRoute from "../../Base/Route";
import {RestRouteManager} from "../RestRouteManager";
import RegistrationSchema from "../../Schema/Registration";
import {Email} from "../../Rest/Email";
import AdminSchema from "../../Schema/Admin";
import SponsorSchema from "../../Schema/Sponsor";
import crypto from "crypto";
import multer from "multer";
import FormData from "form-data";
import axios from "axios";

const storage = multer.memoryStorage();
export default class Admin extends BaseRoute {
    constructor(manager: RestRouteManager) {
        super();

        this.router.get('/registration/list', this.isAuthenticated, async (req, res) => {
            if (!this.isAdmin(req, res, manager)) return;
            const {competitionId} = req.query;
            const opt = {};
            if (competitionId) opt['competition'] = competitionId;

            // sort by dateRegistered
            const data = await RegistrationSchema.find(opt).sort({dateRegistered: -1});
            res.json({data});
        });

        this.router.get('/registration/:id', this.isAuthenticated, async (req, res) => {
            if (!this.isAdmin(req, res, manager)) return;
            const {id} = req.params;
            const data = await RegistrationSchema.findOne({id});
            res.json({data});
        });

        this.router.post('/registration/:id/approve', this.isAuthenticated, async (req, res) => {
            if (!this.isAdmin(req, res, manager)) return;
            const {id} = req.params;

            const data = await RegistrationSchema.findOne({id});
            if (!data) return this.badRequest(res, 'Registration not found.');
            if (data.status === "Rejected") return this.badRequest(res, 'Rejected registration cannot be confirmed.');
            if (data.status === "Confirmed") return this.badRequest(res, 'Registration already confirmed.');

            data.status = "Confirmed";
            data.dateConfirmed = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Jakarta"}));
            data.confirmedBy = (req.user as any).email;


            const emails = [];
            const tempEmails = [];
            data.data.teacher.filter(d => ["representativeEmail", "email"].includes(d[0])).forEach(d => tempEmails.push(d[1]));
            data.data.participant.filter(d => ["representativeEmail", "email"].includes(d[0])).forEach(d => tempEmails.push(d[1]));
            tempEmails.forEach(e => { if (!emails.includes(e)) emails.push(e) });

            await Email.sendConfirmed(emails, `EXUBERANT 2023 - Registration Confirmed`, data);
            await data.save();

            await manager.sheetsManager.updateRegistration(data);

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            res.json({success: true, data: Object.fromEntries(Object.entries(data._doc).filter(([k]) => !(data.status !== "Confirmed" ? ["token", "ticketId"] : ["token"]).includes(k)))});
        });

        this.router.post('/registration/:id/reject', this.isAuthenticated, async (req, res) => {
            if (!this.isAdmin(req, res, manager)) return;
            const {id} = req.params;
            const {reason} = req.body;

            const data = await RegistrationSchema.findOne({id});
            if (!data) return this.badRequest(res, 'Registration not found.');
            if (data.status === "Rejected") return this.badRequest(res, 'Registration already rejected.');

            data.status = "Rejected";

            const emails = [];
            const tempEmails = [];
            data.data.teacher.filter(d => ["representativeEmail", "email"].includes(d[0])).forEach(d => tempEmails.push(d[1]));
            data.data.participant.filter(d => ["representativeEmail", "email"].includes(d[0])).forEach(d => tempEmails.push(d[1]));
            tempEmails.forEach(e => { if (!emails.includes(e)) emails.push(e) });

            await Email.sendRejected(emails, `EXUBERANT 2023 - Registration Rejected`, data, reason);
            await data.save();

            await manager.sheetsManager.updateRegistration(data);

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            res.json({success: true, data: Object.fromEntries(Object.entries(data._doc).filter(([k]) => !(data.status !== "Confirmed" ? ["token", "ticketId"] : ["token"]).includes(k)))});
        });

        this.router.post('/sponsor/:name', this.isAuthenticated, multer({limits: { fieldSize: 25 * 1024 * 1024 }, storage}).fields([
            {name: 'icon', maxCount: 1},
            {name: 'video', maxCount: 1}
        ]), async (req, res) => {
            if (!this.isAdmin(req, res, manager)) return;
            const {name} = req.params;
            const [icon, video] = [req.files['icon'], req.files['video'] ?? []];
            if (!name || !icon.length) return this.badRequest(res, 'Missing parameters.');
            const data = await SponsorSchema.findOne({name});
            if (data) return this.badRequest(res, 'Sponsor already exists.');

            const d = {icon: "", video: null};

            for (let i = 0; i < 2; i++) {
                const file = i === 0 ? icon[0] : video[0];
                if (!file) break;
                const key = i === 0 ? 'icon' : 'video';
                const form = new FormData();
                form.append(key, file.buffer, file.originalname);
                const response = await axios.post('https://cdn.redacted.redacted/api/upload', form, {
                    headers: {
                        ...form.getHeaders(),
                        Authorization: `redacted`,
                    }
                }).catch(() => null);
                if (!response) return this.badRequest(res, `Failed to upload ${key}.`);
                d[key] = response.data.url;
            }

            await SponsorSchema.create({id: this.generateId(name), name, icon: d.icon, video: d.video, views: 0});
            await manager.syncSponsor();
            res.json({success: true});
        });

        this.router.patch('/sponsor/:id', this.isAuthenticated, multer({limits: { fieldSize: 25 * 1024 * 1024 }, storage}).fields([
            {name: 'icon', maxCount: 1},
            {name: 'video', maxCount: 1}
        ]), async (req, res) => {
            if (!this.isAdmin(req, res, manager)) return;
            const {id} = req.params;
            const [icon, video] = [req.files['icon'] ?? [], req.files['video'] ?? []];

            const data = await SponsorSchema.findOne({id});
            if (!data) return this.badRequest(res, 'Sponsor not found.');

            const d = {icon: null, video: null};

            for (let i = 0; i < 2; i++) {
                const file = i === 0 ? icon[0] : video[0];
                if (!file) continue;
                const key = i === 0 ? 'icon' : 'video';
                const form = new FormData();
                form.append(key, file.buffer, file.originalname);
                const response = await axios.post('https://cdn.redacted.redacted/api/upload', form, {
                    headers: {
                        ...form.getHeaders(),
                        Authorization: `redacted`,
                    }
                }).catch(() => null);
                if (!response) return this.badRequest(res, `Failed to upload ${key}.`);
                d[key] = response.data.url;
            }

            if (d["icon"]) data.icon = d["icon"];
            if (d["video"]) data.video = d["video"];
            await data.save();
            await manager.syncSponsor();
            res.json({success: true});
        });

        this.router.delete('/sponsor/:id', this.isAuthenticated, async (req, res) => {
            if (!this.isAdmin(req, res, manager)) return;
            const {id} = req.params;
            const data = await SponsorSchema.findOne({id});
            if (!data) return this.badRequest(res, 'Sponsor not found.');
            await data.delete();
            await manager.syncSponsor();
            res.json({success: true});
        });

        this.router.get('/sponsor/list', this.isAuthenticated, async (req, res) => {
            if (!this.isAdmin(req, res, manager)) return;
            const data = [...manager.cachedSponsor.values()];
            const comparisonData = await SponsorSchema.find();
            for (let i = 0; i < data.length; i++)
                (data[i] as any).onDb = comparisonData.find(d => d.id === data[i].id) !== undefined;
            res.json({data});
        });

        this.router.get('/stats', async (req, res) => {
            if (!this.isAdmin(req, res, manager)) return;
            const data = await RegistrationSchema.find({});
            const admins: {email: string, data: {confirmed: number, pending: number, rejected: number}}[] = [];
            data.forEach(d => {
                const email = d.confirmedBy;
                if (!email) return;
                const admin = admins.find(a => a.email === email);
                if (!admin) admins.push({email, data: {confirmed: 0, pending: 0, rejected: 0}});
                const a = admins.find(a => a.email === email);
                if (!a) return;
                if (d.status === "Confirmed") a.data.confirmed++;
                else if (["pending", "Pending"].includes(d.status)) a.data.pending++;
                else if (d.status === "Rejected") a.data.rejected++;
            });

            return res.json({
                ram: {
                    total: process.memoryUsage().heapTotal / 1024 / 1024,
                    used: process.memoryUsage().heapUsed / 1024 / 1024
                },
                uptime: process.uptime(),
                cpu: process.cpuUsage(),
                registrations: {
                    total: data.length,
                    confirmed: data.filter(d => d.status === "Confirmed").length,
                    pending: data.filter(d => ["pending", "Pending"].includes(d.status)).length,
                    rejected: data.filter(d => d.status === "Rejected").length
                },
                admins
            })
        });

        this.router.get('/list-admins', this.isAuthenticated, async (req, res) => {
            if (!this.isAdmin(req, res, manager)) return;
            const admins = await AdminSchema.find();
            const d = [];
            // check if cached
            for (const admin of admins) {
                d.push({...(admin as any)._doc, cached: manager.cachedAdmins.has(admin.email)});
            }
            await manager.syncAdmins();
            res.json({admins: d});
        });
    }

    private generateId(name: string) {
        // use crypto hash
        return crypto.createHash('sha256').update(`${name}-${Date.now()}`).digest('hex');
    }
}