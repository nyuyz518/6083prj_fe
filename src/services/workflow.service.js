import Axios from "axios";
import authHeader from "./auth-header";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const SVC_URL = API_URL + "workflow";

class WorkflowService {
    getWorkfow(wfid){
        return Axios.get(SVC_URL + "/" + wfid, {headers: authHeader()});
    }

    getWorkfows(){
        return Axios.get(SVC_URL, {headers: authHeader()});
    }

    saveWorflow(wf){
        return Axios.post(SVC_URL, wf, {headers: authHeader()});
    }
}

export default new WorkflowService(); 