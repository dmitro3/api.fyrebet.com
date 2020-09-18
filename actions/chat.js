const ChatDbo = require('../dbo/chat');
const DispatcherEvents = require('../constants/DispatcherEvents');
const SocketEvents = require('../constants/SocketEvents');
const chatStore = require('../store/chat');
const sessionStore = require('../store/session');
const Errors = require('../constants/errors');
const { Validator } = require("node-input-validator");
const dispatcher = require('../dispatcher');
const { initialize, isInitialized } = require('../store/chat');



const sendChatMessage = async ({ sessionId, messageText }) => {


    const { user } = sessionStore.get(sessionId);

    if (!(user && user.id)) throw Errors.ERR_UNAUTHENTICATED;
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
        userId: user.id,
        username: user.username,
        timestamp: parseInt(Date.now() / 1000),
        avatarUrl: user.avatar.sizes['32']
    };
    console.log(messageData);

    dispatcher.dispatch({
        event: DispatcherEvents.CHAT_MESSAGE_RECEIVED,
        sessionId,
        data: messageData
    });
}

const getStatus = async () => {
    if (chatStore.isInitialized()) {
        return {
            messages: chatStore.getHistory()
        };
    }
    else {
        const messages = await ChatDbo.getLastFifty();

        const status = {
            messages: messages
        }
        dispatcher.dispatch({
            event: DispatcherEvents.CHAT_INITIALIZED,
            data: status
        });
        return status;
    }
}
module.exports = { sendChatMessage, getStatus }