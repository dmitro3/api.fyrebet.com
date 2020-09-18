const keyMirror = require("keymirror");

const DispatcherEvents = keyMirror({
    RATES_UPDATED: null,
    SESSION_CONNECTED: null,
    SESSION_DISCONNECTED: null,
    SESSION_HANDSHAKE_SOCKET_ID: null,
    SESSION_USER_DATA_RECEIVED: null,
    SESSION_USER_AUTHENTICATED: null,
    SESSION_USER_AVATAR_CHANGED: null,
    CHAT_MESSAGE_RECEIVED: null,
    CHAT_INITIALIZED: null,
    SESSION_USER_LOGOUT: null,
    SESSION_AUTHENTICATION_TOKEN_RECEIVED: null,
    SESSION_USER_BALANCE_CHANGED: null,
    FORTUNE_WHEEL_ROUND_BEGIN: null,
    FORTUNE_WHEEL_ROUND_DRAWN: null,
    FORTUNE_WHEEL_USER_BET: null,
});

module.exports = DispatcherEvents;
