import { Schema, model } from "mongoose";

const CompetitionSchema = new Schema<CompetitionData>({
    id: {type: String, unique: true},
    name: {type: String, required: true},
    nickname: {type: String, required: true},
    price: {type: String, required: true},
    schoolLevel: {type: String, required: true},
    participants: {
        min: {type: Number, required: true},
        max: {type: Number, required: true}
    },
    contacts: [{ name: {type: String, required: true}, number: {type: String, required: true} }],
    technical: {type: String, required: true},
    prize: [{ level: {type: String, required: true}, price: {type: Number, required: true} }],
    guidebook: {type: String, required: true},
    requiredData: {
        teacher: [{type: String, required: true}],
        participant: [{type: String, required: true}]
    }
});

export default model<CompetitionData>('competition', CompetitionSchema);

export interface CompetitionData {
    id: string;
    name: string;
    nickname: string;
    price: string;
    schoolLevel: CompetitionSchoolLevel;
    participants: {
        min: number;
        max: number;
    };
    contacts: {name: string, number: string}[];
    technical: string;
    prize: {level: string, price: number}[];
    guidebook: string;
    requiredData: {
        teacher: string[];
        participant: string[];
    }
}

export type CompetitionSchoolLevel = "Junior" | "Senior" | "All";
