
const SocketEvents = require('../constants/SocketEvents');

const ChatConstants = require('../constants/Chat');
const chatStore = require('../store/chat');
const ChatDbo = require('../dbo/chat');

const sessionStore = require('../store/session');
const Errors = require('../constants/errors');
const { Validator } = require("node-input-validator");
const dispatcher = require('../dispatcher');


const chatActions = require("../actions/chat");
const UserDbo = require("../dbo/user");
const Langs = require('../constants/Langs');
const { ERROR } = require('../constants/SocketEvents');
const { ERR_NO_ACCESS_TO_CONVERSATION } = require('../constants/errors');
const ActionTypes = require('../constants/ActionTypes');


const sendChatMessage = async ({ sessionId, messageText, room = "EN" }) => {

    // Get the session's user
    const { user } = sessionStore.get(sessionId);


    if (!(user && user.id)) throw Errors.ERR_UNAUTHENTICATED;

    // To whom is the user sending this message? 

    const v = new Validator(
        { message: messageText },
        {
            message: 'required|minLength:3|maxLength:125',
        }
    )
    let pass = await v.check();
    if (!pass)
        switch (v.errors['message']['rule']) {
            case 'minLength':
            case 'required':
                throw Errors.ERR_MESSAGE_TOO_SHORT;
                break;
            case 'maxLength':
                throw Errors.ERR_MESSAGE_TOO_LONG;
                break;
            default:
                throw Errors.ERR_UNKNOWN;
                break;

        }
    let timeLeftToChat = await ChatDbo.userTimeLeftToChat(user.id);
    if (false) {//timeLeftToChat > 0) {
        throw ([Errors.ERR_WAIT_BEFORE_SENDING_MESSAGE, timeLeftToChat]);
    }
    const messageId = await ChatDbo.insertMessage({
        userId: user.id,
        messageText: messageText
    });

    const messageData = {
        messageText,
        messageId,
        userUUID: user.UUID,
        username: user.username,
        timestamp: parseInt(Date.now() / 1000),
        avatarUrl: user.avatar.sizes['32'],
        room
    };

    dispatcher.dispatch({
        actionType: ActionTypes.CHAT_MESSAGE_RECEIVED,
        sessionId,
        data: messageData
    });
}










const sendMessage = async ({ sessionId, chatRoomUUID, messageText }) => {
    // TODO - checks whether the user can send message

    // Get the session's user
    const { user } = sessionStore.get(sessionId);

    if (!(user && user.id)) throw Errors.ERR_UNAUTHENTICATED;

    console.log('sendMessage', sessionId, chatRoomUUID, messageText);

    // const chatRoom = await ChatDbo.getChatRoom({ chatRoomUUID, requestingUserId: user.id });



    const sentMessageUUID = await ChatDbo.sendMessage({
        userId: user.id,
        chatRoomUUID,
        messageText
    });

    sentMessageUUID && dispatcher.dispatch({
        actionType: ActionTypes.CHAT_MESSAGE_RECEIVED,
        sessionId,
        data: {
            message: {
                messageUUID: sentMessageUUID,
                userUUID: user.UUID,
                chatRoomUUID,
                messageText,
                username: user.username,
                avatarUrl: typeof user.avatar === 'object' && '32' in user.avatar.sizes ? user.avatar.sizes['32'] : undefined
            },
            senderUserId: user.id
        }
    });
    return sentMessageUUID;


}

const getChatRoomData = async (chatRoomUUID) => {
    console.log('getChatRoomData', chatRoomUUID)
    const availableChatRoomData = chatStore.getChatRoomData(chatRoomUUID); // Try to get chat room data for public / grouped chat rooms if there are nay.
    //console.log('availableChatRoomData', availableChatRoomData)
    if (!false) { // availableChatRoomData
        // Retrieve chat room from database

        const chatRoom = await ChatDbo.getChatRoom({ chatRoomUUID });

        if (!chatRoom) {
            throw Errors.ERR_NO_ACCESS_TO_CONVERSATION;
        }
        delete chatRoom.chatRoomId; // Hide real IDs from users.
        chatRoom.messages = await ChatDbo.getMessages(chatRoomUUID, 0, 50);
        return chatRoom;
    }

    return availableChatRoomData;
}


const getUserChatsHistory = async ({userId, skip, limit, lang}) => {
    
    skip = parseInt(skip);
    if (isNaN(skip) || skip < 0){
        skip = 0;
    }
    limit = parseInt(limit);
    if (isNaN(skip) || skip < ChatConstants.CHAT_HISTORY_LOAD_CHUNKS){
        limit = ChatConstants.CHAT_HISTORY_LOAD_CHUNKS;
    }

    if (limit - skip != ChatConstants.CHAT_HISTORY_LOAD_CHUNKS){
        // Request was forged. We only load chat by pre-defined chunks
        throw Errors.ERR_UNKNOWN;
    }
    
    // We expect LANG to be already validated in ClientData
    
    return await ChatDbo.getUserChatsHistory({userId, skip, limit, lang});
}

const onChatVisitedByUser = async ({ chatRoomUUID, userId }) => {
    // Mostly needed to set messages to seen status (like the blue ticks on WA)
    return await ChatDbo.updateLastSeen({ chatRoomUUID, userId })
}
module.exports = { sendMessage, getChatRoomData, onChatVisitedByUser, getUserChatsHistory } 