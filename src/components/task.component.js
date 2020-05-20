import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import _ from 'lodash';
import taskService from '../services/task.service';
import UserList from './user.list.component';

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
      task: ""
    };
  }

  componentDidMount() {
    const tid = this.props.match.params.id;
    if(tid === "new"){
      this.setState({
        new:"new"
      });
    } else {
      taskService.getTask(tid).then(
        response => {
          this.setState({
            task: response.data
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
  }
  
  render() {
    const task = this.state.task;
    const isNew = this.state.new;
    return (
      <div className="container">
        { (task || isNew) && (
        <Form ref={c => {
            this.form = c;
          }}>
            <div className="container mb-3 border-bottom">
              <div className="container row">
                <h3>ISSUE#{task.tid} <Input
                  type="text"
                  className={`${isNew ? "form-control" : "form-control-plaintext"}`}
                  name="title"
                  value={task.title}
                  onChange={this.onChangePname}
                  validations={[required]}
                /></h3>
              </div>
              <div className="form-group row border-bottom">
                <label className="col-sm-2 control-label" htmlFor="username">Project #</label>
                <div className="col-sm-10">
                  <Input
                    type="textarea"
                    className={`${isNew ? "form-control" : "form-control-plaintext"}`}
                    name="ttype"
                    value={task.pid}
                    onChange={this.onChangeDescriptionn}
                    validations={[required]}
                  />
                </div>
              </div>
              <div className="form-group row border-bottom">
                <label className="col-sm-2 control-label" htmlFor="username">Type</label>
                <div className="col-sm-10">
                  <Input
                    type="textarea"
                    className={`${isNew ? "form-control" : "form-control-plaintext"}`}
                    name="ttype"
                    value={task.ttype}
                    onChange={this.onChangeDescriptionn}
                    validations={[required]}
                  />
                </div>
              </div>
              <div className="form-group row border-bottom">
                <label className="col-sm-2 control-label" htmlFor="description">Description</label>
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
                  <Input
                    type="text"
                    className={`${isNew ? "form-control" : "form-control-plaintext"}`}
                    name="reporter"
                    value={task.reporter}
                    onChange={this.onChangeWfid}
                    validations={[required]}
                  />
                </div>
              </div>
              <div className="form-group row border-bottom">
                <label className="col-sm-2 control-label" htmlFor="wfid">Assigned To</label>
                <div className="col-sm-10">
                  <UserList
                    className={`${isNew ? "form-control" : "form-control-plaintext"}`}
                    name="owners"
                    value={task.assignees}
                    onChange={this.onChangeWfid}
                  />
                </div>
              </div>
            </div>
        </Form>
        )}
      </div>
    );
  }
}