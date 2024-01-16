import {NextFunction, Request, Response, Router} from "express";
import {RestRouteManager} from "../Routes/RestRouteManager";
import {CONFIG} from "../Config";

export default class BaseRoute {
    public router: Router = Router();
    get path(): string {
        return '/' + this.constructor.name.toLowerCase();
    }

    isAuthenticated(req: Request, res: Response, next: NextFunction) {
        if (req.user) return next();
        res.status(401).json({error: 'Not authenticated.'});
    }

    isAdmin(req: Request, res: Response, routeManager: RestRouteManager) {
        if (req.user && routeManager.cachedAdmins.has((req.user as any).email)) return true;
        else {
            res.status(401).json({error: 'Not an admin.'});
            return false;
        }
    }

    isOwner(req: Request, res: Response, next: NextFunction) {
        if (req.headers['x-owner-password'] === CONFIG.OWNER_PASSWORD) return next();
        res.status(401).json({error: 'Not an owner.'});
    }

    badRequest(res: Response, message: string) {
        res.status(400).json({error: message});
    }
}