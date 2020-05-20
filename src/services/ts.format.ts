import moment from "moment";

const MY_SQL_TF = "YYYY-MM-DD HH:mm:ss";

class TSFormat {
    fromStr(strTS : string){
        return moment(strTS, MY_SQL_TF);
    }

    toStr(ts : moment.Moment){
        return ts.format(MY_SQL_TF);
    }
}

export default new TSFormat();