export class ListModel {
    constructor(private list_id: number, private list_name: string) {
    }

    getListID(): number {
        return this.list_id;
    }

    getListName(): string {
        return this.list_name;
    }

    setName(name: string) {
        this.list_name = name;
    }
}
