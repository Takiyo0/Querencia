import { Schema, model } from "mongoose";

const UnfinishedDataSchema = new Schema<UnfinishedData>({
    id: {type: String, required: true, unique: true},
    emails: [{type: String, required: true}],
    data: {
        passPhotoAndStudentCard: {type: String, required: false},
        teacherPassPhoto: {type: String, required: false},
        schoolLetter: {type: String, required: false},
        paymentProof: {type: String, required: false}
    },
    lastModified: {type: Date, required: true}
});

export default model<UnfinishedData>('unfinishedData', UnfinishedDataSchema);

export interface UnfinishedData {
    id: string;
    emails: string[];
    data: {
        passPhotoAndStudentCard?: string;
        teacherPassPhoto?: string;
        schoolLetter?: string;
        paymentProof?: string;
    };
    lastModified: Date;
}