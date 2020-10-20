const { EventEmitter } = require("events");

// import { sendMessage } from "../socket";
// const Errors = require("../constants/errors");
// const CHANGE_EVENT = "change";

const dispatcher = require("../dispatcher");
const ActionTypes = require("../constants/ActionTypes");
const SocketEvents = require("../constants/SocketEvents");

class DuelStore extends EventEmitter {
    constructor() {
        super();
        this.duels = {};
        
    }
    addChangeListener(actionType, callback) {
        this.on(actionType, callback);
    }
    emitChange({ actionType, sessionId, data }) {
        data && (data.sessionId = sessionId);
        this.emit(actionType, data);
    }

    storeDuel(duel){
        const {duelUUID} = duel;
        this.duels[duel.chatRoomUUID] = duel;
    }

    hasDuel(duelUUID){
        return duelUUID in Object.keys(this.duels);
    }

    terminateDuel(duelUUID){
        delete this.duels[duelUUID];
    }

    registerBet({duelUUID, bet}){
        // Store the bet 
        const duel = this.duels[duelUUID];
        this.duels[duelUUID].bets.push(bet);
        // We keep the store ignorant to whatever happens on a placed bet. Logic happens in the game-core.
    }

    userJoinedDuel({userUUID, duelUUID}){

        const acceptantUser = this.duels.parties.findIndex( partyUser => {
            return partyUser.userUUID  === userUUID;
        });

        if (acceptantUser !== -1){
            this.duels[duelUUID].parties[acceptantUser.userUUID].joined = true;
        }
        else{
            this.duels[duelUUID].parties[acceptantUser.userUUID] = { userUUID, joined: true}
        }
    }

    userAbandoned({userUUID,duelUUID, timeAbandoned}){
        this.duels[duelUUID].parties[userUUID].abandoned = timeAbandoned; // Abandoned to now
    }

    duelHasParty(userUUID){
        return this.hasDuel(userUUID) && {userUUID,duelUUID}
    }
    

}



const duelStore = new DuelStore();


duelStore.dispatchToken = dispatcher.register(({actionType, sessionId, data }) => {
    switch (actionType) {
        case ActionTypes.DUEL_CREATED:
            duelStore.storeDuel(data.duel);
            break;
        case ActionTypes.DUEL_TERMINATED:
            const {duelUUID} = data;
            break;
        case ActionTypes.DUEL_REJECTED:
            break;
        case ActionTypes.DUEL_BET_PLACED:
            break;
        case ActionTypes.DUEL_USER_ABANDONED:
            const {userUUID, duelUUID} = data;
            duelStore.userAbandoned({userUUID,duelUUID});
            break;
    }
    duelStore.emitChange({ actionType, sessionId, data });
});

module.exports = duelStore;
