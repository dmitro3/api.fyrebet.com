const initializeSocket = require("../socket");


const EVENT_FUNCTIONS = {

}


const bindChatHandler = require("../socket-handlers/chat");
const bindSessionHandler = require("../socket-handlers/session");

const bindFortuneWheel = require("../socket-handlers/fortune-wheel");




class Session {


    constructor(io, socket) {

        this.io = io;
        this.socket = socket;
        this.sessionId = socket.id;
        this.clientAddress = socket.handshake.address;
        this.userAgent = socket.handshake.headers['user-agent'];
        this.user = null;
        console.log("Connected " + this.sessionId);

        // Store this session instance staticall
        this._registerHandlers();
    }
    instance() {
        return this.socket;
    }
    error(eCode) {
        this.socket.emit("ERROR", eCode);
    }
    serverInstance() {
        return this.io;
    }
    setAuthenticatedUser(user) {
        console.log('UserId authenticated:  ' + user.id);
        this.user = user;
    }


    _registerHandlers() {




        bindSessionHandler(this);
        bindChatHandler(this);
        bindFortuneWheel(this);

        this.socket.emit("HANDSHAKE_SOCKET_ID", this.sessionId);
        // On disconnect


    }

}

module.exports = { Session };