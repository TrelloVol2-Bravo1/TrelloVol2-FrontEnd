export class TableModel {
    constructor(private id: number, private name: string, private description: string, private author_id: number) {
    }

    getTableId(): number {
        return this.id;
    }

    getTableName(): string {
        return this.name;
    }

    getTableDescription(): string {
        return this.description;
    }

    getUserId(): number {
        return this.author_id;
    }

    setTableName(newName: string): void {
        this.name = newName;
    }

    setTableDescription(value: string): void {
        this.description = value;
    }
}
