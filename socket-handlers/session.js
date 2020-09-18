const SocketEvents = require("../constants/SocketEvents");


const sessionActions = require('../actions/session');
const chatActions = require('../actions/chat');


const sessionStore = require('../store/session');
const ratesStore = require('../store/rates');
const chatStore = require("../store/chat")
const ratesDbo = require("../dbo/rates");

module.exports = async function (socket) {
    const sessionId = socket.id;

    socket.emit(SocketEvents.INITIAL_STATUS, {
        sessionId,
        chat: await chatActions.getStatus(),
        rates: ratesStore.getRates()
    });

    socket.on(SocketEvents.AUTHENTICATE, async (authenticationToken) => {
        const session = sessionStore.get(sessionId);
        if (!session) {
            console.log('Something wrong on authentication');
            return; // Something wrong
        }

        user = await sessionActions.authenticateUser({ sessionId, authenticationToken });

        if (user !== false) {
            // Emit user data to socket
            socket.emit(SocketEvents.USER_DATA, user);
        }
        else {
            socket.emit(SocketEvents.AUTHENTICATION_FAILED, true);
        }
    });


};