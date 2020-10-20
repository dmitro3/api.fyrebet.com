const keyMirror = require("keymirror");

const Errors = keyMirror({
    ERR_UNKNOWN: null,
    ERR_INSUFFICIENT_BALANCE: null,
    ERR_BETS_CLOSED: null,
    ERR_INVALID_CURRENCY: null,
    ERR_ROUND_INEXISTENT: null,
    ERR_MESSAGE_TOO_SHORT: null,
    ERR_MESSAGE_TOO_LONG: null,
    ERR_INVALID_BET: null,
    ERR_UNAUTHENTICATED: null,
    ERR_WAIT_BEFORE_SENDING_MESSAGE: null,
    ERR_INVALID_PICTURE: null,
    ERR_WAIT_BEFORE_UPDATING_AVATAR: null,
    ERR_USER_NOT_FOUND: null,
    ERR_NO_ACCESS_TO_CONVERSATION: null,
    ERR_COULD_NOT_CREATE_DUEL: null, 
    ERR_USER_NOT_FOUND: null,
    ERR_BLOCKED_BY_USER: null,
    ERR_TARGET_USER_BLOCKED: null,

});


module.exports = Errors;