const socketInterface = require('socket.io');

const sessionStore = require('./store/session');
const chatStore = require('./store/chat');
const ratesStore = require('./store/rates');

const dispatcher = require('./dispatcher');


const DispatcherEvents = require("./constants/DispatcherEvents");
const Errors = require("./constants/errors");
const TimedActions = require('./timed-actions/bundle');

const bindChatHandler = require("./socket-handlers/chat");
const bindSessionHandler = require("./socket-handlers/session");
const bindFortuneWheelHandler = require("./socket-handlers/fortune-wheel");




const bindSessionRoom = require("./socket-rooms/session");
const bindChatRoom = require("./socket-rooms/chat");







const initializeSocket = async (expressServer) => {
    console.log('Starting socket...')
    let io = socketInterface(expressServer);

    io.origins((origin, callback) => {
        if (false) {
            return callback('origin not allowed', false);
        }
        callback(null, true);
    });

    sessionStore.bindSocketServer(io);
    chatStore.bindSocketServer(io);
    ratesStore.bindSocketServer(io);

    bindSessionRoom(io);
    bindChatRoom(io);
    // Start games
    // const fortuneWheelGame = require('./games/fortune-wheel');
    // await fortuneWheelGame.initialize(io);

    // CRON-Like
    TimedActions.startAll();

    io.on("connection", async function (socket) {


        // Call dispatcher on session store to register new session
        dispatcher.dispatch({
            event: DispatcherEvents.SESSION_CONNECTED,
            sessionId: socket.id
        });
        // Bind internal "middlewares"/handlers; TODO: move to socket-handlers
        bindSessionHandler(socket);
        bindChatHandler(socket);
        bindFortuneWheelHandler(socket);


        socket.on("disconnect", () => {
            setTimeout(() => {
                dispatcher.dispatch({
                    event: DispatcherEvents.SESSION_DISCONNECTED,
                    sessionId: socket.id
                });
            });
        });
    });
    return io;
}





module.exports = { initializeSocket };