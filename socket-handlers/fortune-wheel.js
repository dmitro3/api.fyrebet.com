

const { Validator } = require('node-input-validator');


const Errors = require('../constants/errors');
const { ERR_UNKNOWN } = require('../constants/errors');


const sessionStore = require("../store/session");
const SocketEvents = require('../constants/SocketEvents');
const Currencies = require("../constants/Currencies");


const { ROOM_NAME } = require("../constants/fortune-wheel");

module.exports = function (socket) {
    const fortuneWheelGame = require('../games/fortune-wheel');

    const sessionId = socket.id;

    socket.on(SocketEvents.FORTUNE_WHEEL_JOIN, () => {
        socket.join(ROOM_NAME).emit(SocketEvents.FORTUNE_WHEEL_STATUS, fortuneWheelGame.getStatus())
        // Output Current Jackpot Stats
    });
    socket.on(SocketEvents.FORTUNE_WHEEL_LEAVE, () => {
        socket.leave(ROOM_NAME)
        // Output Current Jackpot Stats
    });

    socket.on(SocketEvents.FORTUNE_WHEEL_USER_BET, async (betData) => {

        const session = sessionStore.get(sessionId);

        const { user } = session;

        if (!user) {
            socket.emit("ERROR", Errors.ERR_UNAUTHENTICATED);
            return;
        }
        if (typeof betData !== 'object') {
            return;
        }

        const { betAmount, betCurrency, multiplier } = betData;
        const v = new Validator({
            betAmount: betAmount,
            betCurrency: betCurrency,
            multiplier: multiplier
        }, {

            betAmount: 'required|decimal|between:0000000000.00000001,9999999999.99999999',
            betCurrency: `required|maxLength:6|in:${Object.keys(Currencies).join(',')}`,
            multiplier: 'required|integer|in:2,3,5,50'
        });
        const pass = await v.check();
        if (pass) {
            //console.log(user);
            let userId = user.id;
            try {
                await fortuneWheelGame.newBet({ user, betCurrency, betAmount, multiplier });
                // if (betId) {
                //     socket.emit("SUCCES", `${betCurrency} ${betAmount} placed on X${multiplier}`);
                // }
            }
            catch (e) {
                console.log(e);
                let outputErr = Errors.ERR_UNKNOWN;
                if (Errors[e]) {
                    outputErr = Errors[e];
                }
                socket.emit("ERROR", outputErr);
            }
        }
        else {
            socket.emit("ERROR", Errors.ERR_INVALID_BET);
        }


        // Validate user bet

    });
};