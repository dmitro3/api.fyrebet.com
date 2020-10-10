const SocketEvents = require("../constants/SocketEvents");


const sessionActions = require('../actions/session');
const chatActions = require('../actions/chat');


const sessionStore = require('../store/session');
const ratesStore = require('../store/rates');
const chatStore = require("../store/chat")
const ratesDbo = require("../dbo/rates");
const ChatDbo = require("../dbo/chat")


const ClientData = require("../models/clientData")
module.exports = async function (socket) {
    const sessionId = socket.id;

    // We send sessionId and we wait for CLIENT_DATA
    socket.emit(SocketEvents.SESSION_ID, sessionId);


    socket.on(SocketEvents.CLIENT_DATA, async (clientDataRaw) => {
        // validate client data
        // 
        const clientData = new ClientData(clientDataRaw);
        if (clientData.isValid()) {
            // Get chat room for user's language
            console.log(clientData)
            const langPublicChat = await chatActions.getChatRoomData(clientData.language);
            // Make user join all the chat rooms
            [langPublicChat].map((chat) => {
                socket.join(chat.chatRoomUUID);
            });
            socket.emit(SocketEvents.INITIAL_STATUS, {
                rates: ratesStore.getRates(),
                publicChatRooms: [langPublicChat]
            });
        }

    })


    socket.on(SocketEvents.AUTHENTICATE, async (authenticationToken) => {
        const session = sessionStore.get(sessionId);
        if (!session) {
            console.log('Something wrong on authentication');
            return; // Something wrong
        }
        // Test begin
        user = await sessionActions.authenticateUser({ sessionId, authenticationToken });

        if (user !== false) {
            user.openChats = await ChatDbo.getUserChats(user.id);
            // Make user join all the chat rooms
            user.openChats.map((chat) => {
                socket.join(chat.chatRoomUUID);
            });
            // Emit user data to socket
            socket.emit(SocketEvents.USER_DATA, user);
        }
        else {
            socket.emit(SocketEvents.AUTHENTICATION_FAILED, true);
        }
    });


};