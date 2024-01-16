import { Schema, model } from "mongoose";

const SystemSchema = new Schema<SystemData>({
    id: {type: String, required: true, unique: true},
    registrationOpen: {type: Boolean, required: true},
    closedRegistrations: {type: [String], required: true}
});

export default model<SystemData>('system', SystemSchema);

export interface SystemData {
    id: string;
    registrationOpen: boolean;
    closedRegistrations: string[];
}