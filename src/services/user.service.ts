import React from "react";
import ApiService from "./api.service";

export default class UserService extends React.Component {

    static getAPIkey() {
        return localStorage.getItem('x-api-key');
    }

    static getUserId() {
        return localStorage.getItem('x-user-id');
    }

    static IsAuthenticated(): boolean {
        const x_api_key = this.getAPIkey();
        const x_user_id = this.getUserId();
        return x_api_key !== null && x_api_key !== undefined &&
            x_user_id !== null && x_user_id !== undefined;
    }

    static LogIn(x_api_key: string, x_user_id: number) {
        localStorage.setItem('x-api-key', x_api_key);
        localStorage.setItem('x-user-id', x_user_id.toString());
    }

    static async LogOut() {
        const url = ApiService.getURL() + 'user/auth';
        const requestOptions = {
            method: "DELETE",
            headers: this.GetHeaders()
        };
        const response = await fetch(url, requestOptions);
        const data = await response.json();
        if (data.status_code === 'success') {
            localStorage.removeItem('x-api-key');
            localStorage.removeItem('x-user-id');
        }
    }

    static GetHeaders() {
        const header = new Headers();
        header.append("Content-Type", "application/json");
        header.append("x-api-key", this.getAPIkey() as string);
        header.append("x-user-id", this.getUserId() as string);
        return header;
    }
}
