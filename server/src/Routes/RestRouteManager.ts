import {Router} from "express";
import fs from "fs";
import path from "path";
import {Index} from "../Index";
import AdminSchema from "../Schema/Admin";
import {SheetsManager} from "../Rest/Sheets";
import SystemSchema from "../Schema/System";
import SponsorSchema, {SponsorData} from "../Schema/Sponsor";

export class RestRouteManager {
    public router: Router = Router();
    public path: string = '/rest';
    public cachedAdmins = new Map<string, boolean>();
    public cachedSponsor = new Map<string, SponsorData>();
    public openRegistrations: string[] = [];
    public sheetsManager = new SheetsManager();
    public registrationOpen = false;

    constructor(public index: Index) {
        setTimeout(() => (Promise.all([this.syncAdmins(), this.syncRegistOpen("sync"), this.syncSponsor()]).then(() => this.loadRoutes())), 1000);
        setTimeout(() => this.syncOpenRegistrations(), 10 * 1000);
        this.loadProcessEvents();
    }

    public async syncAdmins() {
        const admins = await AdminSchema.find();
        this.cachedAdmins.clear();
        for (const admin of admins) {
            this.cachedAdmins.set(admin.email, true);
        }
        console.log('[DATABASE] -> [Routes]; Admins synced!');
    }

    public async syncOpenRegistrations() {
        const data = await SystemSchema.findOne({id: "system"});
        if (!data) return;
        console.log([data.closedRegistrations, [...this.sheetsManager.competitions.values()].map(x => x.id), [...this.sheetsManager.competitions.values()].filter(x => !data.closedRegistrations.includes(x.id)).map(x => x.id)]);
        this.openRegistrations = [...this.sheetsManager.competitions.values()].filter(x => !data.closedRegistrations.includes(x.id)).map(x => x.id);
        console.log('[DATABASE] -> [Routes]; Open registrations synced!');
    }

    public async syncRegistOpen(type: "sync" | "open" | "close") {
        if (type === "sync") {
            let data = await SystemSchema.findOne({id: "system"});
            if (!data) data = await SystemSchema.create({id: "system", registrationOpen: false});
            this.registrationOpen = data.registrationOpen;
        } else {
            await SystemSchema.findOneAndUpdate({id: "system"}, {registrationOpen: type === "open"}, {upsert: true});
            this.registrationOpen = type === "open";
        }
        console.log('[DATABASE] -> [Routes]; Registration open synced!');
    }

    public async syncSponsor() {
        const data = await SponsorSchema.find();
        this.cachedSponsor.clear();
        for (const sponsor of data)
            this.cachedSponsor.set(sponsor.id, sponsor);
    }

    async loadRoutes() {
        const routesPath = path.join(__dirname, 'Rest');
        for (const file of fs.readdirSync(routesPath)) {
            const route = await (import(path.join(routesPath, file)));
            const init = new route.default(this);
            this.router.use(init.path, init.router);
            const routes = init.router.stack.map((r: any) => ({path: r.route.path, method: r.route.stack[0].method}));
            for (const route of routes) {
                console.log(`[ROUTES] -> [Loader]; Loaded [${route.method.toUpperCase()}] ${init.path}${route.path}`);
            }
        }

        console.log('[ROUTES] -> [Loader]; Routes Routes loaded!');
    }

    loadProcessEvents() {
        // do not crash on any error. catch warnings and errors
        process.on('warning', (e) => {
            this.sheetsManager.systemLog("warn", e.message, e.stack);
        });
        process.on('uncaughtException', (e) => {
            this.sheetsManager.systemLog("error", e.message, e.stack);
            console.error(e.stack);
        });
        process.on('unhandledRejection', (e) => {
            this.sheetsManager.systemLog("error", 'Unhandled Rejection at Promise', e as string);
            console.error('Unhandled Rejection at Promise', e);
        });
    }
}