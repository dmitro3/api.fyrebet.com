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

const ActionTypes = require("../constants/ActionTypes");

const Bots = require('../bots/fortune-wheel');

const debug = true;


const { getValueInUSD } = require("../helpers/rates");
const fortuneWheelGame = require("./fortune-wheel");
const JackpotRouletteBet = require("../models/Jackpot/Bet");
const JackpotRouletteRound = require("../models/Jackpot/Round");
const Errors = require("../constants/errors")
class JackpotRouletteGame {

    /**
     * There is by default one room.
     * The plan is to scale it to multi-level rooms where people 
     * are limited to a limit on the maxium amount they can bet
     */

     /**
     * @type {JackpotRouletteRound}
     */
    static currentRound;


    /**
     * @type {JackpotRouletteRound[]}
     */
    static history; 
    /**
     * @type {JackpotRouletteRound}
     */
    static previousRound = () => {
        if (Array.isArray(this.previousRound) &&  history.length){
            return history[history.length-1];
        }
        return undefined;
    };


    /**
     * @param {JackpotRouletteBet} bet
     * @param {string} roundUUID - Optional forn ow
     */
    static placeBet = (bet, roundUUID) => {
        if (this.currentRound.hasBetsOpen()){
            // Player can place bet
            // Insert the bet
            this.currentRound.storeBet(bet);
        }
        throw Errors.ERR_BETS_CLOSED;
    }




    // addChangeListener(event, callback) {
    //     this.on(event, callback);
    // }

    // removeChangeListener(event, callback) {
    //     this.removeListener(event, callback);
    // }
    // emitChange(event, data) {
    //     data = Object.assign({ game: this }, data);
    //     this.emit(event, data);
    // }
    static async initialize() {
        console.log('Initializing Jackpot Roulette...')
        

        // if (this.isInitialized) return;

        // // Get last rounds and check when is the next draw
        // this.history = await this.fetchRoundsHistory(FortuneWheel.HISTORY_ROUNDS_TO_LOAD) || [];
        // // Perform proper actions based on last game
        // this.currentRound = this.history[0];

        // if (FortuneWheelConstants.USE_BOTS) {
        //     // Start bots
        //     Bots.start(this);
        // }

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
        this.emitChange(ActionTypes.FORTUNE_WHEEL_ROUND_DRAWN, {
            round: round
        });
        setTimeout(() => {
            this.createNewRound();
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
    async createNewRound() {
        debug && console.log('/jackpot - Creating new round')
        
        if (this.currentRound instanceof JackpotRouletteRound) {
            this.addRoundHistory(this.currentRound);
        }


        

        const nextRoundId = await getNextRoundId();

        
        this.currentRound.roll = parseFloat((roll(this.currentRound.hashedSecret, nextRoundId) * 54 / 100).toFixed(2));
        this.currentRound.roundId = await registerNewRound({ createdTimestamp: this.currentRound.createdTimestamp, drawTimestamp: this.currentRound.drawTimestamp, secret: this.currentRound.secret, hashedSecret: this.currentRound.hashedSecret, roll: this.currentRound.roll, winningMultiplier: this.currentRound.winningMultiplier });
        debug && console.log(`Created round #${this.currentRound.roundId}`);
        // Output results to people

        this.scheduleCurrentRoundDraw(this.currentRound);
        this.emitChange(ActionTypes.FORTUNE_WHEEL_ROUND_BEGIN, {
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
                    this.emitChange(ActionTypes.FORTUNE_WHEEL_USER_BET, { bet });
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





module.exports = JackpotRouletteGame;