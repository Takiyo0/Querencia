import BaseRoute from "../../Base/Route";
import AnalyticsSchema from "../../Schema/Analytics";
import {RestRouteManager} from "../RestRouteManager";
import SponsorSchema from "../../Schema/Sponsor";

export default class Analytics extends BaseRoute {
    constructor(manager: RestRouteManager) {
        super();

        this.router.post('/cheer', async (req, res) => {
           const {type, data} = req.body; // type 1 = page_open, type 2 = button_click, type 3 = page_change
           if (type === undefined || !data) return this.badRequest(res, 'Missing parameters.');
           const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
           const device = req.headers['user-agent'];
           const date = new Date();
           AnalyticsSchema.create({ip, device, date, type, data}).then(() => void 0).catch(() => void 0);
           res.json({});
        });

        this.router.post('/sponsor-video', async (req, res) => {
            const {fileUrl} = req.body;
            if (!fileUrl) return this.badRequest(res, 'Missing parameters.');
            SponsorSchema.findOneAndUpdate({video: fileUrl}, {$inc: {views: 1}});
            res.json({});
        });

        this.router.get('/cheer', async (req, res) => {
            if (!this.isAdmin(req, res, manager)) return;

            const { d } = req.query;
            const { type, amount, page } = JSON.parse(d as string ?? '{}');

            const typeFilter = type ? { type: Number(type as string) } : {};

            const pageSize = amount ? parseInt(amount as string) : 10;
            const currentPage = page ? parseInt(page as string) : 0;

            try {
                const data = await AnalyticsSchema.find(typeFilter)
                    .sort({ date: -1 })
                    .limit(pageSize)
                    .skip(currentPage * pageSize);

                res.json({ data, totalData: await AnalyticsSchema.countDocuments(typeFilter).catch(() => -1) });
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
}

export enum AnalyticsType {
    PAGE_OPEN,
    BUTTON_CLICK,
    PAGE_CHANGE,
    PAGE_CLOSE ,
    PAGE_ERROR
}

export const AnalyticsTypeString = {
    [AnalyticsType.PAGE_OPEN]: 'PAGE_OPEN',
    [AnalyticsType.BUTTON_CLICK]: 'BUTTON_CLICK',
    [AnalyticsType.PAGE_CHANGE]: 'PAGE_CHANGE',
    [AnalyticsType.PAGE_CLOSE]: 'PAGE_CLOSE',
    [AnalyticsType.PAGE_ERROR]: 'PAGE_ERROR'
}