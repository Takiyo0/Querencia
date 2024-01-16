import axios, {AxiosProgressEvent} from "axios";

export class RestManager {
    public static baseUri: string = "/rest/";

    public static async get<T>(path: string, abort?: AbortSignal): Promise<T> {
        return (await axios.get(this.baseUri + path, {signal: abort})).data;
    }

    public static async post<T>(path: string, data: any, config: any, abort?: AbortSignal): Promise<T> {
        return (await axios.post(this.baseUri + path, data, {...config, signal: abort})).data;
    }

    public static getCompetitionList(signal: AbortSignal): Promise<CompetitionListResponse> {
        return this.get<CompetitionListResponse>("competition/list", signal);
    }

    public static async getOpenCompetitionList(signal: AbortSignal): Promise<{open: string[]}> {
            return (await axios.get(`${RestManager.baseUri}register/open/competition`, {signal})).data;
    }

    public static async setClosedCompetition(signal: AbortSignal, id: string, open: boolean): Promise<{success: boolean, data: string[]}> {
        return (await axios.post(`${RestManager.baseUri}register/open/${id}`, {open}, { signal })).data;
    }

    public static async getRegisterStatus(signal: AbortSignal): Promise<boolean> {
        const r = await this.get<RegistrationOpenResponse>("register/open", signal);
        return r.open;
    }

    public static async setRegisterStatus(signal: AbortSignal, open: boolean): Promise<{success: boolean}> {
        return (await axios.post(`${RestManager.baseUri}register/${open ? "open" : "close"}` , {}, { signal })).data;
    }

    public static async getVersion(signal: AbortSignal): Promise<string> {
        const r = await this.get<any>("user/version", signal);
        return r.version;
    }

    public static async register(signal: AbortSignal, customId: string, competition: CompetitionData, teacherData: [string, string | string[]][], participantData: [string, string | string[]][], files: {
        passPhotoAndStudentCard: string,
        teacherPassPhoto: string,
        schoolLetter: string,
        paymentProof: string
    }): Promise<any> {
        const r = await axios.post(`${RestManager.baseUri}register`, {
            "competitionId": customId ? customId : competition.id,
            "data": {
                "teacher": teacherData,
                "participant": participantData,
                "files": {
                    "passPhotoAndStudentCard": files.passPhotoAndStudentCard,
                    "teacherPassPhoto": files.teacherPassPhoto,
                    "schoolLetter": files.schoolLetter,
                    "paymentProof": files.paymentProof
                }
            }
        }, {
            headers: {
                "Content-Type": "application/json"
            },
            signal
        });
        return r.data;
    }

    public static async getRegistrationCompletionStatus(signal: AbortSignal, id: string, token: string): Promise<{
        success: boolean,
        registerData: {
            competition: string,
            competitionData: CompetitionData,
            schoolLevel: string,
            dateRegistered: Date
        },
        data: { passPhotoAndStudentCard: string, teacherPassPhoto: string, schoolLetter: string, paymentProof: string }
    }> {
        const r = await this.get<any>(`register/${id}/finish?token=${token}`, signal);
        return r;
    }

    public static async isLoggedIn(signal: AbortSignal): Promise<boolean> {
        const r = await this.get<any>("auth/user", signal);
        return !!r.user;
    }

    public static async getUser(signal: AbortSignal): Promise<UserData> {
        return await this.get<UserData>("auth/user", signal);
    }

