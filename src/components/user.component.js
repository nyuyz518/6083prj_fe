import React, { Component } from "react";
import _ from "lodash"
import randomColor from "randomcolor"

import UserService from "../services/user.service";

export default class User extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ulist: ""
    };
  }

  componentDidMount() {
    UserService.getUsers().then(
      response => {
        this.setState({
          ulist: response.data
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

  renderRows(){
    return _.map(this.state.ulist, u => {
      var color = randomColor();
      return (
        <div className="media text-muted pt-3">
          <svg className="bd-placeholder-img mr-2 rounded" width="32" height="32" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: 32x32"><title>Placeholder</title><rect width="100%" height="100%" fill={color}></rect><text x="50%" y="50%" fill="{``}" dy=".3em">{u.display_name.substring(0,1)}</text></svg>
          <p className="media-body pb-3 mb-0 lh-125 border-bottom border-gray">
            <h6><strong className="d-block text-gray-dark">{u.display_name}</strong></h6>
              <ul className="list-group">
                <li className="list-group-item">Username: {u.uname}</li>
                <li className="list-group-item">Email: {u.email}</li>
                <li className="list-group-item">Since: {u.created_ts}</li>
              </ul>
          </p>
        </div>
      );
    });
  }

  render() {
    return (
      <div className="container">
        <header className="my-3 p-3 bg-white rounded shadow-sm">
          <h4 className="border-bottom border-gray pb-2 mb-2">Users</h4>
          {this.renderRows()}
        </header>
      </div>
    );
  }
}