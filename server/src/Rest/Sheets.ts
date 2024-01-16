import {GoogleSpreadsheet} from "google-spreadsheet";
import {JWT} from "google-auth-library";

import creds from "./querencia-397812-4e460ab585d8.json";
import {CompetitionData} from "../Schema/Competition";
import axios from "axios";
import {RegistrationData} from "../Schema/Registration";
import {CONFIG} from "../Config";

const scopes = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive.file'];

export class SheetsManager {
    private jwt = new JWT({email: "redacted", key: "redacted", scopes});
    private webDoc: GoogleSpreadsheet;
    public competitions = new Map<string, CompetitionData>();
    public lastUpdated: Date = undefined;
    public ready = false;
    constructor() {
        this.webDoc = new GoogleSpreadsheet(CONFIG.SHEETS_ID, this.jwt);
        this.webDoc.loadInfo().then(() => this.fetchData());
    }

    public async fetchData(flush?: boolean): Promise<CompetitionData[]> {
        this.ready = true;
        const sheet = this.webDoc.sheetsByTitle['data_template'];
        if (!sheet) throw new Error('Sheet not found!');
        if (flush) {
            sheet.resetLocalCache();
            await this.webDoc.loadInfo();
        }
        await sheet.loadCells();
        this.competitions.clear();
        
        const dataTypes = [];
        for (let i = 10; i < 30; i++)
            if (sheet.getCell(i, 0).value !== null) dataTypes.push(sheet.getCell(i, 0).value);
        
        for (let i = 1; i < sheet.columnCount; i++) {
            if (sheet.getCell(1, i).value === null) continue;
            const teacher = [], participant = [];
            
            for (let j = 10; j < 30; j++) {
                const name = dataTypes[j - 10];
                if (!name) continue;

                if (sheet.getCell(j, i).value) teacher.push(name);
                if (sheet.getCell(j, i + 1).value) participant.push(name);
            }

            const technical = sheet.getCell(7, i).value as string;
            const d = await axios.get(technical);
            if (d.status !== 200) throw new Error('Technical guidebook not found!');

            const id = Buffer.from(`${sheet.getCell(1, i).value as string}${sheet.getCell(5, i).value === "Junior" ? "J" : sheet.getCell(5, i).value === "Senior" ? "S" : "A"}`).toString('base64').replace(/=/g, '');


            this.competitions.set(id, {
                id,
                name: sheet.getCell(1, i).value as string,
                price: `${sheet.getCell(2, i).value}`,
                nickname: sheet.getCell(3, i).value as string,
                participants: {
                    min: Number((sheet.getCell(4, i).value as string).split("+")[0]),
                    max: Number((sheet.getCell(4, i).value as string).split("+")[1])
                },
                schoolLevel: sheet.getCell(5, i).value === "Junior" ? "Junior" : sheet.getCell(5, i).value === "Senior" ? "Senior" : "All",
                contacts: (sheet.getCell(6, i).value as string).split("+").map(x => ({name: x.split("-")[0], number: x.split("-")[1]})),
                technical: d.data,
                prize: (sheet.getCell(8, i).value as string).split("+").map(x => ({level: x.split("-")[0], price: Number(x.split("-")[1])})),
                guidebook: sheet.getCell(31, i).value as string,
                requiredData: {
                    teacher, participant
                },
            });
        }
        this.lastUpdated = new Date();
        return Array.from(this.competitions.values());
    }

    public async writeRegistration(reg: RegistrationData) {
        const sheet = this.webDoc.sheetsByTitle['registration_data'];
        const addedRow = await sheet.addRow([
            reg.id,
            reg.competition,
            reg.schoolLevel,
            reg.data.teacher.map(x => `${x[0]}: ${x[1]}`).join('\n'),
            reg.data.participant.map(x => `${x[0]}: ${x[1]}`).join('\n'),
            reg.data.files.passPhotoAndStudentCard,
            reg.data.files.teacherPassPhoto,
            reg.data.files.schoolLetter,
            reg.data.files.paymentProof,
            reg.status,
            reg.dateRegistered ? new Date(reg.dateRegistered.toLocaleString("en-US", {timeZone: "Asia/Jakarta"})) : undefined,
            reg.dateConfirmed ? new Date(reg.dateConfirmed.toLocaleString("en-US", {timeZone: "Asia/Jakarta"})) : undefined,
            reg.confirmedBy,
            reg.ticketId,
            JSON.stringify(reg.competitionData)
        ], {raw: true});
        // done
        return addedRow;
    }

    public async updateRegistration(reg: RegistrationData) {
        const sheet = this.webDoc.sheetsByTitle['registration_data'];

        const rows = await sheet.getRows();
        const rowToUpdate = rows.find(row => row.get("Id") === reg.id);

        if (rowToUpdate) {
            rowToUpdate.set("Id", reg.id);
            rowToUpdate.set("Competition", reg.competition);
            rowToUpdate.set("School Level", reg.schoolLevel);
            rowToUpdate.set("Teacher Data", reg.data.teacher.map(x => `${x[0]}: ${x[1]}`).join('\n'));
            rowToUpdate.set("Participant Data", reg.data.participant.map(x => `${x[0]}: ${x[1]}`).join('\n'));
            rowToUpdate.set("Pass Photo", reg.data.files.passPhotoAndStudentCard);
            rowToUpdate.set("Teacher Pass Photo", reg.data.files.teacherPassPhoto);
            rowToUpdate.set("School Letter", reg.data.files.schoolLetter);
            rowToUpdate.set("Payment Proof", reg.data.files.paymentProof);
            rowToUpdate.set("Status", reg.status);
            rowToUpdate.set("Date Registered", reg.dateRegistered ? new Date(reg.dateRegistered.toLocaleString("en-US", {timeZone: "Asia/Jakarta"})) : undefined);
            rowToUpdate.set("Date Confirmed", reg.dateConfirmed ? new Date(reg.dateConfirmed.toLocaleString("en-US", {timeZone: "Asia/Jakarta"})) : undefined);
            rowToUpdate.set("Confirmed By", reg.confirmedBy);
            rowToUpdate.set("Ticket Id", reg.ticketId);
            rowToUpdate.set("Raw Data", JSON.stringify(reg.competitionData));

            await rowToUpdate.save();

            return rowToUpdate;
        } else {
            throw new Error('Row not found');
        }
    }

    public async systemLog(type: "warn" | "error", message: string, stack: string) {
        if (!this.ready) return false;
        // const sheet = this.webDoc.sheetsByTitle['system_logs'];
        // // [type, date, message, stack]
        // await sheet.addRow([
        //     type,
        //     new Date().toLocaleString("en-US", {timeZone: "Asia/Jakarta"}),
        //     message,
        //     stack
        // ]);
        //
        // // change type color
        // const lastRow = sheet.rowCount - 1;
        // await sheet.loadCells(`A${lastRow}:D${lastRow}`);
        // const cell = sheet.getCell(lastRow, 0);
        // if (type === "warn") cell.backgroundColor = {red: 1, green: 1, blue: 0.5};
        // else if (type === "error") cell.backgroundColor = {red: 1, green: 0.5, blue: 0.5};
        // await sheet.saveUpdatedCells();

        return true;
    }
}