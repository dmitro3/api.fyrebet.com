const socket = require("../socket")


const DispatcherEvents = require("../constants/DispatcherEvents");
const SocketEvents = require("../constants/SocketEvents");


const sessionStore = require("../store/session");



const bind = (io) => {

    const onUserAvatarChanged = ({ sessionId, avatar }) => {
        console.log(sessionId, avatar);
        io.to(sessionId).emit(SocketEvents.USER_AVATAR_CHANGED, avatar)
    }


    sessionStore.addChangeListener(
        DispatcherEvents.SESSION_USER_AVATAR_CHANGED,
        onUserAvatarChanged
    )
}


module.exports = bind;