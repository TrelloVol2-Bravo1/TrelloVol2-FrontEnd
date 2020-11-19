import React from "react";
import styles from "../styles.module.css";
import {Redirect} from "react-router-dom";
import ApiService from "../services/api.service";
import Button from "react-bootstrap/Button";

export default class RegisterComponent extends React.Component {
    state = {
        name: "",
        password: "",
        repeatPassword: "",
        email: "",
        errorMessage: "",
        redirect: false
    };

    renderRedirect = () => {
        if (this.state.redirect) {
            return <Redirect to={'/'}/>
        }
    }

    setErrorMessage(message: string): void {
        if (message.length > 0) {
            this.setState({errorMessage: message});
        }
    }

    validate() {
        this.setState({errorMessage: ""});
        if (this.state.name.length < 5) {
            this.setErrorMessage("Login has to be at least 5 characters length.");
            return false;
        } else {
            if (this.state.password !== this.state.repeatPassword) {
                this.setErrorMessage("Passwords are not equal.");
                return false;
            } else {
                if (this.state.password.length < 8) {
                    this.setErrorMessage(
                        "Password has to be at least 8 characters length."
                    );
                    return false;
                } else {
                    return true;
                }
            }
        }
    }

    async login() {
        if (this.validate()) {
            const requestOptions = {
                method: "POST",
                headers: {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'},
                body: JSON.stringify({
                    name: this.state.name,
                    password: this.state.password,
                    email: this.state.email,
                }),
            };
            const url = ApiService.getURL() + "user";
            const response = await fetch(url, requestOptions);
            const data = await response.json();
            if (data.status_code === 'success') {
                this.setState({redirect: true});
            } else {
                this.setErrorMessage(data.message);
            }
        }
    }

    handleChange = (event: React.FormEvent<HTMLInputElement>) => {
        this.setState({
            [event.currentTarget.name]: event.currentTarget.value
        });
    }

    reset = () => {
        this.setState({
            errorMessage: "",
            login: "",
            password: "",
            email: "",
            repeatPassword: "",
        });
    };

    render() {
        return (
            <>
                {this.renderRedirect()}
                <div className={styles.loginForm}>
                    <h1>Register form</h1>
                    <div className={styles.form}>
                        <label>
                            <span>Login:</span>
                            <input
                                name={'name'}
                                value={this.state.name}
                                onChange={e => this.handleChange(e)}
                                type="text"
                            />
                        </label>
                        <label>
                            <span>Email:</span>
                            <input
                                name={'email'}
                                value={this.state.email}
                                onChange={e => this.handleChange(e)}
                                type="email"
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
                        <label>
                            <span>Repeat password:</span>
                            <input
                                name={'repeatPassword'}
                                value={this.state.repeatPassword}
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
                            <Button onClick={() => this.login()}>Register</Button>
                            <Button onClick={() => this.reset()}>Reset</Button>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
