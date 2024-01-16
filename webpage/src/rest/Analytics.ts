import {RestManager} from "./RestManager";

export class Analytics {
    public static onPageOpen(data: object[]): void {
        RestManager.sendAnalytics(0, data);
    }
    public static onButtonClick(data: object[], fn: any): void {
        RestManager.sendAnalytics(1, data);
    }

    public static onPageChange(data: object[]): void {
        RestManager.sendAnalytics(2, data);
    }

    public static onPageClose(data: object[]): void {
        RestManager.sendAnalytics(3, data);
    }

    public static onPageError(data: object[]): void {
        RestManager.sendAnalytics(4, data);
    }
}