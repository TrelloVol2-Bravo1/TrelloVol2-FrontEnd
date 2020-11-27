import React from 'react';
import {Route, Redirect} from 'react-router-dom';
import UserService from "../services/user.service";

function PrivateRoute({component: Component, ...rest}) {

    return (
        <Route {...rest} render={props => {
            if (UserService.IsAuthenticated()) {
                return <Component {...props} />
            } else {
                return <Redirect to={'/login'}/>
            }
        }}/>
    );
}

export default PrivateRoute;
