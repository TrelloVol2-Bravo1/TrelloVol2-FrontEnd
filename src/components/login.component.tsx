import React from "react";
import styles from "../styles.module.css";
import {Link, Redirect} from "react-router-dom";
import ApiService from "../services/api.service";
import UserService from "../services/user.service";
import Button from "react-bootstrap/Button";

export default class LoginComponent extends React.Component {
    state = {
        name: "",
        password: "",
        errorMessage: "",
        redirect: false,
        redirectURL: ''
    };

    renderRedirect = () => {
        if (this.state.redirect) {
            return <Redirect to={'/' + this.state.redirectURL}/>
        }
    }


    setErrorMessage(message: string) {
        this.setState({errorMessage: message});
    }

    validate() {
        this.setErrorMessage("");
        if (this.state.name.length < 5) {
            this.setErrorMessage("Login has to be at least 5 characters length.");
            return false;
        } else {
            return true;
        }
    }

    async login() {
        if (this.validate()) {
            const url = ApiService.getURL() + 'user/auth';
            const requestOptions = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    name: this.state.name,
                    password: this.state.password,
                    email: this.state.name,
                }),
            };
            const response = await fetch(url, requestOptions);
            const data = await response.json();
            if (data.status_code === 'success') {
                UserService.LogIn(data.api_key, data.user_id);
                this.redirect('');
            } else {
                this.setErrorMessage(data.message);
            }
        }
    }

    redirect(path: string) {
        this.setState({redirectURL: path, redirect: true});
    }

    handleChange = (event: React.FormEvent<HTMLInputElement>) => {
        this.setState({
            [event.currentTarget.name]: event.currentTarget.value
        });
    }

    render() {
        return (
            <>
                {this.renderRedirect()}
                <div className={styles.loginForm}>
                    <h1>Login form:</h1>
                    <div className={styles.form}>
                        <label>
                            <span>Login:</span>
                            <input
                                name='name'
                                value={this.state.name}
                                onChange={e => this.handleChange(e)}
                                type="text"
                            />
                        </label>
                        <label>
                            <span>Password:</span>
                            <input
                                name={'password'}
                                value={this.state.password}
                                onChange={e => this.handleChange(e)}
                                type="password"
                            />
                        </label>
                        <h3
                            className={
                                this.state.errorMessage.length > 0
                                    ? styles.errorMessage
                                    : styles.notDisplay
                            }
                        >
                            {this.state.errorMessage}
                        </h3>
                        <div className={styles.buttons}>
                            <Button onClick={() => this.login()}>Login</Button>
                            <Button onClick={() => this.redirect('register')}>Register</Button>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
