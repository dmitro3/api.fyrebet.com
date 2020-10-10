
const { db, escape } = require('../db');

const Errors = require('../constants/errors');

const { Validator } = require('node-input-validator'); // Input validation
const Constants = require('../constants/Chat');



const getByMD5 = async (md5) => {
    let results = await db.query('select * from avatars where md5 = ?', [md5]);
    if (results && Array.isArray(results) && results[0]) {
        const ret = {
            UUID: results[0].UUID,
            sizes: {}
        };
        results.map(avatarFile => {
            ret.sizes[avatarFile.size] = avatarFile.url;
        });
        return ret;
    }
    return undefined;

}

const insertAvatar = async ({ fileName, md5, userId, UUID, size }) => {
    let rowOk = await db.query('insert into avatars (md5,createdByUserId, url, timestamp, UUID, size) values (?,?,?, unix_timestamp(),?,?)', [md5, userId, fileName, UUID, size]);
    if (rowOk && rowOk.insertId) {
        return rowOk.insertId;
    }
    return false;
}


module.exports = { getByMD5, insertAvatar };