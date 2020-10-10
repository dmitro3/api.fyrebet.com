const { EventEmitter } = require("events");

// import { sendMessage } from "../socket";
// const Errors = require("../constants/errors");
// const CHANGE_EVENT = "change";

const dispatcher = require("../dispatcher");
const DispatcherEvents = require("../constants/DispatcherEvents");
const SocketEvents = require("../constants/SocketEvents");

class SessionStore extends EventEmitter {
    constructor() {
        super();
        this.sessions = {}; // Keys are socket.id (session id);
        this.userIdSessionPairs = {};
    }

    add({ sessionId, resources }) {
        // Register socket session in the database here
        let insertData = { sessionId };
        Object.assign(insertData, resources);
        this.sessions[sessionId] = insertData;
    }

    onUserAuthenticated({ user, sessionId }) {
        //console.log('onUserAuthenticated', sessionId, user.id);
        this.sessions[sessionId].user = user;
        this.sessions[sessionId].isAuthenticated = true;
        this.userIdSessionPairs[user.id] = sessionId;
    }

    get(sessionId) {
        return this.sessions[sessionId];
    }
    remove({ sessionId, userId }) { // Can be either sessionId or userId 
        sessionId = sessionId || this.userIdSessionPairs[userId];
        const session = this.sessions[sessionId];
        if (session) {
            delete this.sessions[sessionId];
            if (session.user && session.user.id)
                delete this.userIdSessionPairs[session.user.id];
        }


    }

    bindSocketServer(io) {
        this.io = io;
    }


    getSocketServer() {
        return this.io;
    }
    getByUserId(userId) {
        return this.userIdSessionPairs[userId];
    }
    getUserBySessionId(sessionId) {
        const sess = this.sessions[sessionId];
        return sess ? sess.user : undefined;
    }
    updateAvatar({ sessionId, userId, avatar }) {
        //console.log('sessionStore.updateAvatar', sessionId, userId, avatar);
        if (!userId in this.userIdSessionPairs) {
            console.log('Could not find userIdSessionPair for userId ', userId)
            return false;
        }
        sessionId = sessionId || this.userIdSessionPairs[userId];
        if (this.sessions[sessionId].user) {
            this.sessions[sessionId].user.avatar = avatar
        };
        return sessionId;

    }
    addChangeListener(event, callback) {
        this.on(event, callback);
    }
    emitChange({ event, sessionId, data }) {
        data && (data.sessionId = sessionId);
        this.emit(event, data);
    }
}



const sessionStore = new SessionStore();


sessionStore.dispatchToken = dispatcher.register(({ event, sessionId, data }) => {
    switch (event) {
        case DispatcherEvents.SESSION_CONNECTED:
            // New user connected
            sessionStore.add({ sessionId, resources: data });
            break;
        case DispatcherEvents.SESSION_DISCONNECTED:
            sessionStore.remove(sessionId);
            break;
        case DispatcherEvents.SESSION_USER_AVATAR_CHANGED:
            sessionId = sessionStore.updateAvatar({ userId: data.userId, avatar: data.avatar }); // Reassign sessionId - in case it was not found
            if (!sessionId) return; // Don't emit further
            break;
        case DispatcherEvents.SESSION_USER_AUTHENTICATED:
            const { user } = data;
            sessionStore.onUserAuthenticated({ user, sessionId });
            break;
    }
    sessionStore.emitChange({ event, sessionId, data });
});

module.exports = sessionStore;
