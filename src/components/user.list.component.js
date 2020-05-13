import React, { Component } from "react";
import _ from "underscore"

import userService from "../services/user.service";

export default class UserList extends Component {

    constructor(props) {
        super(props);

        this.state = {
            ulist: ""
        };
    }

    componentDidMount(){
        const uidList = this.props.value;
        _.forEach(uidList, uid => {
            userService.getUser(uid).then(
                response => {
                  this.setState({
                    ulist: {uid: response.data}
                  });
                },
                error => {
                  this.setState({
                    content:
                      (error.response && error.response.data) ||
                      error.message ||
                      error.toString()
                  });
                }
              );
            }
        );

    }

    render(){
        return (
            <div className="row">
                {this.state.ulist && _.map(this.state.ulist, u=> {
                    return (
                    <span className="col">{u.uname}</span>
                    )
                })}
                <button  className="btn btn-primary" type="button" >
                    Assign
                </button>
            </div>
        )
    }
}