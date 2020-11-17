import React from "react";
import styles from "./header.module.css";
import {Redirect, Link} from "react-router-dom";
import UserService from "../services/user.service";

export default class HeaderComponent extends React.Component {

    state = {
        redirect: false,
        logged: UserService.IsAuthenticated()
    }

    logout = () => {
        UserService.LogOut();
        this.setState({redirect: true});
        this.setState({logged: false});
    }

    renderRedirect = () => {
        if (this.state.redirect) {
            return <Redirect to={'/'}/>
        }
    }

    getButtons = () => {
        if (UserService.IsAuthenticated()) {
            return <button onClick={() => this.logout()}>Logout</button>;
        } else {
            return <><Link to={'login'}>
                <button>Login</button>
            </Link>
            <Link to={'register'}>
                <button>Register</button>
            </Link></>;
        }
    }

    render() {
        return (
            <div className={styles.header}>
                {this.getButtons()}
                {this.renderRedirect()}
            </div>
        );
    }
}
