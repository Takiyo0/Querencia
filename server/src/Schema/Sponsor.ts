import {Schema, model} from "mongoose";

const SponsorSchema = new Schema<SponsorData>({
    id: {type: String, required: true},
    name: {type: String, required: true},
    icon: {type: String, required: true},
    video: {type: String, required: false},
    views: {type: Number, required: true}
});

export default model<SponsorData>('sponsor', SponsorSchema);

export interface SponsorData {
    id: string;
    name: string;
    icon: string;
    video: string | null;
    views: number;
}