const { EventEmitter } = require("events");
const keyMirror = require("keymirror");
var crypto = require('crypto-js');

const { db } = require('../db');
const roll = require("../classes/provablyfair");



const { closeRound, getRoundById, registerBet, getNextRoundId, registerNewRound } = require("../dbo/fortune-wheel");
const Errors = require("../constants/errors");
const FortuneWheelConstants = require("../constants/fortune-wheel");

const sessionStore = require("../store/session");
const socketRoom = require("../socket-rooms/fortune-wheel");

const DispatcherEvents = require("../constants/DispatcherEvents");

const Bots = require('../bots/fortune-wheel');

const debug = true;


const { getValueInUSD } = require("../helpers/rates");

class FortuneWheel extends EventEmitter {
    constructor(params) {
        super(params);
        this.resetBets();
    }

    addChangeListener(event, callback) {
        this.on(event, callback);
    }

    removeChangeListener(event, callback) {
        this.removeListener(event, callback);
    }
    emitChange(event, data) {
        data = Object.assign({ game: this }, data);
        this.emit(event, data);
    }
    async initialize(io) {

        socketRoom.bind(io);

        debug && console.log(`/fortune-wheel initialize() with isInitialized ${this.isInitialized}`);

        if (this.isInitialized) return;

        // Get last rounds and check when is the next draw
        this.history = await this.fetchRoundsHistory(FortuneWheel.HISTORY_ROUNDS_TO_LOAD) || [];
        // Perform proper actions based on last game
        this.currentRound = this.history[0];

        if (FortuneWheelConstants.USE_BOTS) {
            // Start bots
            Bots.start(this);
        }

        if (!this.currentRound || this.currentRound.isDrawn) {
            // There is no previous round, or the previous round is already drawn
            debug && console.log('WIll call a new round');
            this.newRound();
        }
        else if (this.currentRound && !this.currentRound.isDrawn) {

            this.scheduleCurrentRoundDraw();
        }


        // Flag to avoid re-initialization    
        this.isInitialized = true;
    }


    resetBets() {
        this.allBets = {
            arr: [],
            usdValue: 0,
        };

        this.mBets = {
            2: {
                arr: [],
                usdTotal: 0.0,
            },
            3: {
                arr: [],
                usdTotal: 0.0,
            },
            5: {
                arr: [],
                usdTotal: 0.0,
            },
            50: {
                arr: [],
                usdTotal: 0.0,
            },
        };
    }
    getStatus() {
        return {
            round: this.getInsensitiveRoundData(),
            history: this.history,
            mBets: this.mBets
        }
    }
    // Schedule a round to be closed - which triggers a new round creation soon after
    scheduleCurrentRoundDraw() {
        let withinSeconds = (this.currentRound.drawTimestamp - parseInt(Date.now() / 1000)) * 1000;
        withinSeconds = withinSeconds > 0 ? withinSeconds : 0
        debug && console.log(`Scheduling draw for round #${this.currentRound.roundId} within ${(withinSeconds / 1000)} seconds`);
        setTimeout(() => {
            this.currentRound.isDrawn = true;
            closeRound(this.currentRound.roundId).then(() => {
                this.onRoundDrawn(this.currentRound);
            }).catch(() => {
                console.log('Error while drawing round');
            });
            // Close bets for round
        }, withinSeconds);
    }

    onRoundDrawn(round) {
        debug && console.log(`Round #${this.currentRound.roundId} drawn with roll ${this.currentRound.roll}`);
        this.emitChange(DispatcherEvents.FORTUNE_WHEEL_ROUND_DRAWN, {
            round: round
        });
        setTimeout(() => {
            this.newRound();
        }, FortuneWheel.DELAY_BETWEEN_ROUNDS * 1000);
    }

    roundIsDrawn(round) {
        round = round || this.currentRound;
        return round.isDrawn; // round.drawTimestamp <= parseInt(Date.now() / 1000);
    }

