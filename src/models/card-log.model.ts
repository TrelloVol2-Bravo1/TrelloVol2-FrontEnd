export class CardLogModel {

    constructor(private log_id: number, private log_content: string, private user_id: number, private log_date: any) {
    }

    getLogID(): number {
        return this.log_id;
    }

    getLogContent(): string {
        return this.log_content;
    }

    getLogUserID(): number {
        return this.user_id;
    }

    getLogDate(): string {
        return this.log_date
    }
}
