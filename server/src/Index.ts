import express, {Express} from 'express';
import path from 'path';
import {RestRouteManager} from "./Routes/RestRouteManager";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import session from "express-session";
import passport from "passport";
import bodyParser from "body-parser";
import cors from "cors";
import {CONFIG} from "./Config";
// import {SitemapStream, streamToPromise} from "sitemap";
// import {createGzip} from "zlib";
// import {Readable} from "stream";

const mongoStore = MongoStore(session);

export class Index {
    public express: Express = express();
    public rest: RestRouteManager | null = null;

    constructor() {
        // let sitemap = null;
        mongoose.connect(CONFIG.MONGODB_URI).then(async () => {
            console.log('[DATABASE] -> [MONGOOSE]; Connected to MongoDB!');
        });
        mongoose.set('strictQuery', true);
        require('./Strategies/Google');
        this.express.use(cors({
            origin: !CONFIG.DEV ? 'https://redacted.redacted' : ['http://192.168.1.3:3000', 'http://localhost:3000'],
            credentials: true
        }));
        this.express.use(session({
            secret: CONFIG.SESSION_SECRET!,
            cookie: {
                maxAge: 60000 * 60 * 24 * 30
            },
            proxy: true,
            saveUninitialized: true,
            name: 'kirara',
            resave: true,
            store: new mongoStore({
                mongooseConnection: mongoose.connection,
                collection: 'sessions'
            })
        }));
        this.express.use(passport.initialize());
        this.express.use(passport.session());
        this.express.use(bodyParser.json());

        this.rest = new RestRouteManager(this);
        this.express.use(this.rest!.path, this.rest!.router);

        this.express.use(express.static(path.join(__dirname, '..', '..', 'webpage', 'build')));
        this.express.get('/sitemap.xml', function (req, res) {
            res.sendFile(path.join(__dirname, 'sitemap.xml'));
        })
        this.express.get('*', (req, res) => {
            // const route = req.path.split('/')[1];
            // if (!req.user && route !== 'login' && route !== 'register' && route !== 'api' && route !== 'favicon.ico') return res.redirect('/login');
            res.sendFile(path.join(__dirname, '..', '..', 'webpage', 'build', 'index.html'));
        });
        this.start();
    }


    async start() {
        this.express.listen(CONFIG.PORT, () => console.log(`[SYSTEM] -> [BACKEND]; Listening on port ${CONFIG.PORT}!`));
    }
}

new Index();