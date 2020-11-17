import React from 'react';
import {BrowserRouter, Switch} from "react-router-dom";
import AnonymousRoute from "./AnonymousRoute";
import LoginComponent from "../components/login.component";
import RegisterComponent from "../components/register.component";
import PrivateRoute from "./PrivateRoute";
import HeaderComponent from "../components/header.component";
import TablesComponent from "../components/tables.component";

export default class Router extends React.Component {

    render() {
        return (
            <BrowserRouter>
                <HeaderComponent/>
                <Switch>
                    <AnonymousRoute path={'/login'} component={LoginComponent}/>
                    <AnonymousRoute path={'/register'} component={RegisterComponent}/>
                    <PrivateRoute path={'/'} component={TablesComponent} />
                </Switch>
            </BrowserRouter>
        );
    }
}
