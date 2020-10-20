const socket = require("../socket")


const DispatcherEvents = require("../constants/ActionTypes");
const SocketEvents = require("../constants/SocketEvents");


const chatStore = require("../store/chat");
const sessionStore = require("../store/session");

const chatActions = require("../actions/chat");
const ChatDbo = require("../dbo/chat");





const bind = (io) => {

    // Prefetch chat public rooms
    chatStore.publicRooms.map(async (UUID) => {
        chatStore.chatRooms[UUID].messages = await ChatDbo.getMessages(UUID);
    })

    chatStore.addChangeListener(
        DispatcherEvents.CHAT_INITIALIZED,
        () => {
            io.emit(SocketEvents.CHAT_INITIALIZED, {
                publicRooms: chatStore.getPublicRooms()
            })
        }
    );


    chatStore.addChangeListener(
        DispatcherEvents.CHAT_MESSAGE_RECEIVED,
        ({ message }) => {
            io.in(message.chatRoomUUID).emit(SocketEvents.CHAT_MESSAGE_RECEIVED, message);
        }
    );


    chatStore.addChangeListener(
        DispatcherEvents.CHAT_ADD_SESSION_TO_ROOM,
        (chatRoomUUID, sessionId) => {
            sessionId in io.sockets && io.sockets[sessionId].join(chatRoomUUID);
        }
    )

}


module.exports = bind;