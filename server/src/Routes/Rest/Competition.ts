import BaseRoute from "../../Base/Route";
import CompetitionSchema from "../../Schema/Competition";
import {RestRouteManager} from "../RestRouteManager";

const oldPrice = [
    ['QmFza2V0IFB1dHJhUw', '250000'],
    ['RnV0c2FsIFB1dHJhUw', '250000'],
    ['TW9kZXJuIERhbmNlUw', '200000'],
    ['U29sbyBWb2NhbFM', '150000'],
    ['VmlkZW8gRWRpdGluZ1M', '150000'],
    ['U3BlZWNoUw', '150000'],
    ['TWVsdWtpc1M', '150000'],
    ['RnV0c2FsIFB1dHJhSg', '250000'],
    ['TW9kZXJuIERhbmNlSg', '200000'],
    ['RS1TcG9ydCBNb2JpbGUgTGVnZW5kQQ',' 200000']
];

export default class Competition extends BaseRoute {
    private flushCooldown: null | NodeJS.Timeout = null;

    constructor(public manager: RestRouteManager) {
        super();

        this.router.get('/list', async (req, res) => {
            const comps = manager.sheetsManager.competitions;
            if (!comps.size) return this.badRequest(res, 'Server error. Please contact administrator as soon as possible.');
            // only show id, name, price, schoolLevel, participants, and requiredData
            res.json({
                competitions: [...comps.values()].map(x => ({...x, oldPrice: oldPrice.find(([id]) => id === x.id)?.[1]}))
                    // .filter(x => x.id !== "VmlkZW8gRWRpdGluZ1M")
                ,
                lastUpdated: (manager.sheetsManager?.lastUpdated as Date)?.toUTCString()
            });
        });

        this.router.get('/get/:id', this.isAuthenticated, async (req, res) => {
            const comps = manager.sheetsManager.competitions;
            if (!comps.size) return this.badRequest(res, 'Server error. Please contact administrator as soon as possible.');
            const comp = [...comps.values()].find(c => c.id === req.params.id);
            if (!comp) return this.badRequest(res, 'Competition not found! Make sure you typed the correct competition ID.');
            // if (comp.id === "VmlkZW8gRWRpdGluZ1M") return this.badRequest(res, 'Competition not found! Make sure you typed the correct competition ID.');
            res.json(comp);
        });

        // Add new competition
        this.router.post('/flush', this.isAuthenticated, async (req, res) => {
            if (!this.isAdmin(req, res, manager)) return;

            if (this.flushCooldown) return this.badRequest(res, 'Please wait for the previous flush to finish.');
            this.flushCooldown = setTimeout(() => this.flushCooldown = null, 30 * 1000);

            const competitions = await manager.sheetsManager.fetchData(true);
            await CompetitionSchema.deleteMany({});
            await CompetitionSchema.insertMany(competitions);

            res.json({success: true, competitions});
        });
    }
}