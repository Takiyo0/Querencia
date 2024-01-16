import { Schema, model } from "mongoose";

const UserSchema = new Schema<UserData>({
    username: {
        surname: {type: String},
        givenName: {type: String},
        nickname: {type: String}
    },
    email: {type: String, required: true},
    id: {type: String, required: true},
    avatar: {type: String}
});

export default model<UserData>('user', UserSchema);

export const defaultGoogleUser: (username: UserUsername, email: string, id: string, userId: string, avatar: string | null) => UserData = (username, id, email, userId, avatar) => ({
    username,
    id: userId,
    email,
    avatar
});

export interface UserData {
    username: UserUsername;
    email: string;
    id: string;
    avatar?: string;
}

export interface UserUsername {
    surname: string;
    givenName: string;
    nickname?: string;
}