import mailgun from "mailgun-js";
import {RegistrationData} from "../Schema/Registration";
const DOMAIN = "redacted.redacted";
const mg = mailgun({apiKey: "redacted", domain: DOMAIN});

export class Email {
    static async sendPending(to: string[], subject: string, registrationId: string, seeUrl: string, competitionName: string, competitionNickname: string) {
        const data = {
            from: "Querencia Registration Team <registration@redacted.redacted>",
            to,
            subject,
            template: "pending-verification-email",
            't:variables': JSON.stringify({registration_id: registrationId, summary_link: seeUrl, competition_name: competitionName, competition_nickname: competitionNickname, registration_image: 'https://cdn.redacted.redacted/7tb15XziCOus.png'})
        };
        return mg.messages().send(data);
    }

    static async sendPendingWithUnfinished(to: string[], subject: string, competitionNickname: string, unfinishedFiles: string[], finishUrl: string) {
        const data = {
            from: "Querencia Registration Team <registration@redacted.redacted>",
            to,
            subject,
            template: "pending_w_pending_files_email",
            't:variables': JSON.stringify({competition_nickname: competitionNickname, unfinished_files: unfinishedFiles.join(', '), finish_url: finishUrl})
        };
        return mg.messages().send(data);
    }

    static async sendConfirmed(to: string[], subject: string, reg: RegistrationData) {
        const data = {
            from: "Querencia Registration Team <registration@redacted.redacted>",
            to,
            subject,
            template: "accepted_verification_email",
            't:variables': JSON.stringify({registration_id: reg.id, competition_name: reg.competitionData.name, competition_nickname: reg.competitionData.nickname, ticket_link: `https://redacted.redacted/ticket/${reg.id}?token=${reg.token}`, whatsapp_link: 'Belum siap'})
        };
        return mg.messages().send(data);
    }

    static async sendRejected(to: string[], subject: string, reg: RegistrationData, reason: string) {
        const data = {
            from: "Querencia Registration Team <registration@redacted.redacted>",
            to,
            subject,
            template: "rejected_verification_email",
            't:variables': JSON.stringify({registration_id: reg.id, competition_name: reg.competitionData.name, competition_nickname: reg.competitionData.nickname, reason: reason ?? "Alasan tidak diberi tahu"})
        };
        return mg.messages().send(data);
    }
}