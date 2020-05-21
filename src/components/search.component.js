import React, { Component } from "react";
import { Link } from "react-router-dom";
import AuthService from '../services/auth.service'
import projectService from "../services/project.service";
import _ from "lodash"
import taskService from '../services/task.service';
import qs from 'qs'



export default class Search extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
          currentUser : AuthService.getCurrentUser(),
          plist: [],
          tlist:[]
        };
    }

    componentDidMount(){
        const search = qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).qs;
        if(search){
            taskService.findTasksByText(search).then(
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
                });;
        }
    }

    renderRows() {
        return _.map(this.state.tlist, t => {
            return (
                <tr>
                    <th scope="row">{t.tid}</th>
                    <td><Link to={`/task/${t.tid}`}>{t.title}</Link></td>
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