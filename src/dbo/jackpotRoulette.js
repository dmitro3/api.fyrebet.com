
const { db, escape } = require('../db');
const JackpotRouletteRound = require('../models/Jackpot/Round');


const JackpotRouletteBet = require('../models/Jackpot/Bet');

const getRates = async () => {
    return await db.query('select * from rates');
}


/**
 * Returns roundId of the latest round
 * @returns {number}
 */
const getLastRoundId = async () => {
    return await db.query(`SELECT roundId FROM jackpotRouletteRounds order by roundId desc limit 1 `);
}



/**
 * Returns roundId of the latest round
 * @param {JackpotRouletteRound} round
 */
const insertRound = async (round) => {
    return await db.query(`INSERT INTO jackpotRouletteRounds (UUID,createdTimestamp,drawTimestamp,secret,hashedSecret, roll, isDrawn)
    values(@UUID,unix_timestamp(), null, null, @secret, @hashedSecret, null, false)`,[
        round.roundUUID,
        round.secret,
        round.hashedSecret
    ]);
}

/**
 * @returns {JackpotRouletteRound}
 */
const getLast = async () => {
    let data =  await db.query(`SELECT * from jackpotRouletteRounds order by roundId desc limit 1`);

    if (data){
        const ret = new JackpotRouletteRound(data);
        ret.roundUUID = data.UUID;
        return ret;
    }
    return null;
}

// /**
//  * @returns {number} betUUID
//  */
// const getLast = async () => {
//     let data =  await db.query(`SELECT * from jackpotRouletteRounds order by roundId desc limit 1`);

//     if (data){
//         const ret = new JackpotRouletteRound(data);
//         ret.roundUUID = data.UUID;
//         return ret;
//     }
//     return null;
// }

/**
 * @param {JackpotRouletteBet} jackpotRouletteBet
 * @param {Object} param0
 * @param {number} param0.roundId
 * @param {number} param0.userId
 */
const registerBet = async (jackpotRouletteBet, {roundId, userId}) => {

    console.log(jackpotRouletteBet);
    console.log(roundId);
    console.log(userId);
    return false;
    let row = await db.query('call `registerJackpotRouletteBet`(?,?,?,?,?,@betId, @error); select @betId as betId, @error as error;', 
    [roundId, userId, jackpotRouletteBet.amount, jackpotRouletteBet.amountUsd, jackpotRouletteBet.currencyCode]);
    //console.log('Called procedure and returned', row[1][0]);

    let betId = row[1][0].betId;
    let error = row[1][0].error;
    console.log(row)
    if (error) {
        throw error;
    }

    return betId;
}
module.exports = { getLastRoundId, insertRound, getLast, registerBet };