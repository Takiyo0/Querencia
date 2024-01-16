import canvas, {createCanvas, loadImage} from "canvas";
import { qrcanvas, setCanvasModule } from "qrcanvas";
import {join} from "path";

setCanvasModule(canvas);

const colorFore = '#55a';
const colorOut = '#c33';
const colorIn = '#621';


export const createTicket = async (id: string) => {
    const canvas = createCanvas(873, 1552);
    const ctx = canvas.getContext("2d");

    const bg = await loadImage(join(__dirname, 'ticket.png'));
    ctx.drawImage(bg, 0, 0, 873, 1552);

    const qr = await qrcanvas({
        cellSize: 10,
        correctLevel: 'H',
        data: id,
        padding: 4
    });
    ctx.drawImage(qr, 162, 456, 554, 554);

    ctx.font = 'bold 60px sans-serif';
    ctx.fillStyle = '#2B3F17';
    ctx.textAlign = 'center';
    ctx.fillText(id, 436, 1115);

    return canvas.toBuffer();
}