import ErrorCodes from "../constants/errors";

export default class Error {
    constructor({ errorCode, variables }) {
        this.errorCode = errorCode;
        this.variables = variables;
    }

    getMessage() {
        let mesg = ErrorCodes[this.errorCode];
        if (this.variables) {
            mesg = mesg.toString().format(this.variables);
        }
        return mesg;
    }

    static inRespose(responseObject) {
        if ("errorCode" in responseObject && "variables" in responseObject) {
            return true;
        }
        return false;
    }
}
