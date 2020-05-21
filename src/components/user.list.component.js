import React, { Component } from "react";
import Autocomplete from 'react-autocomplete'
import _ from "lodash"

import userService from "../services/user.service";

export default class UserList extends Component {

    constructor(props) {
        super(props);

        this.state = {
            ulist: [],
            allUser:[]
        };
    }

    componentDidMount(){
        const aList = this.props.value;
        _.forEach(aList, a => {
            this.addUserToList(a)  
        }
        );

        userService.getUsers().then(
            response =>{
                this.setState({
                    allUser: response.data
                })
            },
            error => {
                this.setState({
                  content:
                    (error.response && error.response.data) ||
                    error.message ||
                    error.toString()
                });
            }
        )
    }

    addUserToList(a){
        userService.getUser(a.uid).then(
            response => {
                var ulist = _.cloneDeep(this.state.ulist);
                ulist.push(response.data); 
              this.setState({
                ulist: ulist
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


    render(){
        return (
            <div className="row">
                    {this.state.ulist && _.map(this.state.ulist, u=> {
                        return (
                            <div className="mr-2">
                                <lable>{u.display_name}</lable>
                                <button type="button" className="close mr-2" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                        )
                    })}
                    
                    <Autocomplete className="ml-auto"
                     items={this.state.allUser}
                      shouldItemRender={(item, value) => 
                        item.display_name.toLowerCase().indexOf(value.toLowerCase()) > -1}
                      getItemValue={item => item.display_name}
                      renderItem={(u, highlighted) =>
                        <div
                          key={u.uid}
                          style={{ backgroundColor: highlighted ? '#eee' : 'white'}}
                        >
                          {u.display_name}
                        </div>
                      }
                      value={this.state.value}
                      onChange={e => this.setState({ value: e.target.value })}
                      onSelect={(value, item) => this.addUserToList(item)}/>

            </div>
        )
    }
}