import UserService from "./user.service";
import {TableModel} from "../models/table.model";

export default class ApiService{
    static getURL() {
        return 'https://trello-back-bravo1.herokuapp.com/';
    }

    static async GetTables() {
        const requestOptions = {
            method: 'GET',
            headers: UserService.GetHeaders()
        };

        const tables = [];

        const response = await fetch(ApiService.getURL() + 'table', requestOptions);
        const data = await response.json();
        for (let i = 0; i < data.data.length; i++) {
            const table = new TableModel(data.data[i].id, data.data[i].name, data.data[i].author_id);
            tables.push(table);
        }
        return tables;
    }

    static async DeleteTable(table: TableModel) {
        const requestOptions = {
            method: 'DELETE',
            headers: UserService.GetHeaders()
        };

        const response = await fetch(ApiService.getURL() + 'table/' + table.getTableId(), requestOptions);
        const data = await  response.json();
    }

    static async CreateTable(name: string) {
        const requestOptions = {
            method: 'POST',
            headers: UserService.GetHeaders(),
            body: JSON.stringify({
                name: name
            }),
        };

        const response = await fetch(ApiService.getURL() + 'table', requestOptions);
        const data = await  response.json();
        return data.table;
    }
}