    getInsensitiveRoundData(round) {
        // Avoids outputting round secret and roll if it has not been drawn
        let rnd = Object.assign({}, round || this.currentRound); // Clone the object without reference
        if (!this.roundIsDrawn(rnd)) {
            delete rnd.secret; delete rnd.roll; delete rnd.winningMultiplier;
        }
        return rnd;
    }


    async fetchRoundsHistory(count) {
        return await db.query('select * from fortuneWheelRounds order by createdTimestamp desc limit ?', [count]);
    }
    addRoundHistory(round) {
        round = round || this.currentRound;
        this.history.push(round);
        if (this.history.length > FortuneWheel.HISTORY_ROUNDS_TO_LOAD) {
            this.history.shift();
        }
    }

    storeBet(bet) {
        const usdValue = getValueInUSD({
            currency: bet.betCurrency,
            amount: bet.betAmount,
        });

        this.allBets.arr.push(bet);
        this.allBets.usdTotal += usdValue;

        this.mBets[bet.multiplier].arr.push(bet);
        this.mBets[bet.multiplier].usdTotal += usdValue;
    }
    async newRound() {
        this.resetBets();
        debug && console.log('/fortune-wheel newRound()');
        if (this.currentRound) {
            this.addRoundHistory(this.currentRound);
        }
        this.currentRound = {
            isDrawn: false,
            createdTimestamp: parseInt(Date.now() / 1000),
            drawTimestamp: parseInt(Date.now() / 1000) + FortuneWheel.DELAY_DRAW, // Time when the round results will be drawn
            secret: crypto.SHA256('.*' + Date.now().toString() + ".z" + Date.now().toString().split("").reverse().join("") + ".fx").toString(crypto.enc.Hex)
        };

        // Public seed. Secret never gets output
        this.currentRound.hashedSecret = crypto.SHA256(this.currentRound.secret).toString(crypto.enc.Hex);



        const nextRoundId = await getNextRoundId();

        this.currentRound.roll = parseFloat((roll(this.currentRound.hashedSecret, nextRoundId) * 54 / 100).toFixed(2));
        this.currentRound.winningMultiplier = FortuneWheelConstants.SLOTS_MULTIPLIERS[Math.floor(this.currentRound.roll)];
        this.currentRound.roundId = await registerNewRound({ createdTimestamp: this.currentRound.createdTimestamp, drawTimestamp: this.currentRound.drawTimestamp, secret: this.currentRound.secret, hashedSecret: this.currentRound.hashedSecret, roll: this.currentRound.roll, winningMultiplier: this.currentRound.winningMultiplier });
        debug && console.log(`Created round #${this.currentRound.roundId}`);
        // Output results to people

        this.scheduleCurrentRoundDraw(this.currentRound);
        this.emitChange(DispatcherEvents.FORTUNE_WHEEL_ROUND_BEGIN, {
            round: this.getInsensitiveRoundData()
        });

    }

    // Throws errors!
    async newBet({ user, betCurrency, betAmount, multiplier }) {
        debug && console.log(`/fortune-wheel newBet(${user.id},${betCurrency},x${multiplier},${betAmount})`);
        if (!this.roundIsDrawn()) {
            try {
                const betId = await registerBet({ roundId: this.currentRound.roundId, userId: user.id, betCurrency, betAmount, multiplier });
                if (betId) {
                    const bet = { user, betAmount, betCurrency, multiplier };
                    this.storeBet(bet);
                    this.emitChange(DispatcherEvents.FORTUNE_WHEEL_USER_BET, { bet });
                    return betId;
                }
            }
            catch (e) {
                console.log('Throwing', e);
                throw e;
            }

        }
        else {
            throw Errors.ERR_BETS_CLOSED;
        }
    }



    output(event, data) {
        this.socket.to(this.ROOM_NAME).emit(event, data);
    }



}

FortuneWheel.isInitialized = false;
FortuneWheel.DELAY_DRAW = 25;
FortuneWheel.DELAY_BETWEEN_ROUNDS = 15;
FortuneWheel.HISTORY_ROUNDS_TO_LOAD = 25;
FortuneWheel.ROOM_NAME = "/fortune-wheel";


const fortuneWheelGame = new FortuneWheel();




module.exports = fortuneWheelGame;