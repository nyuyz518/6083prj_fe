import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import AuthService from "./services/auth.service";

import Login from "./components/login.component";
import Register from "./components/register.component";
import Profile from "./components/profile.component";
import Home from "./components/home.component";
import Project from "./components/project.component";
import User from "./components/user.component"
import Task from "./components/task.component";
import Workflow from "./components/workflow.component"

const APP_NAME = process.env.REACT_APP_APP_NAME;

class App extends Component {
  constructor(props) {
    super(props);
    this.logOut = this.logOut.bind(this);

    this.state = {
      showModeratorBoard: false,
      showAdminBoard: false,
      currentUser: undefined
    };
  }

  componentDidMount() {
    document.title = APP_NAME;
    const user = AuthService.getCurrentUser();

    if (user) {
      this.setState({
        currentUser: AuthService.getCurrentUser(),
      });
    }
  }

  logOut() {
    AuthService.logout();
  }

  render() {
    const { currentUser } = this.state;

    return (
      <Router>
        <div>
          <nav className="navbar navbar-expand navbar-dark bg-dark">
            <Link to={"/"} className="navbar-brand">
              {APP_NAME}
            </Link>
            <div className="navbar-nav mr-auto">
              <li className="nav-item">
                <Link to={"/home"} className="nav-link">
                  Home
                </Link>
              </li>

              {currentUser && (
                <>
                  <li className="nav-item">
                    <Link to={"/project"} className="nav-link">
                      Projects
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to={"/user"} className="nav-link">
                      Users
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to={"/task/new"} className="nav-link">
                      Report an Issue
                    </Link>
                  </li>
                </>
              )}
            </div>

            <div className="navbar-nav ml-auto">
              <Form className="form-inline my-2 my-md-0">
                <Input
                    type="text" 
                    className="form-control" placeholder="Search"
                />
              </Form>
            </div>

            {currentUser ? (
              <div className="navbar-nav ml-auto">
                <li className="nav-item">
                  <Link to={"/profile"} className="nav-link">
                    {currentUser.display_name}
                  </Link>
                </li>
                <li className="nav-item">
                  <a href="/login" className="nav-link" onClick={this.logOut}>
                    LogOut
                  </a>
                </li>
              </div>
            ) : (
                <div className="navbar-nav ml-auto">
                  <li className="nav-item">
                    <Link to={"/login"} className="nav-link">
                      Login
                  </Link>
                  </li>

                  <li className="nav-item">
                    <Link to={"/register"} className="nav-link">
                      Sign Up
                  </Link>
                  </li>
                </div>
              )}
          </nav>
          <div className="container mt-3">
            <Switch>
              <Route exact path={["/", "/home"]} component={Home} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/register" component={Register} />
              <Route exact path="/profile" component={Profile} />
              <Route exact path="/project" component={Project} />
              <Route exact path="/project/:id" component={Project} />
              <Route exact path="/user" component={User} />
              <Route exact path="/task/:id" component={Task} />
              <Route exact path="/workflow/:id" component={Workflow} />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;