export class TableModel {
    constructor(private id: number, private name: string, private author_id: number) {
    }

    getTableId(): number {
        return this.id;
    }

    getTableName(): string {
        return this.name;
    }

    getUserId(): number {
        return this.author_id;
    }

    setTableName(newName: string): void {
        this.name = newName;
    }
}
