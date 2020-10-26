const { EventEmitter } = require("events");
const dispatcher = require("../dispatcher");
const ActionTypes = require("../constants/ActionTypes");

const Session = require ("../models/Session");

class SessionStore extends EventEmitter {

    /**
     * Stores Session models indexed by their sessionId - whenever a socket joins, their session will be stored here
     * @typedef {Object.<string,Session>} Sessions
     * @type {Sessions} 
     */
    sessions;
    /**
     * Eaasy-access for retrieving sessions by userId key
     * @type {Object.<string,Number>} 
     */
    userIdSessionPairs;

    constructor(){
        super();
        this.sessions = {};
        this.userIdSessionPairs = {};
    }

    add({sessionId}) {
        // Register socket session in the database here
        this.sessions[sessionId] =  new Session(sessionId);
    }

    onUserAuthenticated({ user, sessionId }) {
        //console.log('onUserAuthenticated', sessionId, user.id);
        this.sessions[sessionId].user = user;
        this.sessions[sessionId].isAuthenticated = true;
        this.userIdSessionPairs[user.id] = sessionId;
    }

    /**
     * Finds the item by its unique id.
     * @param {String} sessionId  
     * @returns {Session?}
     */
    get(sessionId){
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
    emitChange({ actionType, sessionId, data }) {
        data && (data.sessionId = sessionId);
        this.emit(actionType, data);
    }

    setClientData({sessionId, clientData}){
        this.sessions[sessionId].setClientData(clientData);
    }
}  



const sessionStore = new SessionStore();


sessionStore.dispatchToken = dispatcher.register(({ actionType, sessionId, data }) => {
    switch (actionType) {
        case ActionTypes.SESSION_CONNECTED:
            // New user connected
            sessionStore.add({ sessionId, resources: data });
            break;
        case ActionTypes.SESSION_DISCONNECTED:
            sessionStore.remove(sessionId);
            break;
        case ActionTypes.SESSION_USER_AVATAR_CHANGED:
            sessionId = sessionStore.updateAvatar({ userId: data.userId, avatar: data.avatar }); // Reassign sessionId - in case it was not found
            if (!sessionId) return; // Don't emit further
            break;
        case ActionTypes.SESSION_USER_AUTHENTICATED:
            const { user } = data;
            sessionStore.onUserAuthenticated({ user, sessionId });
            break;
        case ActionTypes.CLIENT_DATA_RECEIVED:
            const {clientData } = data;
            sessionStore.setClientData({sessionId, clientData});
            break;
    }
    sessionStore.emitChange({ actionType, sessionId, data });
});

module.exports = sessionStore;
