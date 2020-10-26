
const { db, escape } = require('../db');

const Errors = require('../constants/errors');

const { Validator } = require('node-input-validator'); // Input validation
const Constants = require('../constants/Chat');





export const createDuel = async ({userId, challengedUserUUID, duelType}) =>{
    const [_, [{ createdDuelUUID, error }]] = 
        await db.query('call `createDuel`(?,?,@createdDuelUUID, @error); select @createdDuelUUID as createdDuelUUID, @error as error;',[
        userId,challengedUserUUID, duelType
    ]);
    if (error){
        throw error;
    }
    return createdDuelUUID;
}

module.exports = { createDuel };