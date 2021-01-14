import UserService from "./user.service";
import {TableModel} from "../models/table.model";
import {ListModel} from "../models/list.model";
import {CardModel} from "../models/card.model";
import {CardLogModel} from "../models/card-log.model";

export default class ApiService{
    static getURL() {
        return process.env.REACT_APP_SERVER_URL;
    }

    static async GetTables() {
        const requestOptions = {
            method: 'GET',
            headers: UserService.getHeaders()
        };

        const tables = [];

        const response = await fetch(ApiService.getURL() + 'table', requestOptions);
        const data = await response.json();
        for (let i = 0; i < data.data.length; i++) {
            const table = new TableModel(data.data[i].table_id, data.data[i].table_name, data.data[i].table_description, data.data[i].user_id);
            tables.push(table);
        }
        return tables;
    }

    static async GetLists(id: number) {
        const requestOptions = {
            method: 'GET',
            headers: UserService.getHeaders()
        };

        const lists = [];

        const response = await fetch(`${ApiService.getURL()}listTable/${id}`, requestOptions);
        const data = await response.json();
        for (let i = 0; i < data.data.length; i++) {
            const list = new ListModel(data.data[i].list_id, data.data[i].list_name, data.data[i].list_description,data.data[i].list_order,data.data[i].is_archived);
            lists.push(list);
        }
        return lists;
    }

    static async DeleteTable(table: TableModel) {
        const requestOptions = {
            method: 'DELETE',
            headers: UserService.getHeaders()
        };

        const response = await fetch(ApiService.getURL() + 'table/' + table.getTableId(), requestOptions);
        const data = await  response.json();
    }

    static async DeleteCard(card: CardModel) {
        const requestOptions = {
            method: 'DELETE',
            headers: UserService.getHeaders()
        };

        const response = await fetch(ApiService.getURL() + 'card/' + card.getCardID(), requestOptions);
        const data = await  response.json();
    }

    static async DeleteList(list: ListModel) {
        const requestOptions = {
            method: 'DELETE',
            headers: UserService.getHeaders()
        };

        const response = await fetch(ApiService.getURL() + 'list/' + list.getListID(), requestOptions);
        const data = await  response.json();
    }

    static async CreateTable(name: string, description: string) {
        const requestOptions = {
            method: 'POST',
            headers: UserService.getHeaders(),
            body: JSON.stringify({
                table_name: name,
                table_description: description
            }),
        };

        const response = await fetch(ApiService.getURL() + 'table', requestOptions);
        const data = await  response.json();
        return data.table;
    }

    static async CreateList(name: string, table_id: number, list_order: number) {
        const requestOptions = {
            method: 'POST',
            headers: UserService.getHeaders(),
            body: JSON.stringify({
                list_name: name,
                table_id: table_id,
                list_order: list_order
            }),
        };

        const response = await fetch(ApiService.getURL() + 'list', requestOptions);
        const data = await response.json();
        return data.list;
    }

    static async SwapListOrder(leftList: ListModel, rightList: ListModel) {
        const requestOptionsForLeft = {
            method: 'PUT',
            headers: UserService.getHeaders(),
            body: JSON.stringify({
                list_order: rightList.getListOrder()
            }),
        };

        const requestOptionsForRight = {
            method: 'PUT',
            headers: UserService.getHeaders(),
            body: JSON.stringify({
                list_order: leftList.getListOrder()
            }),
        };

        const responseForLeft = await fetch(`${ApiService.getURL()}list/${leftList.getListID()}`, requestOptionsForLeft);
        const dataForLeft = await responseForLeft.json();

        const responseForRight = await fetch(`${ApiService.getURL()}list/${rightList.getListID()}`, requestOptionsForRight);
        const dataForRight = await responseForRight.json();

        return dataForLeft.status_code === dataForRight.status_code && dataForLeft.status_code === 'success';
    }

    static async CreateCard(name: string, description: string, list_id: number, card_order: number, card_deadline: any) {
        const requestOptions = {
            method: 'POST',
            headers: UserService.getHeaders(),
            body: JSON.stringify({
                card_name: name,
                list_id: list_id,
                card_description: description,
                card_order: card_order,
                card_deadline: card_deadline
            }),
        };

        const response = await fetch(ApiService.getURL() + 'card', requestOptions);
        const data = await  response.json();
        return data.list;
    }

    static async GetCards(id: number) {
        const requestOptions = {
            method: 'GET',
            headers: UserService.getHeaders()
        };

        const cards = [];

        const response = await fetch(`${ApiService.getURL()}cardList/${id}`, requestOptions);
        const data = await response.json();
        for (let i = 0; i < data.data.length; i++) {
            const card = new CardModel(data.data[i].card_id, data.data[i].list_id, data.data[i].card_name, data.data[i].card_description, data.data[i].is_archived, data.data[i].card_order, data.data[i].card_deadline);
            cards.push(card);
        }
        return cards;
    }

    static async ConnectUserToCard(user: number, card: number) {
        const requestOptions = {
            method: 'POST',
            headers: UserService.getHeaders(),
            body: JSON.stringify({
                user_id: user,
                card_id: card
            })
        }

        const response = await fetch(`${ApiService.getURL()}` + 'cardMember', requestOptions);
        const data = await response.json();
        return data.status_code === 'success';
    }

