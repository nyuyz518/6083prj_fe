import React, { Component } from "react";
import moment from 'moment'
import TSFormat from '../services/ts.format'
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

        userService.getUsers().then(
            response =>{
                this.setState({
                    allUser: response.data
                });
                this.addUsersToList(aList);
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

    ulistUpdated(ulist){
        this.props.onChangeUlist(_.map(ulist, u => { return {uid: u.uid, created_ts: TSFormat.toStr(moment())}}));
    }

    addUsersToList(aList) {
        var ulist;
        _.forEach(aList, a => {
            ulist = this.doAddUserToList(a) ;
            }
        );
        this.ulistUpdated(ulist);
    }

    addUserToList(a){
        this.ulistUpdated(this.doAddUserToList(a));
    }

    doAddUserToList(a){
        var user = _.find(this.state.allUser, u => u.uid === a.uid);
        var allUser = _.filter(this.state.allUser, u => u.uid !== a.uid);
        var ulist = _.clone(this.state.ulist);
        ulist.push(user);
        this.setState({allUser, ulist});
        return ulist;
    }

    removeUserFromList(a){
        var user = _.find(this.state.ulist, u => u.uid === a.uid);
        var ulist = _.filter(this.state.ulist, u => u.uid !== a.uid);
        var allUser = _.clone(this.state.allUser);
        allUser.push(user);
        this.setState({allUser, ulist});
        this.ulistUpdated(ulist);
    }


    render(){
        return (
            <div className="row">
                    {this.state.ulist && _.map(this.state.ulist, u=> {
                        return (
                            <div className="mr-2">
                                <lable>{u.display_name}</lable>
                                {this.props.mode !== "new" && (
                                <button type="button" className="close mr-2" value={u.uid} data-dismiss="modal" aria-label="Close" onClick={(e) => this.removeUserFromList({uid: `${u.uid}`})}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                                )}
                            </div>
                        )
                    })}

                    {this.props.mode !== "new" && (
                    
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
                      onSelect={(value, item) => {this.addUserToList(item)}}/>
                    )
                    }

            </div>
        )
    }
}