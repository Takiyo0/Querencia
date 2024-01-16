import {Schema, model} from "mongoose";

const AdminSchema = new Schema<AdminData>({
    email: {type: String, required: true}
});

export default model<AdminData>('admin', AdminSchema);

export interface AdminData {
    email: string;
}