    static async GetUserName(id: number) {
        const requestOptions = {
            method: 'GET',
            headers: UserService.getHeaders()
        }

        const response = await fetch(`${ApiService.getURL()}username/${id}`, requestOptions);
        const data = await response.json();
        return data.username;
    }

    static async GetUserIDs(id: number) {
        const requestOptions = {
            method: 'GET',
            headers: UserService.getHeaders()
        }

        const userIDs = [];

        const response = await fetch(`${ApiService.getURL()}cardMembers/${id}`, requestOptions);
        const data = await response.json();

        for (let i = 0; i < data.data.length; i++) {
            userIDs.push(data.data[i].user_id);
        }

        return userIDs;
    }

    static getDate(date: Date): string {
        const card_deadline = new Date(date);
        console.log(`${card_deadline.getDay()}/${card_deadline.getMonth()}/${card_deadline.getFullYear()} 00:00:00`);
        return `${card_deadline.getDay()}/${card_deadline.getMonth()}/${card_deadline.getFullYear()} 00:00:00`;
    }

    static async EditCard(id: number, name: string, description: string, is_archived: number, card_order: number, card_deadline: Date) {
        const requestOptions = {
            method: 'PUT',
            headers: UserService.getHeaders(),
            body: JSON.stringify({
                card_name: name,
                card_description: description,
                is_archived: is_archived,
                card_order: card_order
                // card_deadline: ApiService.getDate(card_deadline)
            }),
        };

        const response = await fetch(`${ApiService.getURL()}card/${id}`, requestOptions);
        const data = await response.json();
        return data.status_code === 'success';
    }

    static async EditList(id: number, name: string, description: string, table_id: number, is_archived: number) {
        const requestOptions = {
            method: 'PUT',
            headers: UserService.getHeaders(),
            body: JSON.stringify({
                list_name: name,
                table_id: table_id,
                list_id: id,
                is_archived: is_archived,
                list_description: description
            }),
        };

        const response = await fetch(`${ApiService.getURL()}list/${id}`, requestOptions);
        const data = await response.json();
        console.log(data);
        return true;
    }

    static async EditTable(id: number, name: string, description: string) {
        const requestOptions = {
            method: 'PUT',
            headers: UserService.getHeaders(),
            body: JSON.stringify({
                table_name: name,
                table_description: description
            }),
        };

        const response = await fetch(`${ApiService.getURL()}table/${id}`, requestOptions);
        const data = await  response.json();
        return data.status_code === 'success';
    }

    static async GetCardLogs(table_id: number) {
        const requestOptions = {
            method: 'GET',
            headers: UserService.getHeaders(),
        };

        const cardLogs = [];

        const response = await fetch(`${ApiService.getURL()}logsCard/${table_id}`, requestOptions);
        const data = await response.json();
        for (let i = 0; i < data.data.length; i++) {
            const cardLog = new CardLogModel(data.data[i].log_id, data.data[i].log_content, data.data[i].user_id, data.data[i].log_date);
            cardLogs.push(cardLog);
        }

        if (cardLogs.length > 0) {
            return cardLogs.sort((a, b) => {
               return compare(a.getLogDate(), b.getLogDate(), false);
            }).splice(0, 5);
        } else {
            return [];
        }
    }

    static async SwapCardOrder(firstCard: CardModel, secondCard: CardModel) {
        const requestOptionsForLeft = {
            method: 'PUT',
            headers: UserService.getHeaders(),
            body: JSON.stringify({
                card_order: secondCard.getCardOrder()
            }),
        };

        const requestOptionsForRight = {
            method: 'PUT',
            headers: UserService.getHeaders(),
            body: JSON.stringify({
                card_order: firstCard.getCardOrder()
            }),
        };

        const responseForLeft = await fetch(`${ApiService.getURL()}card/${firstCard.getCardID()}`, requestOptionsForLeft);
        const dataForLeft = await responseForLeft.json();

        const responseForRight = await fetch(`${ApiService.getURL()}card/${secondCard.getCardID()}`, requestOptionsForRight);
        const dataForRight = await responseForRight.json();

        return dataForLeft.status_code === dataForRight.status_code && dataForLeft.status_code === 'success';
    }

    static async ConnectUserToTable(tableId: number | undefined, newUser: string) {
        if (tableId) {
            const requestOptions = {
                method: 'POST',
                headers: UserService.getHeaders(),
                body: JSON.stringify({
                    table_id: tableId,
                    user_name: newUser
                })
            }

            const response = await fetch(`${ApiService.getURL()}` + 'tablemember', requestOptions);
            const data = await response.json();
            return data.status_code === 'success';
        }
    }

    static async ChangeCardOnListOrder(first: CardModel, listID: number) {
        const requestOptionsForLeft = {
            method: 'PUT',
            headers: UserService.getHeaders(),
            body: JSON.stringify({
                list_id: listID
            }),
        };

        const response = await fetch(`${ApiService.getURL()}card/${first.getCardID()}`, requestOptionsForLeft);
        const data = await response.json();

        return data.status_code === 'success';
    }
}

function compare(a: string | number, b: string | number, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
