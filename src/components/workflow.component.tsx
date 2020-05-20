import * as React from 'react';
import * as go from 'gojs';
import _ from 'lodash';
import { DiagramWrapper } from './DiagramWrapper';
import randomColor from "randomcolor";
import statusService from '../services/status.service';
import workflowService from '../services/workflow.service';
import { RouteComponentProps } from "react-router-dom";
import Axios from 'axios';
import moment from "moment";
import TSFormat from "../services/ts.format";


interface AppState {
  // ...
  wf?: IWorkflow;
  newWfName? : string;
  wfList: Array<IWorkflow>;
  status: Array<Status>;
  dirty: boolean;
  nameMap: Map<string, string>;
  nodeDataArray: Array<go.ObjectData>;
  linkDataArray: Array<go.ObjectData>;
  modelData: go.ObjectData;
  selectedKey: number | null;
  skipsDiagramUpdate: boolean;
  content: string;
}

interface Status {
  sid: string;
  sname: string;
}

interface StateMachineEntry {
  from_status: number | null;
  to_status: number;
}

interface MatchParams {
  id: string;
}

interface Props extends RouteComponentProps<MatchParams> {
  wfid: string;
  onWfChange: (wfid : string) => {}
}

interface IWorkflow {
  wfid?: number;
  wfname: string;
  created_ts: string;
  state_machine?: Array<StateMachineEntry>;
}

interface IWorkflowId{
  wfid : number;
}

export default class Workflow extends React.Component<Props, AppState> {
    constructor(props: Props) {
        super(props);

        this.state = {
            // ...
            wfList: [],
            status: [],
            nameMap: new Map(),
            dirty: false,
            content: "",
            nodeDataArray: [

            ],
            linkDataArray: [
             
            ],
            modelData: {
              canRelink: true
            },
            selectedKey: null,
            skipsDiagramUpdate: false
          };
          // bind handler methods
          this.handleDiagramEvent = this.handleDiagramEvent.bind(this);
          this.handleModelChange = this.handleModelChange.bind(this);
          this.handleRelinkChange = this.handleRelinkChange.bind(this);
          this.handleWFselect = this.handleWFselect.bind(this);
          this.handleWFReset = this.handleWFReset.bind(this);
          this.handleWFSave = this.handleWFSave.bind(this);
          this.handleWFNameChange = this.handleWFNameChange.bind(this);
    }

    private toLinkDataArry(smeList: Array<StateMachineEntry>){
      var count = 0;
      var linkDataArray = new Array<go.ObjectData>();
      smeList.forEach(sm=>{
        if(sm.from_status !== null){
          linkDataArray.push({ key: --count, from: sm.from_status, to: sm.to_status });
        } else {
          linkDataArray.push({ key: 0, from: 0, to: sm.to_status });
        }
      });
      return linkDataArray;
    }

    private toNodeArray(smeList: Array<StateMachineEntry>, nameMap: Map<number, string>){
      var nodeDataArray = new Array<go.ObjectData>();
      var idSet = new Set<number>();
      smeList.forEach(sme => {
        if(sme.from_status != null){
          idSet.add(sme.from_status);
        }
        idSet.add(sme.to_status);
      });

      nodeDataArray.push({ key: "0", text: "Init", color: randomColor({luminosity: 'light'})});

      idSet.forEach(sid =>{
        nodeDataArray.push({ key: sid, text: nameMap.get(sid), color: randomColor({luminosity: 'light'})});
      });
      return nodeDataArray;
    }

    public componentDidMount(){
      const wfid : string = this.props.wfid;
      if(wfid === "new") {
        this.newWF();
      } else {
        this.fetchWF(wfid);
      }
    }

    private newWF(){
      
      this.fetchWFList();

      this.setState({
        wf:{wfname:"", created_ts:""},
        nodeDataArray: [{ key: "0", text: "Init", color: randomColor({luminosity: 'light'})}],
        linkDataArray: []
      });
    }

    private fetchWFList(){
      workflowService.getWorkfows().then(
        response => {
          var wfList = response.data;
          this.setState({wfList: wfList});
        }, error => {
          this.setState({
            content:
              (error.response && error.response.data) ||
              error.message ||
              error.toString()
          });
        }
      );
    }

