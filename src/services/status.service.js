import Axios from "axios";
import authHeader from "./auth-header";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const SVC_URL = API_URL + "status";

class StatusService {
    getStatusList(){
        return Axios.get(SVC_URL , {headers: authHeader()});
    }

    saveStatus(status){
        return Axios.post(SVC_URL, status, {headers: authHeader()});
    }
}

export default new StatusService(); 