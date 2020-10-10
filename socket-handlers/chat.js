const SocketEvents = require("../constants/SocketEvents");
const sessionStore = require('../store/session');
const chatActions = require('../actions/chat');
const ChatDbo = require("../dbo/chat");
const Errors = require("../constants/errors")
const outputError = require("../helpers/error");
const chatStore = require("../store/chat");
const Langs = require("../constants/Langs");
module.exports = async function (socket) {
    // Chat behavior


    const sessionId = socket.id;




    socket.on(SocketEvents.SEND_CHAT_MESSAGE, async (data) => {

        try {
            const { chatRoomUUID, messageText } = data;

            await chatActions.sendMessage({ sessionId, messageText, chatRoomUUID })
        }
        catch (e) {
            console.log(e)
            socket.emit(SocketEvents.ERROR, outputError(e, null));
        }

    });

    socket.on(SocketEvents.CHAT_ROOM_DATA_REQUEST, async ({ chatRoomUUID }) => {
        // Find if we have anything in our store ready to supply (Probably a public chatRoom)
        const { user } = sessionStore.get(sessionId);

        const userId = user ? user.id : null;
        try {
            console.log('CHAT_ROOM_DATA_REQUESTED', chatRoomUUID, 'BY userId', userId)
            const chatRoomData = await ChatDbo.getChatRoom({ chatRoomUUID, requestingUserId: userId });

            //console.log(chatRoomData);
            socket.join(chatRoomData.UUID);
            socket.emit(SocketEvents.CHAT_ROOM_DATA, chatRoomData);

        }
        catch (e) {
            console.log(e)
            socket.emit(SocketEvents.ERROR, outputError(e));
        }

    });



    socket.on(SocketEvents.CHAT_ROOM_VISITED, async (data) => {
        try {

            // Retriever user Id 

            const { user } = sessionStore.get(sessionId);

            const userId = user ? user.id : null;
            if (!userId) {
                return;
            }
            // User visited a specific chat room. Store on the server.
            const { chatRoomUUID } = data;
            if ('string' !== typeof chatRoomUUID || chatRoomUUID.length !== 36) {
                return;
            }
            await chatActions.onChatVisitedByUser({ userId, chatRoomUUID });
        }
        catch (e) {
            // Really do nothing, we do not need to inform the user of this event.
        }
    });
};