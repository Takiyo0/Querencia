import BaseRoute from "../../Base/Route";
import passport from "passport";
import {RestRouteManager} from "../RestRouteManager";

export default class Auth extends BaseRoute {
    constructor(manager: RestRouteManager) {
        super();
        this.router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));

        this.router.get('/google/callback', (req, res, next) => {
            passport.authenticate('google', {
                failureRedirect: '/rest/auth/google/auth',
                successRedirect: '/',
                session: true
            }, (err, user, info) => {
                if (err) return next(err);
                if (user === false) {
                    // res.status(401).json({success: false, message: info.message ?? 'Unknown error'});
                    res.redirect(`/login?error=${info.message ?? 'Unknown error'}`);
                } else {
                    req.logIn(user, (err) => {
                        if (err) return next(err);
                        return res.redirect('/admin');
                    });
                }
            })(req, res, next);
        });

        this.router.get('/user', this.isAuthenticated, (req, res) => {
            res.json({user: req.user, admin: !!manager.cachedAdmins.has((req.user as any).email)});
        });

        this.router.get('/logout', (req, res) => {
            if (req.user) req.logout({keepSessionInfo: false}, (err) => console.error(err));
            res.redirect('/admin');
        });
    }
}