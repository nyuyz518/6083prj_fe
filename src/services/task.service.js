import Axios from "axios";
import authHeader from "./auth-header";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const SVC_URL = API_URL + "task";

class TaskService {
    getTaskListForProject(pid){
        return Axios.get(SVC_URL , {headers: authHeader(), params: { pid: pid}});
    }

    getTask(tid) {
        return Axios.get(SVC_URL + "/" + tid , {headers: authHeader()});
    }
}

export default new TaskService(); 