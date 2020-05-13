import axios from 'axios';
import authHeader from './auth-header';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const SVC_URL = API_URL + 'user';

class UserService {

  getUsers() {
    return axios.get(SVC_URL, { headers: authHeader() });
  }

  getUser(uid) {
    return axios.get(SVC_URL + '/' + uid, { headers: authHeader() });
  }

}

export default new UserService();