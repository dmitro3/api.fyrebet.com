
const { db, escape } = require('../db');

const Errors = require('../constants/errors');

const { Validator } = require('node-input-validator'); // Input validation
const Constants = require('../constants/chat');



const getLastFifty = async () => {
    let arr = await db.query(
        `select
            chatMessages.*, 
            users.username,
            avatars.url as avatarUrl
        from chatMessages 
            left join users on chatMessages.userId = users.id 
                left join avatars on users.avatarUUID = avatars.UUID and avatars.size = 32
        order by timestamp desc
        limit 50`);

    if (Array.isArray(arr)) {
        return arr.reverse();
    }
    return [];
}
const insertMessage = async ({ userId, messageText }) => {

    let okPacket = await db.query('insert into chatMessages (userId, messageText, timestamp) values(?,?,unix_timestamp())', [
        userId, messageText
    ]);
    if (okPacket.insertId) {
        let messageId = okPacket.insertId;
        return messageId;
    }
    return false;

}
const userTimeLeftToChat = async (userId) => {
    let rows = await db.query('select timestamp from chatMessages where userId = ? order by timestamp desc limit 1', [userId])
    if (rows && rows.length) {
        let lastMessage = rows[0]['timestamp'];
        let currentTime = Math.floor(Date.now() / 1000);
        let difference = lastMessage + Constants.MIN_CHAT_DELAY - currentTime;
        return difference > 0 ? difference : 0;
    }

}


module.exports = { userTimeLeftToChat, insertMessage, getLastFifty };