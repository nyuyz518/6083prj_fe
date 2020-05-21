import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import _ from 'lodash';
import taskService from '../services/task.service';
import statusService from '../services/status.service';
import workflowService from '../services/workflow.service';
import ProjectService from '../services/project.service';
import AuthService from '../services/auth.service';
import UserList from './user.list.component';
import qs from 'qs'
import moment from 'moment'
import TSFormat from '../services/ts.format'
import userService from "../services/user.service";

const required = value => {
  if (!value) {
    return (
      <div className="alert alert-danger" role="alert">
        This field is required!
      </div>
    );
  }
};

export default class Task extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentUser : AuthService.getCurrentUser(),
      task: {},
      reporter_name: "",
      nextStatus: {},
      plist: [],
      slist: [],
      th:[],
      wf: {},
      dirty: false,
      pid: ""
    };

    this.onChangeAssign = this.onChangeAssign.bind(this);
    this.onChangeTitle =this.onChangeTitle.bind(this);
    this.onChangeDescriptionn =this.onChangeDescriptionn.bind(this);
    this.handlePRJselect =this.handlePRJselect.bind(this);
    this.handleTypeSelect =this.handleTypeSelect.bind(this);
    this.handleStatusSelect = this.handleStatusSelect.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

  }

  componentDidMount() {
    const tid = this.props.match.params.id;
    const pid = qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).pid;

    statusService.getStatusList().then(
      response => {
        this.setState({slist: response.data});
      }
    );

    ProjectService.getListofProject().then(
      response => {
        const plist = response.data;
        const currentUser = this.state.currentUser;
        if (tid === "new") {
          this.setState({
            new: "new",
            task: { tid, pid, reporter : currentUser.uid, ttype: 'I', parent_tid: null, assignees: [] },
            plist,
            pid
          });
          if(pid){
            this.selectProject(pid);
          }
        } else {
          taskService.getTask(tid).then(
            response => {
              const task = response.data;
              workflowService.getWorkfow(task.wfid).then(
                response => {
                  this.setState({
                    task,
                    plist,
                    wf: response.data
                  });
                }
              );
              taskService.getTaskStatusHistory(tid).then(
                response => {
                  this.setState({
                    th : response.data
                  })
                }
              );
              userService.getUser(task.reporter).then(
                response => {
                  this.setState({
                    reporter : response.data
                  })
                }
              )
            }, error => {
              const resMessage =
                  (error.response &&
                      error.response.data &&
                      error.response.data.message) ||
                  error.message ||
                  error.toString();
    
              this.setState({
                  successful: false,
                  message: resMessage
              });
          }
          );
        }

      }
      , error => {
        const resMessage =
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
            error.message ||
            error.toString();

        this.setState({
            successful: false,
            message: resMessage
        });
    });

  }

  getStatusName(sid){
    const status = this.state.slist.find(s => s.sid === sid);
    return status? status.sname : status;
  }

  getNextStatus(sid){
    if(this.state.wf && this.state.slist){
      const sm = this.state.wf.state_machine;
      var candidate = _.filter(sm, sme => sme.from_status === sid);
      if(candidate.length === 0){
        candidate = _.filter(sm, sme => sme.from_status === null);
      }
      return _.filter(this.state.slist, s => candidate.find(sm => sm.to_status === s.sid));
    }else{
      return [];
    }

  }

  changeWF(wfid){
    workflowService.getWorkfow(wfid).then(
      response => {
        this.setState({
          wf: response.data
        });
      }
    );
  }

  selectProject(pid){
    const project = _.find(this.state.plist, p => p.pid === pid);
    var task = _.cloneDeep(this.state.task);
    task.pid = pid;
    task.wfid = project.wfid;
    this.setState({
      task,
      dirty: true
    });
    this.changeWF(project.wfid);
  }

  onChangeAssign(assignees){
    var task = _.cloneDeep(this.state.task);
    var tuids = _.map(task.assignees, u => u.uid).sort();
    var auids = _.map(assignees, u => u.uid).sort();
    if (!_.isEqual(tuids, auids)) {
      task.assignees = assignees;
      this.setState({
        task,
        dirty: true
      });
    }
  }

  onChangeTitle(e){
    var task = _.cloneDeep(this.state.task);
    task.title = e.target.value;
    this.setState({
      task,
      dirty: true
    });
  }

  onChangeDescriptionn(e){
    var task = _.cloneDeep(this.state.task);
    task.description = e.target.value;
    this.setState({
      task,
      dirty: true
    });
  }

  handleStatusSelect(e){
    const history = this.props.history;
    if (e.target.value !== "") {
      if (this.state.new) {
        this.setState({
          nextStatus: e.target.value,
          dirty: true
        });
      } else {
        taskService.changeTaskStatus(this.state.task.tid, e.target.value).then(
          response => {
            history.go(0);
          }, error => {
            const resMessage =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
  
            this.setState({
                successful: false,
                message: resMessage
            });
        }
        );
      }
    }
  }

  handlePRJselect(e) {
    const pid = e.target.value;
    this.selectProject(pid);
  }

  handleTypeSelect(e){
    var task = _.cloneDeep(this.state.task);
    task.ttype = e.target.value;
    this.setState({
      task,
      dirty: true
    });
  }

  handleSubmit(e){
    e.preventDefault();
    const history = this.props.history;
    var task = _.cloneDeep(this.state.task);
    const isNew = this.state.new;
    task.status = this.state.nextStatus;
    if(isNew){
      task.created_ts = TSFormat.toStr(moment());
      taskService.createTask(task).then(
        response => {
          history.push("/project/" + task.pid);
        }
        , error => {
          const resMessage =
              (error.response &&
                  error.response.data &&
                  error.response.data.message) ||
              error.message ||
              error.toString();

          this.setState({
              successful: false,
              message: resMessage
          });
      }
      );
    }else{
      task.created_ts = TSFormat.toStr(moment());
      taskService.updateTask(task, task.tid).then(
        response => {
          history.go(0);
        }, error => {
          const resMessage =
              (error.response &&
                  error.response.data &&
                  error.response.data.message) ||
              error.message ||
              error.toString();

          this.setState({
              successful: false,
              message: resMessage
          });
      }
      );
    }
  }
  
  render() {
    const task = this.state.task;
    const isNew = this.state.new;
    return (
      <div className="container">
        { (task || isNew) && (
        <Form 
            onSubmit={this.handleSubmit}
            ref={c => {
            this.form = c;
          }}>
            <div className="container mb-3 border-bottom">
              <div className="container row">
                <h3>ISSUE#{task.tid} <Input
                  type="text"
                  className={`${isNew ? "form-control" : "form-control-plaintext"}`}
                  name="title"
                  value={task.title}
                  onChange={this.onChangeTitle}
                  validations={[required]}
                /></h3>
                { this.state.dirty && (
                <div className="form-group">
                  <button className="btn btn-primary btn-block">Save</button>
                </div>
                )}
              </div>
              <div className="form-group row border-bottom">
                <label className="col-sm-2 control-label" >Project </label>
                <div className="col-sm-6">
                  <select className="form-control" onChange={this.handlePRJselect} id="sel1" value={this.state.task.pid}>
                    {_.map(this.state.plist, (p) => {
                      return (<option value={p.pid}>{p.pid} - &lt;{p.pname}&gt;</option>)
                    })}
                  </select>
                </div>
              </div>
              <div className="form-group row border-bottom">
                <label className="col-sm-2 control-label" >Status</label>
                  { !isNew && (<span className="col-sm-2">{this.getStatusName(task.status)} =&gt; </span>)}
                <div className="col-sm-3">
                  <select className="form-control" onChange={this.handleStatusSelect} id="sel2">
                    <option value="">Select</option>
                    {_.map(this.getNextStatus(task.status), (s) => {
                      return (<option value={s.sid}>{s.sname}</option>)
                    })}
                  </select>
                </div>
              </div>
              <div className="form-group row border-bottom">
                <label className="col-sm-2 control-label" >Type</label>
                <div className="col-sm-6">
                <select className="form-control" onChange={this.handleTypeSelect} id="sel3" value={task.ttype}>
                  <option value="I">ISSUE</option>
                  <option value="B">BUG FIX</option>
                  <option value="T">TASK</option>
                </select>
                </div>
              </div>
              <div className="form-group row border-bottom">
                <label className="col-sm-2 control-label">Description</label>
                <div className="col-sm-10">
                  <Input
                    type="textarea"
                    className={`${isNew ? "form-control" : "form-control-plaintext"}`}
                    name="description"
                    value={task.description}
                    onChange={this.onChangeDescriptionn}
                    validations={[required]}
                  />
                </div>
              </div>
              <div className="form-group row border-bottom">
                <label className="col-sm-2 control-label" htmlFor="reporter">Reporter</label>
                <div className="col-sm-10">
                  {isNew && this.state.currentUser.display_name}
                  {this.state.reporter && this.state.reporter.display_name}
                </div>
              </div>
              <div className="form-group row border-bottom">
                <label className="col-sm-2 control-label">Assigned To</label>
                <div className="col-sm-10">
                  <UserList
                    className={`${isNew ? "form-control" : "form-control-plaintext"}`}
                    name="owners"
                    value={task.assignees}
                    mode={task.tid}
                    onChangeUlist={this.onChangeAssign}
                  />
                </div>
              </div>
            </div>
            {this.state.message && (
              <div className="form-group">
                <div
                  className={
                    this.state.successful
                      ? "alert alert-success"
                      : "alert alert-danger"
                  }
                  role="alert"
                >
                  {this.state.message}
                </div>
              </div>
            )}
        </Form>
        )}

        {!isNew && (
          <div className="container">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Status</th>
                        <th scope="col">Time</th>
                    </tr>
                </thead>
                <tbody>
                    {_.map(this.state.th, h => {
                      return (
                        <tr>
                        <td>{h.status_id}</td>
                        <td>{this.getStatusName(h.status_id)}</td>
                        <td>{h.created_ts}</td>
                    </tr>
                      );
                    })}
                </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
}