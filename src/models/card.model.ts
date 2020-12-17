export class CardModel {

    constructor(private card_id: number, private list_id: number, private card_name: string, private card_description: string) {
    }

    getCardID(): number {
        return this.card_id;
    }

    getCardName(): string {
        return this.card_name;
    }

    getCardListID(): number {
        return this.list_id;
    }

    getCardDescription(): string {
        return this.card_description
    }

    setName(name: string): void {
        this.card_name = name;
    }

    setDescription(description: string): void {
        this.card_description = description;
    }
}
