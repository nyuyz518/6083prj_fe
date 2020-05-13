import Axios from "axios";
import authHeader from "./auth-header";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const SVC_URL = API_URL + "project";

class ProjectService {
    getListofProject(){
        return Axios.get(SVC_URL, {headers: authHeader()});
    }

    getProject(pid){
        return Axios.get(SVC_URL+ "/" + pid, {headers: authHeader()});
    }
}

export default new ProjectService(); 