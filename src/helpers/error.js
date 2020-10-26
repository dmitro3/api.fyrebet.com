const Errors = require("../constants/errors")

module.exports = function (ErrorCode, data) {
    if (!(ErrorCode in Errors)) {
        ErrorCode = Errors.ERR_UNKNOWN;
    }
    return {
        errorCode: ErrorCode,
        variables: data // Array
    }
}