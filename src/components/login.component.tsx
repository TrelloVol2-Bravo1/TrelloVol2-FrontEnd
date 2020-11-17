import React from "react";
import styles from "../styles.module.css";
import {Link, Redirect} from "react-router-dom";

export default class LoginComponent extends React.Component {
    state = {
        name: "",
        password: "",
        errorMessage: "",
        redirect: false
    };

    renderRedirect = () => {
        if (this.state.redirect) {
            return <Redirect to={'/'}/>
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
            const url = process.env.REACT_APP_SERVER_URL + 'user/auth';
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
                localStorage.setItem('x-api-key', data.api_key);
                localStorage.setItem('x-user-id', data.user_id);
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
                            <button onClick={() => this.login()}>Login</button>
                            <Link to="/register">
                                <button>Register</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
