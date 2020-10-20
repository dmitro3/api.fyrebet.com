
const SessionClientData = require("./SessionClientData");




class Session {

    /**
     * @property {SessionClientData}
     * @type {SessionClientData}
     */
    clientData;
    user;
    sessionId;
    constructor(sessionId) {
        this.sessionId;
    }

    setClientData(clientData){
        this.clientData = new SessionClientData(clientData);
    }

    /**
     * @returns {SessionClientData?}
     */
    getClientData(){
        return this.clientData;
    }


    /**
     * Dictates whether the user can authenticate and gain user privilege elevation. 
     */
    canAuthenticate(){
        // Client must sent its fingerprints (clientData) first
        if (!this.clientData || !this.clientData.isValid()){
            return false;
        }
        return true;
    }
    

}

module.exports = Session;