import UserService from "./user.service";
import {TableModel} from "../models/table.model";
import {ListModel} from "../models/list.model";
import {CardModel} from "../models/card.model";

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
            const table = new TableModel(data.data[i].table_id, data.data[i].table_name, data.data[i].user_id);
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
            const list = new ListModel(data.data[i].list_id, data.data[i].list_name);
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

    static async CreateTable(name: string) {
        const requestOptions = {
            method: 'POST',
            headers: UserService.getHeaders(),
            body: JSON.stringify({
                name: name
            }),
        };

        const response = await fetch(ApiService.getURL() + 'table', requestOptions);
        const data = await  response.json();
        return data.table;
    }

    static async CreateList(name: string, table_id: number) {
        const requestOptions = {
            method: 'POST',
            headers: UserService.getHeaders(),
            body: JSON.stringify({
                list_name: name,
                table_id: table_id
            }),
        };

        const response = await fetch(ApiService.getURL() + 'list', requestOptions);
        const data = await  response.json();
        return data.list;
    }

    static async CreateCard(name: string, description: string,list_id: number) {
        const requestOptions = {
            method: 'POST',
            headers: UserService.getHeaders(),
            body: JSON.stringify({
                card_name: name,
                list_id: list_id,
                card_description: description
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
            const card = new CardModel(data.data[i].card_id, data.data[i].list_id, data.data[i].card_name, data.data[i].card_description);
            cards.push(card);
        }
        return cards;
    }
}
