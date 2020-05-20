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
    }

    addUserToList(a){
        userService.getUser(a.uid).then(
            response => {
                var ulist = _.cloneDeep(this.state.ulist);
                ulist.push({uid: response.data}); 
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
                                <lable>{u.uname}</lable>
                                <button type="button" className="close mr-2" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                        )
                    })}
                    <Autocomplete className="ml-auto"
                     items={[
                        { id: 'foo', label: 'foo' },
                        { id: 'bar', label: 'bar' },
                        { id: 'baz', label: 'baz' },
                      ]}
                      shouldItemRender={(item, value) => item.label.toLowerCase().indexOf(value.toLowerCase()) > -1}
                      getItemValue={item => item.label}
                      renderItem={(item, highlighted) =>
                        <div
                          key={item.id}
                          style={{ backgroundColor: highlighted ? '#eee' : 'transparent'}}
                        >
                          {item.label}
                        </div>
                      }
                      value={this.state.value}
                      onChange={e => this.setState({ value: e.target.value })}
                      onSelect={value => this.setState({ value })}/>
                    <button className="btn btn-primary ml-auto" type="button" >
                        Add
                    </button>
            </div>
        )
    }
}