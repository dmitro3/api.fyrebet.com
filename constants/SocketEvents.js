const keyMirror = require("keymirror");

const SocketEvents = keyMirror({
    AUTHENTICATE: null, // Client sends authentication request
    USER_DATA: null, // Fires when user data is sent from server to client
    USER_AVATAR_CHANGED: null,
    AUTHENTICATION_FAILED: null,
    LAST_CHAT_MESSAGES: null, // Gets last chat messages - TODO: Update to CHAT_STATUS
    SEND_CHAT_MESSAGE: null,
    ERROR: null,
    SUCCESS: null,
    CHAT_MESSAGE_RECEIVED: null,
    HANDSHAKE_SOCKET_ID: null,
    INITIAL_STATUS: null,
    RATES_UPDATED: null,
    FORTUNE_WHEEL_ROUND_BEGIN: null,
    FORTUNE_WHEEL_ROUND_DRAW: null,
    FORTUNE_WHEEL_STATUS: null,
    FORTUNE_WHEEL_USER_BET: null,
    FORTUNE_WHEEL_JOIN: null,
    FORTUNE_WHEEL_LEAVE: null,
});

module.exports = SocketEvents;