    private fetchWF(wfid?: string){
      const oldWFid = this.state.wf? this.state.wf.wfid : undefined;
      if(oldWFid === wfid){
        return;
      }

      this.fetchWFList();

      if (wfid) {
        //Render selected WF
        statusService.getStatusList().then(
          response => {
            var statusList = response.data;
            var statusMap = new Map();
            _.forEach(statusList, (s: Status) => {
              statusMap.set(s.sid, s.sname);
            });
            this.setState({
              status: statusList,
              nameMap: statusMap
            });
            workflowService.getWorkfow(wfid).then(response => {
              var wf: IWorkflow = response.data;
              this.setState(
                {
                  wf: wf,
                  nodeDataArray: wf.state_machine ? this.toNodeArray(wf.state_machine, statusMap) : [],
                  linkDataArray: wf.state_machine ? this.toLinkDataArry(wf.state_machine) : []
                }
              )
              this.props.onWfChange(wfid);
            }, error => {
              this.setState({
                content:
                  (error.response && error.response.data) ||
                  error.message ||
                  error.toString()
              });
            }
            );
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
      } else {
        this.setState(
          {
            wf: undefined,
            nodeDataArray: [],
            linkDataArray: []
          }
        )
      }
    }


    
    
    /**
     * Handle any app-specific DiagramEvents, in this case just selection changes.
     * On ChangedSelection, find the corresponding data and set the selectedKey state.
     *
     * This is not required, and is only needed when handling DiagramEvents from the GoJS diagram.
     * @param e a GoJS DiagramEvent
     */
    public handleDiagramEvent(e: go.DiagramEvent) {
      const name = e.name;
      switch (name) {
        case 'ChangedSelection': {
          const sel = e.subject.first();
          if (sel) {
            this.setState({ selectedKey: sel.key });
          } else {
            this.setState({ selectedKey: null });
          }
          break;
        }
        default: break;
      }
    }

    

    /**
     * Handle GoJS model changes, which output an object of data changes via Model.toIncrementalData.
     * This method should iterates over those changes and update state to keep in sync with the GoJS model.
     * This can be done via setState in React or another preferred state management method.
     * @param obj a JSON-formatted string
     */
    public handleModelChange(obj: go.IncrementalData) {
      const insertedNodeKeys = obj.insertedNodeKeys;
      const modifiedNodeData = obj.modifiedNodeData;
      const removedNodeKeys = obj.removedNodeKeys;
      const insertedLinkKeys = obj.insertedLinkKeys;
      const modifiedLinkData = obj.modifiedLinkData;
      const removedLinkKeys = obj.removedLinkKeys;

      //

      var dirty = false;

      var nodeDataArray = _.cloneDeep(this.state.nodeDataArray);

      if(insertedNodeKeys) {
        insertedNodeKeys.forEach(
          k => {
            if(!this.state.nodeDataArray.find(n => { return n.key === k})){
              dirty = true;
              nodeDataArray.push({ key: k, text: ""});
            }
          }
        )
      }

      if(modifiedNodeData) {
        modifiedNodeData.forEach(
          m => {
            if(!this.state.nodeDataArray.find(n => {return n.key === m.key && n.text === m.text })){
              dirty = true;
              var mn = nodeDataArray.find(n => n.key === m.key);
              if(mn){
                mn.text = m.text;
              }
            }
          }
        )
      }

      if(removedNodeKeys) {
        removedNodeKeys.forEach(
          r => {
            if(this.state.nodeDataArray.find(n => { return n.key === r})){
              dirty = true;
              _.remove(nodeDataArray, n => n.key === r);
            }
          }
        );
      }

      var linkDataArray = _.cloneDeep(this.state.linkDataArray);

      if(insertedLinkKeys) {
        insertedLinkKeys.forEach(
          k => {
            if(!this.state.linkDataArray.find(l => {return l.key === k})){
              dirty = true;
              linkDataArray.push({ key: k, from: undefined, to: undefined })
            }
          }
        )
      }

      if(modifiedLinkData){
        modifiedLinkData.forEach(
          m => {
            if(!this.state.linkDataArray.find(l => {return m.key === l.key && m.from === l.from && m.to === l.to})){
              dirty = true;
              var ml = linkDataArray.find(l => l.key === m.key);
              if(ml){
                ml.from = m.from;
                ml.to = m.to;
              }

            }
          }
        )
      }

      if(removedLinkKeys) {
        removedLinkKeys.forEach(
          r => {
            if(this.state.linkDataArray.find(l => {return l.key === r})){
              dirty = true;
              _.remove(linkDataArray, l => l.key === r)
            }
          }
        )
      }

      if(dirty){
        this.setState({
          nodeDataArray : nodeDataArray,
          linkDataArray : linkDataArray
        });
      }

      if(!this.state.dirty){
        this.setState({dirty: dirty});
      }

      console.log(obj);

      // see gojs-react-basic for an example model change handler
      // when setting state, be sure to set skipsDiagramUpdate: true since GoJS already has this update
    }

    public handleWFselect(e : any) {
      const wfid= e.target.value;
      this.fetchWF(wfid);
    }

    public handleWFReset(e : any) {
      this.newWF();
    }

    public handleWFNameChange(e : any) {
      this.setState({ newWfName: e.target.value});
    }

    public handleWFSave(e : any){
      var nodeDataArray = _(this.state.nodeDataArray).cloneDeep();
      var promises = _(nodeDataArray)
        .filter(n => n.key != 0)
        .filter(n => {return !this.state.status.find(s => s.sid === n.key && s.sname === n.text)})
        .map(n => {return statusService.saveStatus({sname: n.text})}).value();
      
        Axios.all(promises).then((results) => {
          statusService.getStatusList().then(
            response => {
              var statusList : Status[] = response.data;

              var linkDataArray = _(this.state.linkDataArray).cloneDeep();

              nodeDataArray.forEach(n => {
                var newStatus = statusList.find(s => s.sname === n.text && s.sid !== n.key && n.key !== "0")
                if(newStatus !== undefined) {
                  linkDataArray.forEach(l => {
                    if(l.from === n.key && newStatus) {
                      l.from = newStatus.sid
                    }
                    if(l.to === n.key && newStatus) {
                      l.to = newStatus.sid
                    }
                  });

                  n.key = newStatus.sid;
                }
              })

              var statemachine : StateMachineEntry[] = this.linkToStateMachine(linkDataArray);
              if(this.state.newWfName){
                var wf:IWorkflow = {
                  wfname : this.state.newWfName,
                  state_machine : statemachine,
                  created_ts : TSFormat.toStr(moment())
                };

                workflowService.saveWorflow(wf).then(
                  response=>{
                    var wfid :IWorkflowId = response.data;
                    this.fetchWF(wfid.wfid.toString());
                  }
                );

              }
            }
          )
        });
    }

    private linkToStateMachine(linkDataArray: Array<go.ObjectData>){
      return _.map(linkDataArray, l => {return { from_status: parseInt(l.from) === 0? null : parseInt(l.from), to_status: parseInt(l.to)}});
    }

    /**
     * Handle changes to the checkbox on whether to allow relinking.
     * @param e a change event from the checkbox
     */
    public handleRelinkChange(e: any) {
      const target = e.target;
      const value = target.checked;
      this.setState({ modelData: { canRelink: value }, skipsDiagramUpdate: false });
    }

    public render() {
      let selKey;
      if (this.state.selectedKey !== null) {
        selKey = <p>Selected key: {this.state.selectedKey}</p>;
      }

      return (
        <div className="container">
          <div className="row">
            <div className="form-group">
              <select className="form-control" onChange={this.handleWFselect} id="sel1" value={this.state.wf?.wfid? this.state.wf.wfid : "new"}>
                {_.map(this.state.wfList, (w: IWorkflow) => {
                  return (<option value={w.wfid}>{w.wfname} - &lt;{w.created_ts}&gt;</option>)
                })}
                {! this.state.wf?.wfid && (<option value="new">Create WF</option>)}
              </select>
            </div>
          </div>
          <div className="row mb-2">
              <DiagramWrapper
                nodeDataArray={this.state.nodeDataArray}
                linkDataArray={this.state.linkDataArray}
                modelData={this.state.modelData}
                skipsDiagramUpdate={this.state.skipsDiagramUpdate}
                onDiagramEvent={this.handleDiagramEvent}
                onModelChange={this.handleModelChange}
              />
          </div>
          <div className="row">
            <input className="form-control mb-2" type="text" onChange={this.handleWFNameChange} ></input>
            <button className="btn btn-primary mb-2 mr-2" disabled={!this.state.dirty} onClick={this.handleWFSave} type="button">
              Save As
            </button>
            <button className="btn btn-primary mb-2" type="button" onClick={this.handleWFReset}>
              Reset
            </button>
          </div>
          <label>
            Allow Relinking?
          <input
              type='checkbox'
              id='relink'
              checked={this.state.modelData.canRelink}
              onChange={this.handleRelinkChange} />
          </label>
          {selKey}
        </div>
      );
    }

}
