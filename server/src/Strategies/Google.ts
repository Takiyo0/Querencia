import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import UserSchema, {defaultGoogleUser} from "../Schema/User";
import {CONFIG} from "../Config";

passport.serializeUser((user, done) => {
    done(null, (user as any).id);
});

passport.deserializeUser(async (id, done) => {
    const _user = await UserSchema.findOne({id: id});
    if (_user) done(null, _user);
});

passport.use(new Strategy({
    clientID: CONFIG.GOOGLE_CLIENT_ID!,
    clientSecret: CONFIG.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${CONFIG.SERVER_URL}/rest/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
    const _user = await UserSchema.findOne({id: profile.id});
    if (_user) {
        done(null, _user);
    } else {
        const newUser = await UserSchema.create(defaultGoogleUser({ surname: profile.name.familyName ?? "", givenName: profile.name.givenName ?? "" }, profile.id, profile.emails![0].value, profile.id, profile.profileUrl ?? null));
        done(null, newUser);
    }
}));