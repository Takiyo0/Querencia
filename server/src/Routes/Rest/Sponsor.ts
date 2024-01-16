import BaseRoute from "../../Base/Route";
import {RestRouteManager} from "../RestRouteManager";

export default class Sponsor extends BaseRoute {

    constructor(manager: RestRouteManager) {
        super();

        this.router.get('/get-all-data', async (req, res) => {
            const data = [...manager.cachedSponsor.values()];
            const videos = data.filter(({video}) => video !== null).map(({video}) => video as string);
            const randomVideo = videos[Math.floor(Math.random() * videos.length)];
            res.json({
                sponsors: data.map(({icon}) => icon),
                promotionVideo: randomVideo
            })
        });
    }
}