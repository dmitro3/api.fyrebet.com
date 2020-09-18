// import { EventEmitter } from "events";
const dispatcher = require("../dispatcher");
const DispatcherEvents = require("../constants/DispatcherEvents");
// import { sendMessage } from "../socket";
// const Errors = require("../constants/errors");
// const CHANGE_EVENT = "change";

const Constants = require("../constants/chat");
// const { EVENTS } = require("../games/fortune-wheel");
const SocketEvents = require("../constants/SocketEvents");
class ChatStore { //extends EventEmitter
    constructor() {
        this.messages = [];
    }
    getHistory() {
        return this.messages;
    }
    bindSocketServer(io) {
        this.io = io;
    }

    getSocketServer() {
        return this.io;
    }

    initialize(chatStatus) {
        this.messages = chatStatus.messages;
        this._isInitialzied = true;
    }

    isInitialized() {
        return !!this._isInitialzied;
    }

    storeMessage(message) {

        this.messages.push(message);
        if (this.messages.length >= Constants.MAX_HISTORY) {
            this.messages.shift();
        }
        this.io.emit(SocketEvents.CHAT_MESSAGE_RECEIVED, message)
    }
}

const chatStore = new ChatStore();

chatStore.dispatchToken = dispatcher.register(({ event, sessionId, data }) => {
    switch (event) {
        case (DispatcherEvents.CHAT_MESSAGE_RECEIVED):
            chatStore.storeMessage(data);
            break;
        case (DispatcherEvents.CHAT_INITIALIZED):
            chatStore.initialize(data);
            break;
    }
    //chatStore.emitChange(event, data);
});

module.exports = chatStore;
