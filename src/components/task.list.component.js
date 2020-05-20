import React, { Component } from "react";
import { Link } from "react-router-dom";
import _ from "lodash"
import taskService from "../services/task.service"

export default class TaskList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            content: ""
        };
    }

    componentDidMount() {
        const pid = this.props.pid;
        taskService.getTaskListForProject(pid).then(
            response => {
                this.setState({
                    tlist: response.data,
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
        return _.map(this.state.tlist, t => {
            return (
                <tr>
                    <th scope="row">{t.tid}</th>
                    <td><Link to={`/task/${t.pid}`}>{t.title}</Link></td>
                    <td>{t.status}</td>
                    <td>{t.description}</td>
                </tr>
            );
        });
    }



    render() {
        return (
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
        );
    }
}