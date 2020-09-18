const socket = require("../socket")


const DispatcherEvents = require("../constants/DispatcherEvents");
const SocketEvents = require("../constants/SocketEvents");



const { ROOM_NAME } = require("../constants/fortune-wheel");

const bind = (io) => {
    const fortuneWheelGame = require("../games/fortune-wheel");

    fortuneWheelGame.addChangeListener(
        DispatcherEvents.FORTUNE_WHEEL_ROUND_BEGIN,
        (roundData) => {
            io.to(ROOM_NAME).emit(SocketEvents.FORTUNE_WHEEL_ROUND_BEGIN, roundData)
        }
    )

    fortuneWheelGame.addChangeListener(
        DispatcherEvents.FORTUNE_WHEEL_USER_BET,
        ({ bet, game }) => {
            const { user, betId, betAmount, betCurrency } = bet;
            // Get from user only what's relevant to the output
            const outputUser = {
                uuid: user.uuid,
                //avatarUrl: user.avatars['x32'],
                username: user.username,
            }
            bet.user = outputUser;
            io.to(ROOM_NAME).emit(SocketEvents.FORTUNE_WHEEL_USER_BET, bet)
        }
    )

    fortuneWheelGame.addChangeListener(
        DispatcherEvents.FORTUNE_WHEEL_ROUND_DRAWN,
        (roundData) => {
            io.to(ROOM_NAME).emit(SocketEvents.FORTUNE_WHEEL_ROUND_DRAW, roundData)
        }
    )
}


module.exports = { bind };