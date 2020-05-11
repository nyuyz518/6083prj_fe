import moment from "moment";

const MY_SQL_TF = "YYYY-MM-DD HH:mm:ss";

class TSFormat {
    fromStr(strTS){
        return moment(strTS, MY_SQL_TF);
    }

    toStr(ts){
        return ts.format(MY_SQL_TF);
    }
}

export default new TSFormat();