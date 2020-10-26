const { EventEmitter } = require("events");
const dispatcher = require("../dispatcher");
const ActionTypes = require("../constants/ActionTypes");
const ChatDbo = require("../dbo/chat");

const Constants = require("../constants/Chat");

const SocketEvents = require("../constants/SocketEvents");

class ChatStore extends EventEmitter {

    constructor() {
        super();

        this.publicRooms = Constants.DefaultRooms;
        this.messages = {}; // Index = public rooms.

        this.chatRooms = {}; // It will be filled with all chat rooms indexed by their UUID. messages, number of online players, etc. will be updated
        this.publicRooms.map(UUID => this.chatRooms[UUID] = {
            online: 0,
        });

        // Lazy initialize public rooms. Release Initialized Chat Rooms later


    }
    getPublicRooms() {
        let ret = {};
        this.publicRooms.map(UUID => ret[UUID] = this.chatRooms[UUID]);
        return ret;
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

    initialize({ messages, publicRoomsArray }) {
        this.messages = messages;
        this.publicRooms = publicRoomsArray;
        this._isInitialzied = true;
    }

    isInitialized() {
        return !!this._isInitialzied;
    }

    storeMessage(messageData) {
        if (messageData.chatRoomUUID in this.chatRooms) {
            this.chatRooms[chatRoomUUID].messages.push(message);

            if (this.chatRooms[chatRoomUUID].messages.length >= Constants.MAX_HISTORY) {
                this.chatRooms[chatRoomUUID].messages.shift();
            }
        }

    }
    getChatRoomData(chatRoomUUID) {
        if (chatRoomUUID in this.chatRooms) {
            return this.chatRooms[chatRoomUUID];
        }
        return undefined;
    }

    addChangeListener(actionType, callback) {
        this.on(actionType, callback);
    }

    removeChangeListener(actionType, callback) {
        this.removeListener(actionType, callback);
    }
}

const chatStore = new ChatStore();

chatStore.dispatchToken = dispatcher.register(({ actionType, sessionId, data }) => {
    switch (actionType) {
        case (ActionTypes.CHAT_MESSAGE_RECEIVED):
            chatStore.storeMessage(data);
            break;
        case (ActionTypes.CHAT_INITIALIZED):
            chatStore.initialize(data);
            break;
        case (ActionTypes.CHAT_MESSAGE_RECEIVED):
            break;

    }
    chatStore.emit(actionType, data);
});

module.exports = chatStore;

