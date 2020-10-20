


const ActionTypes = require("../constants/ActionTypes")


const UserDbo = require("../dbo/user");


const onRoundBegin = async ({ game, round }) => {

    const botUsers = await UserDbo.getBots();
    botUsers.map((botUser) => {
        setTimeout(() => {
            const choices = [2, 3, 5, 50];
            const currencies = ['BTC', 'ETH', 'BCH'];
            const multiplier = choices[Math.floor(Math.random() * choices.length)];
            const betCurrency = currencies[Math.floor(Math.random() * currencies.length)];
            const betAmount = parseFloat(Math.random().toFixed(8));
            // Place bets
            game.newBet({ user: botUser, betCurrency, betAmount, multiplier });
        }, Math.round((Math.random() * 10000)));
    });

};

const start = (game) => {

    game.addChangeListener(
        ActionTypes.FORTUNE_WHEEL_ROUND_BEGIN,
        onRoundBegin
    );

}

const stop = (game) => {
    game.removeChangeListener(
        ActionTypes.FORTUNE_WHEEL_ROUND_BEGIN,
        onRoundBegin
    );

}


module.exports = { start, stop };