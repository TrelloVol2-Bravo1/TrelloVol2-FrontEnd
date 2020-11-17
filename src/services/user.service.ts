import React from "react";

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

    static async LogOut() {
        const url = process.env.REACT_APP_SERVER_URL + 'user/auth';
        const requestOptions = {
            method: "DELETE",
            headers: this.getHeader()
        };
        const response = await fetch(url, requestOptions);
        const data = await response.json();
        if (data.status_code === 'success') {
            localStorage.removeItem('x-api-key');
            localStorage.removeItem('x-user-id');
        }
    }

    private static getHeader() {
        const header = new Headers();
        header.append("Content-Type", "application/json");
        header.append("x-api-key", this.getAPIkey() as string);
        header.append("x-user-id", this.getUserId() as string);
        return header;
    }
}
