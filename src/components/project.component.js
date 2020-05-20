import React, { Component } from "react";
import { Link } from "react-router-dom";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import _ from 'lodash'
import moment from 'moment'
import TSFormat from '../services/ts.format'
import AuthService from '../services/auth.service'
import projectService from "../services/project.service";
import TaskList from './task.list.component';
import UserList from './user.list.component';
import Workflow from './workflow.component';


const required = value => {
  if (!value) {
    return (
      <div className="alert alert-danger" role="alert">
        This field is required!
      </div>
    );
  }
};

export default class Project extends Component {

  constructor(props) {
    super(props);

    this.state = {
      currentUser : AuthService.getCurrentUser()
    };

    this.onChangePname = this.onChangePname.bind(this);
    this.onChangeWfid = this.onChangeWfid.bind(this);
    this.onChangeOwners =this.onChangeOwners.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChangeDescriptionn = this.onChangeDescriptionn.bind(this);
  }

  componentDidUpdate(prevProps) {
    const pid = this.props.match.params.id;
    if ("new" === pid && pid !== prevProps.match.params.id) {
      this.newProject()
    } else if (pid && pid !== prevProps.match.params.id) {
      this.fetchProject(pid);
    } else if (!pid && prevProps.match.params.id) {
      this.fetchPlist();
    }
  }

  componentDidMount() {
    const pid = this.props.match.params.id;
    if ("new" === pid) {
      this.newProject()
    } else if (pid) {
      this.fetchProject(pid);
    } else {
      this.fetchPlist();
    }
  }

  newProject() {
    var myself = {uid: this.state.currentUser.uid, created_ts: TSFormat.toStr(moment())};
    this.setState({
      new: "new",
      pid: "new",
      project: {owners: [myself]},
      pdirty: false,
      plist: undefined
    });
  }

  fetchProject(pid) {
    projectService.getProject(pid).then(
      response => {
        this.setState({
          pid,
          project: response.data,
          pdirty: false,
          plist: undefined,
          new: undefined
        });
      },
      error => {
        this.setState({
          error:
            (error.response && error.response.data) ||
            error.message ||
            error.toString()
        });
      });
  }

  fetchPlist() {
    projectService.getListofProject().then(
      response => {
        this.setState({
          plist: response.data,
          project: undefined,
          pid: undefined,
          new: undefined
        });
      },
      error => {
        this.setState({
          error:
            (error.response && error.response.data) ||
            error.message ||
            error.toString()
        });
      });
  }



  renderRows() {
    return _.map(this.state.plist, p => {
      return (
        <tr>
          <th scope="row">{p.pid}</th>
          <td><Link to={`/project/${p.pid}`}>{p.pname}</Link></td>
          <td>{p.description}</td>
          <td>{p.created_ts}</td>
        </tr>
      );
    });
  }

  onChangePname(e) {
    var project = _.cloneDeep(this.state.project);
    project.pname = e.target.value;
    this.setState({
      project: project,
      pdirty: true
    });
  }

  onChangeDescriptionn(e) {
    var project = _.cloneDeep(this.state.project);
    project.description = e.target.value;
    this.setState({
      project: project,
      pdirty: true
    });
  }

  onChangeWfid(wfid) {
    if (this.state.project && wfid !== this.state.project.wfid) {
      var project = _.cloneDeep(this.state.project);
      project.wfid = wfid
      this.setState({
        project: project,
        pdirty: true
      });
    }
  }

  onChangeOwners(owners){
    var project = _.cloneDeep(this.state.project);
    project.owners = owners;
    this.setState({
      project: project,
      pdirty: true
    });
  }

  handleSubmit(e){
    e.preventDefault();
    var project = _.cloneDeep(this.state.project);
    if(this.state.pid === "new"){
      project.created_ts = TSFormat.toStr(moment());
      projectService.createProject(project);
    } else {
      projectService.updateProject(project, this.state.pid);
    }
  }

  render() {
    return (
      <div className="container">
        {this.state.plist && (
          <>
            <header className="container row mb-2">
              <h3 className="mr-auto">Projects</h3>
              <Link className="ml-auto" to="/project/new">
                <button className="btn btn-primary" type="button">
                  New Project
            </button>
              </Link>
            </header>
            <table class="table table-hover">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Description</th>
                  <th scope="col">Created</th>
                </tr>
              </thead>
              <tbody>
                {this.renderRows()}
              </tbody>
            </table>
          </>
        )}

        {this.state.error && (
          <div className="alert alert-danger">
            {this.state.error}
          </div>
        )}

        {this.state.project && (
          <Form
            onSubmit={this.handleSubmit}
           ref={c => {
            this.form = c;
          }}>
            <div className="container mb-3 border-bottom">
              <div className="container row">
                <h3>PRJ#{this.state.pid} <Input
                  type="text"
                  className={`${this.state.new ? "form-control" : "form-control-plaintext"}`}
                  name="pname"
                  value={this.state.project.pname}
                  onChange={this.onChangePname}
                  validations={[required]}
                /></h3>
                { this.state.pdirty && (
                <div className="form-group">
                  <button className="btn btn-primary btn-block">Save</button>
                </div>
                )}
              </div>
              <div className="form-group row border-bottom">
                <label className="col-sm-2 control-label" htmlFor="username">Description</label>
                <div className="col-sm-10">
                  <Input
                    type="textarea"
                    className={`${this.state.new ? "form-control" : "form-control-plaintext"}`}
                    name="description"
                    value={this.state.project.description}
                    onChange={this.onChangeDescriptionn}
                    validations={[required]}
                  />
                </div>
              </div>
              <div className="form-group row border-bottom">
                <label className="col-sm-2 control-label" htmlFor="wfid">Workflow</label>
                <div className="col-sm-10">
                  <Workflow wfid={this.state.new? "new" : this.state.project.wfid} onWfChange={this.onChangeWfid}/>
                </div>
              </div>
              <div className="form-group row border-bottom">
                <label className="col-sm-2 control-label" htmlFor="wfid">Owners</label>
                <div className="col-sm-10">
                  <UserList
                    className={`${this.state.new ? "form-control" : "form-control-plaintext"}`}
                    name="owners"
                    value={this.state.project.owners}
                    onChange={this.onChangeOwners}
                    validations={[required]}
                  />
                </div>
              </div>

              {"new" !== this.state.pid && (
                <>
                  <div className="form-group row border-bottom">
                    <label className="col-sm-2 control-label" htmlFor="created_ts">Created</label>
                    <div className="col-sm-10">
                      <Input
                        type="text"
                        disabled="true"
                        className={`${this.state.new ? "form-control" : "form-control-plaintext"}`}
                        name="created_ts"
                        value={this.state.project.created_ts}
                        validations={[required]}
                      />
                    </div>
                  </div>
                  <div className="container row mb-2">
                    <h4 className="mr-auto">Issues:</h4>
                    <Link className="ml-auto" to="/task/new">
                      <button className="btn btn-primary" type="button">
                        Add
                      </button>
                    </Link>
                  </div>
                  <TaskList pid={this.state.project.pid} />
                </>
              )}
            </div>
          </Form>
        )}
      </div>
    );
  }

}