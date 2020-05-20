import axios from "axios";
import moment from "moment";
import TSFormat from "./ts.format.ts"

const API_URL = process.env.REACT_APP_BACKEND_URL;

class AuthService {
  login(username, password) {
    return axios
      .post(API_URL + "auth", {
        uname: username,
        pwd: password
      })
      .then(response => {
        if (response.data.jwt) {
          localStorage.setItem("user", JSON.stringify(response.data));
        }
        return response.data;
      });
  }

  logout() {
    localStorage.removeItem("user");
  }

  register(uname, display_name, email, passwd) {
    return axios.post(API_URL + "user", {
      uname,
      display_name,
      email,
      passwd,
      created_ts : TSFormat.toStr(moment())
    });
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));;
  }
}

export default new AuthService();