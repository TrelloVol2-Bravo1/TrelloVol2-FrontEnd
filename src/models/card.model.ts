export class CardModel {

    constructor(private card_id: number, private list_id: number, private card_name: string, private card_description: string, private is_archived: number, private card_order: number, private card_deadline: Date) {
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

    getCardOrder(): number {
        return this.card_order;
    }

    getCardDeadline(): Date {
        return this.card_deadline;
    }

    getCleanCardDeadline(): string {
        return new Date(this.card_deadline).toDateString();
    }

    setName(name: string): void {
        this.card_name = name;
    }

    setDescription(description: string): void {
        this.card_description = description;
    }

    ifArchived(): boolean {
        return this.is_archived === 1;
    }

    setArchived(value: number): void {
        this.is_archived = value;
    }

    setCardOrder(value: number): void {
        this.card_order = value;
    }

    setDeadline(value: Date): void {
        this.card_deadline = value;
    }
}
