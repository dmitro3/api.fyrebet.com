const SocketEvents = require("../constants/SocketEvents");
const sessionStore = require('../store/session');
const chatActions = require('../actions/chat');


module.exports = async function (socket) {
    // Chat behavior


    const sessionId = socket.id;

    const session = sessionStore.get(sessionId);

    // let lastFiftyChatMessages = await chatActions.getStatus();

    // socket.emit(SocketEvents.LAST_CHAT_MESSAGES, lastFiftyChatMessages);

    socket.on(SocketEvents.SEND_CHAT_MESSAGE, async (messageText) => {
        try {
            await chatActions.sendChatMessage({ sessionId, messageText });
        }
        catch (e) {
            console.log(e);
            socket.emit(SocketEvents.ERROR, e);
        }

    });
};