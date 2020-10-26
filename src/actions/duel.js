import ActionTypes from "../constants/ActionTypes";

const dispatcher = require("../dispatcher");

const {DuelTypes} = require('../constants/Duels')

const Errors = require('../constants/errors');

const DuelDbo = require('../dbo/duel');

export const challengeUser = async ({userId, challengedUserUUID, duelType}) =>{
    // Ensure the duel type exists
    if (!duelType in Object.keys(DuelTypes)){
        throw Errors.ERR_COULD_NOT_CREATE_DUEL;
    }

    // Create duel
    const duelUUID = await DuelDbo.createDuel({userId,challengedUserUUID, duelType});

    dispatcher.dispatch({
        actionType: ActionTypes.DUEL_CREATED,
        data: {duelUUID}
    })

    return duelUUID;
}