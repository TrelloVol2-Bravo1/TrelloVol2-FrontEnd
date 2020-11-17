export class TableModel {
    constructor(private table_id: number, private table_name: string, private user_id: number) {
    }

    getTableId(): number {
        return this.table_id;
    }

    getTableName(): string {
        return this.table_name;
    }

    getUserId(): number {
        return this.user_id;
    }

    setTableName(newName: string): void {
        this.table_name = newName;
    }
}
