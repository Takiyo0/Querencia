import { Schema, model } from "mongoose";
import {CompetitionData} from "./Competition";

const RegistrationSchema = new Schema<RegistrationData>({
    id: {type: String, required: true, unique: true},
    competition: {type: String, required: true},
    competitionData: {type: Object, required: true},
    schoolLevel: {type: String, required: true},
    data: {
        teacher: [{type: Array, required: true}],
        participant: [{type: Array, required: true}],
        files: {
            passPhotoAndStudentCard: {type: String, required: false},
            teacherPassPhoto: {type: String, required: false},
            schoolLetter: {type: String, required: false},
            paymentProof: {type: String, required: false}
        }
    },
    status: {type: String, required: true},
    dateRegistered: {type: Date, required: true},
    dateConfirmed: {type: Date, required: false},
    confirmedBy: {type: String, required: false},
    token: {type: String, required: true},
    ticketId: {type: String, required: true}
});

export default model<RegistrationData>('registration', RegistrationSchema);

// it's for page 1. filled with teacher's biodata
export interface RegistrationData {
    id: string; // server will create this
    competition: string;
    competitionData: CompetitionData;
    schoolLevel: string;
    data: {
        teacher: [string, any][]; // [key, value]
        participant: [string, any][]; // [key, value]
        files: {
            passPhotoAndStudentCard?: string;
            teacherPassPhoto?: string;
            schoolLetter?: string;
            paymentProof?: string;
        }
    }

    status: RegistrationStatus;
    dateRegistered: Date;
    dateConfirmed: Date;
    confirmedBy: string;
    token: string;
    ticketId: string;
}

export type RegistrationStatus = "Pending" | "Confirmed" | "Rejected";