    public static async uploadFile(signal: AbortSignal, file: File, uploadCb: (progress: number, uploaded: number, total: number) => void): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);
        const r = await axios({
            method: "POST",
            url: RestManager.baseUri + "file/upload",
            data: formData,
            headers: {"Content-Type": "multipart/form-data"},
            signal,
            onUploadProgress: (progress: AxiosProgressEvent) => {
                const {total, loaded} = progress as any;
                const totalSizeInMB = total / 1000000;
                const loadedSizeInMB = loaded / 1000000;
                const uploadPercentage = (loadedSizeInMB / totalSizeInMB) * 100;
                uploadCb(uploadPercentage, loadedSizeInMB, totalSizeInMB);
            }
        })
        return r.data.response;
    }

    public static async createSponsorship(signal: AbortSignal, name: string, icon: File, video: File | null): Promise<{
        success: boolean
    }> {
        const formData = new FormData();
        formData.append('icon', icon);
        if (video) formData.append('video', video);
        const r = await axios.post(`${RestManager.baseUri}admin/sponsor/${name}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            signal
        });
        return r.data;
    }

    public static async completeRegister(signal: AbortSignal, id: string, token: string, formData: FormData, uploadCb: (progress: number, uploaded: number, total: number) => void): Promise<{
        success: boolean,
        data: any
    }> {
        const r = await axios({
            method: "POST",
            url: `${RestManager.baseUri}register/${id}/finish?token=${token}`,
            data: formData,
            headers: {"Content-Type": "multipart/form-data"},
            signal,
            onUploadProgress: (progress: AxiosProgressEvent) => {
                const {total, loaded} = progress as any;
                const totalSizeInMB = total / 1000000;
                const loadedSizeInMB = loaded / 1000000;
                const uploadPercentage = (loadedSizeInMB / totalSizeInMB) * 100;
                uploadCb(uploadPercentage, loadedSizeInMB, totalSizeInMB);
            }
        })
        return r.data;
    }

    public static async updateSponsorship(signal: AbortSignal, id: string, changes: {
        icon: File | null,
        video: File | null
    }): Promise<{ success: boolean }> {
        const formData = new FormData();
        if (changes.icon) formData.append('icon', changes.icon);
        if (changes.video) formData.append('video', changes.video);
        const r = await axios.patch(`${RestManager.baseUri}admin/sponsor/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            signal
        });
        return r.data;
    }

    public static async deleteSponsorship(signal: AbortSignal, id: string) {
        return await axios.delete(`${RestManager.baseUri}admin/sponsor/${id}`, {signal});
    }

    public static async getSponsorship(signal: AbortSignal): Promise<SponsorshipListResponse> {
        return await this.get<SponsorshipListResponse>("admin/sponsor/list", signal);
    }

    public static async getRegistrations(signal: AbortSignal, competitionId?: string): Promise<RegistrationListResponse> {
        return await this.get<RegistrationListResponse>(`admin/registration/list${competitionId ? `?competition=${competitionId}` : ""}`, signal);
    }

    public static async getRegistration(signal: AbortSignal, competitionId?: string): Promise<{
        data: RegistrationData
    }> {
        return await this.get<{ data: RegistrationData }>(`admin/registration/${competitionId}`, signal);
    }

    public static async approveRegistration(signal: AbortSignal, competitionId: string): Promise<{
        data: RegistrationData
    }> {
        return await this.post<{ data: RegistrationData }>(
            `admin/registration/${competitionId}/approve`,
            {},
            {
                headers: {
                    "Content-Type": "application/json"
                }
            },
            signal
        );
    }

    public static async rejectRegistration(signal: AbortSignal, competitionId: string, reason: string): Promise<{
        data: RegistrationData
    }> {
        return await this.post<{ data: RegistrationData }>(
            `admin/registration/${competitionId}/reject`,
            {reason},
            {
                headers: {
                    "Content-Type": "application/json"
                }
            },
            signal
        );
    }

    public static async getStats(signal: AbortSignal): Promise<Stats> {
        return await this.get<Stats>(`admin/stats`, signal);
    }

    /**
     * Send analytics data to server
     * @param type 0 = page_open, 1 = button_click, 2 = page_change, 3 = page_close, 4 = page_error
     * @param data any data in array
     */
    public static sendAnalytics(type: 0 | 1 | 2 | 3 | 4, data: object[]): void {
        axios.post(`${RestManager.baseUri}analytics/cheer`, {type, data}, {
            headers: {
                "Content-Type": "application/json"
            }
        }).then(() => void 0).catch(() => void 0);
    }

    public static getAnalytics(signal: AbortSignal, page?: number, limit?: number, type?: -1 | 0 | 1 | 2 | 3 | 4): Promise<AnalyticsResponse> {
        const options: any = {};
        if (type !== undefined && type >= 0) options.type = type;
        if (page !== undefined) options.page = page;
        if (limit !== undefined) options.amount = limit;
        return this.get<AnalyticsResponse>(`analytics/cheer?d=${JSON.stringify(options)}`, signal);
    }

    public static getSponsorsClient(signal: AbortSignal): Promise<SponsorListResponse> {
        return this.get<SponsorListResponse>("sponsor/get-all-data", signal);
    }
}

export interface SponsorshipListResponse {
    data: SponsorData[];
}

export interface SponsorListResponse {
    sponsors: string[];
    promotionVideo?: string;
}

export interface SponsorData {
    id: string;
    name: string;
    icon: string;
    video: string | null;
    views: number;
}

export interface AnalyticsResponse {
    data: AnalyticsData[];
    totalData: number;
}

export interface AnalyticsData {
    ip: string;
    device: string;
    date: Date;
    type: AnalyticsType;
    data: any;
}

export enum AnalyticsType {
    PAGE_OPEN,
    BUTTON_CLICK,
    PAGE_CHANGE,
    PAGE_CLOSE,
    PAGE_ERROR
}

export const AnalyticsTypeString = {
    [AnalyticsType.PAGE_OPEN]: 'PAGE_OPEN',
    [AnalyticsType.BUTTON_CLICK]: 'BUTTON_CLICK',
    [AnalyticsType.PAGE_CHANGE]: 'PAGE_CHANGE',
    [AnalyticsType.PAGE_CLOSE]: 'PAGE_CLOSE',
    [AnalyticsType.PAGE_ERROR]: 'PAGE_ERROR'
}

export interface Stats {
    ram: RAM;
    uptime: number;
    cpu: CPU;
    registrations: Registrations;
    admins: Admin[];
}

export interface Admin {
    email: string;
    data: Registrations;
}

export interface Registrations {
    confirmed: number;
    pending: number;
    rejected: number;
    total?: number;
}

export interface CPU {
    user: number;
    system: number;
}

export interface RAM {
    total: number;
    used: number;
}


export interface UserData {
    user: User;
    admin: boolean;
}

export interface User {
    username: Username;
    _id: string;
    email: string;
    id: string;
    avatar: null;
    __v: number;
}

export interface Username {
    surname: string;
    givenName: string;
}


export interface RegistrationOpenResponse {
    open: boolean;
}

export interface CompetitionListResponse {
    competitions: CompetitionData[];
    lastUpdated: string;
}

export interface CompetitionData {
    id: string;
    name: string;
    nickname: string;
    oldPrice: string;
    price: string;
    schoolLevel: "Junior" | "Senior" | "All";
    participants: { min: number, max: number };
    requiredData: {
        teacher: string[],
        participant: string[]
    };
    skipToParticipant: boolean;
    guidebook: string;
    technical: string;
    contacts: { name: string, number: string }[];
}

export interface RegistrationListResponse {
    data: RegistrationData[];
}

export interface RegistrationData {
    id: string; // server will create this
    competition: string;
    competitionData: CompetitionData;
    schoolLevel: string;
    data: {
        teacher: [string, any][]; // [key, value]
        participant: [string, any][]; // [key, value]
        files: {
            passPhotoAndStudentCard: string;
            teacherPassPhoto: string;
            schoolLetter: string;
            paymentProof: string;
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
