export class ListModel {
    constructor(private list_id: number, private list_name: string, private description: string ,private list_order: number, private is_archived: number ) {
    }

    getListID(): number {
        return this.list_id;
    }

    getListName(): string {
        return this.list_name;
    }

    getListOrder(): number {
        return this.list_order;
    }

    getDescription(): string {
        return this.description;
    }

    setDescription(value: string): void {
        this.description = value;
    }

    setListOrder(value: number): void {
        this.list_order = value;
    }

    ifArchived(): boolean {
        return this.is_archived === 1;
    }

    setArchived(value: number): void {
        this.is_archived = value;
    }

    setName(name: string) {
        this.list_name = name;
    }
}
