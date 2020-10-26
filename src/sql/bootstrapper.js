// Auto creates tables and inserts rows

const { db } = require('../db');
const UUID = require('../helpers/guid');
// Create default chat rooms for languages


const Langs = require("../constants/Langs");
const ChatConstants = require("../constants/Chat");


const createDefaultChatRooms = async () => {
    Object.keys(Langs).map(async (langShortCode) => {
        await db.query('insert into chatRooms (UUID, `type`, niceName) values(?,?,?)', [
            langShortCode,
            ChatConstants.Types.PUBLIC,
            Langs[langShortCode].language
        ])
    });
}

module.exports = { createDefaultChatRooms };

