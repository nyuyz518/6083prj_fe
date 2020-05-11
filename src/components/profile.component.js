import React, { Component } from "react";
import AuthService from "../services/auth.service";

export default class Profile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: AuthService.getCurrentUser()
        };
    }

    render() {
        const { currentUser } = this.state;

        return (
            <div className="container">
                <header className="jumbotron">
                    <h3>
                        <strong>{currentUser.uname}</strong> Profile
          </h3>
                </header>
                <p>
                    <strong>Token:</strong>{" "}
                    {currentUser.jwt.substring(0, 20)} ...{" "}
                    {currentUser.jwt.substr(currentUser.jwt.length - 20)}
                </p>
                <p>
                    <strong>User Id:</strong>{" "}
                    {currentUser.uid}
                </p>        
                <p>
                    <strong>Email:</strong>{" "}
                    {currentUser.email}
                </p>
                <p>
                    <strong>Created:</strong>{" "}
                    {currentUser.created_ts}
                </p>
            </div>
        );
    }
}