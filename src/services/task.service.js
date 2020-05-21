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

    createTask(task) {
        return Axios.post(SVC_URL, task, {headers: authHeader()})
    }

    updateTask(task, tid) {
        return Axios.put(SVC_URL + "/" + tid, task, {headers: authHeader()})
    }

    getTaskStatusHistory(tid){
        return Axios.get(SVC_URL + "/" + tid + "/status", {headers: authHeader()})
    }

    changeTaskStatus(tid, status){
        return Axios.post(SVC_URL + "/" + tid + "/status", {status}, {headers: authHeader()})
    }

    findTasksByText(t){
        return Axios.get(SVC_URL, {headers: authHeader(), params: {title: t}});
    }
}

export default new TaskService(); 