import React from "react";
import styles from "./header.module.css";
import {Redirect, Link} from "react-router-dom";
import UserService from "../services/user.service";
import Button from "react-bootstrap/Button";

export default class HeaderComponent extends React.Component {

    state = {
        redirect: false,
        logged: UserService.IsAuthenticated()
    }

    logout = () => {
        UserService.LogOut().then(() => {
            this.setState({redirect: true});
            this.setState({logged: false});
        });
    }

    renderRedirect = () => {
        if (this.state.redirect) {
            return <Redirect to={'/'}/>
        }
    }

    getButtons = () => {
        if (UserService.IsAuthenticated()) {
            return <Button onClick={() => this.logout()}>Logout</Button>;
        } else {
            return <><Link to={'login'}>
                <Button>Login</Button>
            </Link>
                <Link to={'register'}>
                    <Button>Register</Button>
                </Link></>;
        }
    }

    render() {
        UserService.subject.subscribe(() => {
            this.setState({
                logged: UserService.IsAuthenticated(),
                redirect: true
            })
        });
        return (
            <div className={styles.header}>
                {this.getButtons()}
                {this.renderRedirect()}
            </div>
        );
    }
}
