const CryptoJS = require('crypto-js');

const { db } = require('../db');

const Constants = require("../constants/User")

const User = require('../models/User')

function uniqueId() {
  return CryptoJS.SHA256(new Date().getTime() + Math.random().toString(36)).toString(CryptoJS.enc.Hex);
}


const updateAvatar = async ({ userId, assetPath }) => {
  const result = await db.query('call `updateAvatar`(?,?,?,@error); select @error as error;', [userId, assetPath, Constants.DELAY_BETWEEN_AVATAR_UPDATE]);
  let error = result[1][0].error;
  if (error) {
    throw error;
  }
  return true;
}



const setAvatar = async ({ avatarUUID, userId }) => {
  await db.query("update users set avatarUUID = ? where id = ?", [avatarUUID, userId]);
}


async function createUser({ email, password, username, isBot }) {
  isBot = isBot || false;
  let authentication_token = uniqueId();
  let result = await db.query('call `userRegister`(?,?,?,?,?,@userId, @error); select @userId as userId, @error as error;',
    [email, password, authentication_token, username, isBot]);

  let userId = result[1][0].betId;
  let error = result[1][0].error;
  if (error) {
    throw error;
  }
  return { userId, authentication_token };

}


const registerSession = async (session_id, ip, user_agent) => {
  db.query('insert into sessions (id,ip,user_agent,created) values(?,?,?,unix_timestamp())', [
    session_id, ip, user_agent
  ]);
}

/**
 * Returns userId if user exists
 * @param {string} authenticationToken
 * @returns {number}
 */
const getIdByAuthenticationToken = async (authenticationToken) => {
  let [result] = await db.query('select id as userId from users where authentication_token = ? limit 1',[authenticationToken]);
  if (result){
    const {userId} = result;
    return userId;
  }
  return null;
} 

/**
 * @returns {User}
 * @param {string} authenticationToken 
 */
const getByAuthenticationToken = async (authenticationToken) => {

  let rows = await db.query(`select users.* from users where users.authentication_token = ? limit 1`, [authenticationToken]);
  if (rows && rows.length && rows[0] && rows[0].id) {
    let user = rows[0];
    // Get balances
    user.balances = {};
    let balances_rows = await db.query(`select * from userBalances where userId = ?`, [user.id]);
    if (balances_rows && balances_rows.length && balances_rows[0].userId === user.id) {
      balances_rows.map(({ userId, currency, amount }) => {
        user.balances[currency] = amount;
      });


    }
    // Load avatars
    if (user.avatarUUID) {

      let avatars = await db.query(`select avatars.* from avatars where UUID = ?`, [user.avatarUUID]);

      if (avatars) {
        user.avatar = {
          sizes: {}
        };
        avatars.map((e) => {
          user.avatar.sizes[e.size] = e.url;
          user.avatar.UUID = e.UUID;
        })
      }

    }
    return user;

  }
  return undefined;
}
const getLastAvatarUpdate = async (userId) => {
  let result = await db.query(`select avatarLastUpdated from users where id = ? limit 1`, [userId]);

  return result[0].avatarLastUpdated;
}
const getUserIdByAuthToken = async (authenticationToken) => {
  let rows = await db.query(`select id from users where authentication_token = ? limit 1`, [authenticationToken]);
  //let rows = await db.query(`select id from users where authentication_token = ? limit 1`, [authenticationToken]);
  return rows && rows.length ? rows[0].id : undefined;
}

const getBotUsernamesList = async () => {
  return await db.query(`select username from users where isBot = 1`);
}


const getRandomBot = async () => {
  return await db.query(`select * from users where isBot = 1 order by RAND() limit 1`)[0];
}
const getBots = async () => {
  return await db.query(`select * from users where isBot = 1 order by RAND()`);
}

const getAuthenticationToken = async (email, password) => {
  let rows = await db.query(`select authentication_token from users where email = ? and password = ? limit 1`, [email, password]);
  if (rows && rows.length && rows[0]['authentication_token']) {
    return rows[0]['authentication_token'];
  }
  return undefined;
}

const emailExists = (email) => {

  let result = db.query(`select 1 from users where email = ? limit 1`, [email]);
  if (result) {
    delete result.password; // remove password
    result.isAuthenticated = true;
  }

  return result;
}

/**
 * Dangerous
 */
const getAllUsers = async () => {
  return await db.query('select * from users');

}

/**
 * 
 * @param {string} UUID 
 * @returns {User?}
 */
const getUserByUUID = async (UUID) => {
  let rows = await db.query(`select id, username from users where UUID = ? limit 1`, [UUID]);
  return rows && rows.length ? new User(rows[0]) : null;
}


const getUserBrief = async (userUUID) => {
  let results = await db.query(
    `select users.username, 
      avatars.url as avatarUrl,
      users.UUID as userUUID
      from users 
      left join avatars on users.avatarUUID = avatars.UUID and avatars.size = 64
      where users.UUID = ? 
      limit 1`, [userUUID]
  );
  if (results && results.length) {
    return results[0]
  }
  return null;
}

const getForAutocomplete = async (query) => {
  return await db.query(`select 
  users.username, 
  avatars.url as avatarUrl,
  users.UUID as userUUID,
  users.level
  from users 
  left join avatars on users.avatarUUID = avatars.UUID and avatars.size = 32
      where users.username like CONCAT('%',?,'%') 
  limit 10`,[query]);
}

module.exports = { uniqueId, emailExists, getByAuthenticationToken, registerSession, createUser, getAuthenticationToken, getBotUsernamesList, getRandomBot, getBots, updateAvatar, getUserIdByAuthToken, setAvatar, getLastAvatarUpdate, getAllUsers, getUserBrief, getUserByUUID, getIdByAuthenticationToken, getForAutocomplete };