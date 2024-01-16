import {Schema, model} from "mongoose";
import {AnalyticsType} from "../Routes/Rest/Analytics";

const AnalyticsSchema = new Schema<AnalyticsData>({
    ip: {type: String, required: true},
    device: {type: String, required: true},
    date: {type: Date, required: true},
    type: {type: Number, required: true},
    data: {type: Schema.Types.Mixed}
});

export default model<AnalyticsData>('analytics', AnalyticsSchema);

export interface AnalyticsData {
    ip: string;
    device: string;
    date: Date;
    type: AnalyticsType;
    data: any;
}