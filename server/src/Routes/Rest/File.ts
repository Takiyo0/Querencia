import BaseRoute from "../../Base/Route";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import {CustomMap} from "../../Base/CustomMap";
import jimp from "jimp";

const storage = multer.memoryStorage();

export default class File extends BaseRoute {
    private cachedCompress: CustomMap<string, { filename: string, buffer: Buffer }> = new CustomMap<string,  { filename: string, buffer: Buffer }>(1000 * 60 * 60 * 12);
    constructor() {
        super();


        this.router.post('/upload', multer({limits: { fieldSize: 25 * 1024 * 1024 }, storage}).single('file'), async (req, res) => {
            if (!req.file) return this.badRequest(res, 'No file uploaded.');
            const file = req.file;
            const form = new FormData();

            form.append('data-raw', file.buffer, file.originalname);
            const response = await axios.post('https://cdn.redacted.redacted/api/upload', form, {
                headers: {
                    ...form.getHeaders(),
                    Authorization: `redacted`,
                }
            });
            res.json({success: true, response: response.data});
        });

        this.router.get('/download', async (req, res) => {
            const {url} = req.query;
            if (!url) return this.badRequest(res, 'No url specified.');
            if (new URL(url as string).hostname !== 'cdn.redacted.redacted') return this.badRequest(res, 'Invalid url specified.');
            const filename = url.toString().split('/').pop();
            const response = await axios.get(url as string, {responseType: 'arraybuffer'});
            // automatically downloads file
            res.attachment(filename);
            res.send(response.data);
        });

        this.router.get('/compress', async (req, res) => {
            const {url} = req.query;
            if (!url) return this.badRequest(res, 'No url specified.');
            if (new URL(url as string).hostname !== 'cdn.redacted.redacted') return this.badRequest(res, 'Invalid url specified.');
            const filename = url.toString().split('/').pop();
            const cached = this.cachedCompress.get(url as string);
            if (cached) {
                res.setHeader('Content-Type', 'image/jpeg');
                res.setHeader('Content-Length', cached.buffer.length);
                res.write(cached.buffer);
                res.end();
                return;
            }
            const response = await axios.get(url as string, {responseType: 'arraybuffer'});
            const buffer = await jimp.read(response.data).then(i => i.resize(250, jimp.AUTO, jimp.RESIZE_BEZIER).quality(50).getBufferAsync(jimp.MIME_JPEG)).catch(() => null);
            if (!buffer) return this.badRequest(res, 'Failed to compress image.');
            this.cachedCompress.set(url as string, {filename, buffer});
            // stream this
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Content-Length', buffer.length);
            res.write(buffer);
            res.end();
        });
    }
}