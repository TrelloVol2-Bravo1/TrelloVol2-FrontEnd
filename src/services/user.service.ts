import ApiService from "./api.service";
import {Subject, Observable} from 'rxjs';

const UserService = {

    subject: new Subject(),

    getSubject():Observable<any> {
        return this.subject.asObservable();
    },

    getAPIkey() {
        return localStorage.getItem('x-api-key');
    },

    getUserId() {
        return localStorage.getItem('x-user-id');
    },

    IsAuthenticated(): boolean {
        const x_api_key = this.getAPIkey();
        const x_user_id = this.getUserId();
        return x_api_key !== null && x_api_key !== undefined &&
            x_user_id !== null && x_user_id !== undefined;
    },

    LogIn(x_api_key: string, x_user_id: number) {
        localStorage.setItem('x-api-key', x_api_key);
        localStorage.setItem('x-user-id', x_user_id.toString());
        this.subject.next(true);
    },

    async LogOut() {
        const url = ApiService.getURL() + 'user/auth';
        const requestOptions = {
            method: "DELETE",
            headers: this.getHeaders()
        };
        const response = await fetch(url, requestOptions);
        const data = await response.json();
        if (data.status_code === 'success') {
            localStorage.removeItem('x-api-key');
            localStorage.removeItem('x-user-id');
        }
        this.subject.next(false);
    },

    getHeaders() {
        const header = new Headers();
        header.append("Content-Type", "application/json");
        header.append("x-api-key", this.getAPIkey() as string);
        header.append("x-user-id", this.getUserId() as string);
        return header;
    }
}

export default UserService;
