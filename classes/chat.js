
const { db, escape } = require('../db');

const Errors = require('../constants/errors');

const { Validator } = require('node-input-validator'); // Input validation
const Constants = require('../constants');


class Chat {
    static async getLastFifty() {
        return await db.query('select chatMessages.*, users.username from chatMessages left join users on chatMessages.userId = users.id order by timestamp  limit 50');
    }
    static async insert({ userId, messageText }) {

        let okPacket = await db.query('insert into chatMessages (userId, messageText, timestamp) values(?,?,unix_timestamp())', [
            userId, messageText
        ]);
        if (okPacket.insertId) {
            let messageId = okPacket.insertId;
            return { messageId, messageText };
        }
        return false;

    }
    static async userTimeLeftToChat(userId) {
        let rows = await db.query('select timestamp from chatMessages where userId = ? order by timestamp desc limit 1', [userId])
        if (rows && rows.length) {
            let lastMessage = rows[0]['timestamp'];
            let currentTime = Math.floor(Date.now() / 1000);
            let difference = lastMessage + Constants.MIN_CHAT_DELAY - currentTime;
            return difference > 0 ? difference : 0;
        }

    }
    static async validate(message) {
        const v = new Validator(
            { message: message },
            {
                message: 'required|minLength:3|maxLength:125',
            }
        )
        let pass = await v.check();
        if (pass) return true;

        switch (v.errors['message']['rule']) {
            case 'minLength':
            case 'required':
                return Errors.ERR_MESSAGE_TOO_SHORT;
                break;
            case 'maxLength':
                return Errors.ERR_MESSAGE_TOO_LONG;
                break;
            default:
                return Errors.ERR_UNKNOWN;
                break;

        }


    }
}



module.exports = Chat;