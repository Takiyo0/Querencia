import BaseRoute from "../../Base/Route";
import {RestRouteManager} from "../RestRouteManager";
import AdminSchema from "../../Schema/Admin";
import {CONFIG} from "../../Config";

export default class User extends BaseRoute {
    constructor(manager: RestRouteManager) {
        super();

        this.router.post('/set-admin', this.isOwner, async (req, res) => {
            const {email, admin} = req.query;
            if (!email || !admin || !['0', '1'].includes(admin.toString())) return this.badRequest(res, 'Invalid parameters.');

            if (admin === '0') await AdminSchema.findOneAndDelete({email});
            else {
                const admins = await AdminSchema.find();
                await manager.syncAdmins();
                if (admins.find(a => a.email === email)) return this.badRequest(res, 'Admin already exists.');
                await new AdminSchema({email}).save();
            }

            await manager.syncAdmins();
            res.json({success: true, admin: admin === '1', email});
        });

        this.router.post('/bulk-set-admin', this.isOwner, async (req, res) => {
            const {emails, admin} = req.body;
            if (!emails || typeof admin !== "boolean") return this.badRequest(res, 'Invalid body.');

            if (admin) {
                const admins = await AdminSchema.find();
                await manager.syncAdmins();
                const notYetAdmins = emails.filter(e => !admins.find(a => a.email === e));
                await AdminSchema.insertMany(notYetAdmins.map(e => ({email: e})));
            } else {
                await AdminSchema.deleteMany({email: {$in: emails}});
            }

            await manager.syncAdmins();
            res.json({success: true, emails, admin});
        });

        this.router.get('/version', (req, res) => {
            res.json({version: CONFIG.VERSION});
        });
    }
}