import UserService from "./user.service";
import {TableModel} from "../models/table.model";

export default class ApiService{
    static getURL() {
        return process.env.REACT_APP_SERVER_URL;
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
            const table = new TableModel(data.data[i].table_id, data.data[i].table_name, data.data[i].user_id);
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
                table_name: name
            }),
        };

        const response = await fetch(ApiService.getURL() + 'table', requestOptions);
        const data = await  response.json();
        return data.table;
    }
}
