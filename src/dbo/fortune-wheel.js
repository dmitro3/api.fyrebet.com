const { db } = require('../db');


const getRoundById = async (roundId) => {
    return (await db.query('select * from fortuneWheelRounds where roundId = ? limit 1', [roundId]))[0]
}


const closeRound = async (roundId) => {
    await db.query('call `fortuneWheelCloseRound`(?);', [roundId]);
}


const registerBet = async ({ roundId, userId, betCurrency, betAmount, multiplier }) => {

    let row = await db.query('call `fortuneWheelBet`(?,?,?,?,?,@betId, @error); select @betId as betId, @error as error;', [roundId, userId, betAmount, betCurrency, multiplier]);
    //console.log('Called procedure and returned', row[1][0]);

    let betId = row[1][0].betId;
    let error = row[1][0].error;
    if (error) {
        throw error;
    }

    return betId;
}

const getNextRoundId = async () => {

    let row = await db.query("call `getNextIdentityId`('fortuneWheelRounds',@nextid); select @nextId as nextId;");
    let nextId = row[1][0].nextId ? parseInt(row[1][0].nextId) : 1;
    console.log(nextId);

    return nextId;
}

const registerNewRound = async ({ createdTimestamp, drawTimestamp, secret, hashedSecret, roll, winningMultiplier }) => {
    let rowOk = await db.query("insert into fortuneWheelRounds (createdTimestamp, drawTimestamp, secret, hashedSecret, roll, winningMultiplier) values (?,?,?,?,?,?)", [
        createdTimestamp, drawTimestamp, secret, hashedSecret, roll, winningMultiplier
    ]);
    if (rowOk && rowOk.insertId) {
        return rowOk.insertId;
    }
    return false;
}



module.exports = { getRoundById, closeRound, registerBet, getNextRoundId, registerNewRound };