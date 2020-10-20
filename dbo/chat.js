
const { db, escape } = require('../db');

const Errors = require('../constants/errors');

const { Validator } = require('node-input-validator'); // Input validation
const ChatConstants = require('../constants/Chat');
const ChatHistoryThread = require("../models/ChatHistoryThread");
const { default: UserSocialBrief } = require('../models/UserBrief');


const getMessages = async (chatRoomUUID, skip = 0, limit = 50) => {

    let arr = await db.query(
        `select
        chatMessages.messageText,
        chatMessages.timestamp,
        chatMessages.messageId,	
            users.username,
            users.UUID as userUUID,
            avatars.url as avatarUrl
        from chatMessages 
            left join users on chatMessages.userId = users.id 
                left join avatars on users.avatarUUID = avatars.UUID and avatars.size = 32
                    left join chatRooms on chatMessages.chatRoomId = chatRooms.chatRoomId
        where chatRooms.UUID = ?
        order by timestamp desc
        limit ?,?`, [chatRoomUUID, skip, limit]);

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
        let difference = lastMessage + ChatConstants.MIN_CHAT_DELAY - currentTime;
        return difference > 0 ? difference : 0;
    }

}



/**
 * @returns {ChatHistoryThread[]}
 */
const getUserChatsHistory = async ({userId, lang = 'EN', skip = 0, limit = ChatConstants.CHAT_HISTORY_LOAD_CHUNKS}) => {
    const queryResults = await db.query(`call getChatsHistory(?,?,?,?,@error); select @error as error;`, [userId,lang, skip, limit]);
    
    for (const queryResult of queryResults){
        if (Array.isArray(queryResult) && queryResult.length) {
            // Get first object and check what is it (error/ chatroom)
            if ('error' in queryResult[0] && queryResult[0].error) {
                throw queryResult[0]['error'];
            }
            if ('chatRoomUUID' in queryResult[0]) {
                return queryResult;
            }
        }
    }
    return [];
}

const getPrivateChatRoom = async (userUUID, targetUserUUID) => {
    // console.log('getPrivateChatRoom', userUUID, targetUserUUID);
    const [_, [{ chatRoomUUID, wasCreated, error }]] = await db.query('call `getPrivateChatroom`(?,?,@chatRoomUUID,@wasCreated,@error); select @chatRoomUUID as chatRoomUUID,@error as error, @wasCreated as wasCreated;', [
        userUUID,
        targetUserUUID,
        ChatConstants.Types.PRIVATE
    ]);
    if (error) {
        throw error;
    }
    console.log(chatRoomUUID)
    return { chatRoomUUID, wasCreated };
}



const sendMessage = async ({ userId, chatRoomUUID, messageText }) => {

    const [_, [{ chatMessageUUID, error }]] = await db.query('call `sendMessageToChatroom`(?,?,?,@res,@err); select @res as chatMessageUUID,@err as error;', [
        userId,
        chatRoomUUID,
        messageText
    ]);

    if (error) {
        console.log('Failed sending message, throwing error');
        throw error;
    }
    return chatMessageUUID;
}


const getPublicRooms = async () => {
    return await db.query(`select UUID from chatRooms where type = ?`, [
        ChatConstants.Types.PUBLIC
    ]);
}




const getChatRoomParties = async (chatRoomUUID) => {
    let results = await db.query(`select u.id 
    from chatRoomParticipants cRP 
    left join users u on cRP.userId = u.id 
    left join chatRooms cR on cRP.chatRoomId = cR.chatRoomId
    where cR.UUID = ?`, [chatRoomUUID]);
    if (Array.isArray(results) && results.length) {
        let ret = [];
        for (let i = 0; i < results.length; i++) {
            results[i] && 'id' in results[i] && ret.push(results[i]['id']);
        }
        return ret;
    }
    return [];
}
const getChatRoom = async ({ chatRoomUUID, requestingUserId }) => {

    const queryResults = await db.query('call `getChatRoom`(?,?,@error); select @error as procError;', [chatRoomUUID, requestingUserId]);

    // Inspect each result
    for (let queryResult of queryResults) {

        if (Array.isArray(queryResult) && queryResult.length) {
            // Get first object and check what is it (error/ chatroom)
            if ('procError' in queryResult[0] && queryResult[0].procError) {
                throw queryResult[0]['procError'];
            }
            if ('chatRoomUUID' in queryResult[0]) {
                const chatRoom = queryResult[0];
                try {

                    chatRoom.participants = JSON.parse(chatRoom.participants);
                }
                catch (e) {
                    // Do nothing

                }
                try {
                    chatRoom.messages = JSON.parse(chatRoom.messages);
                }
                catch (e) {
                    chatRoom.messages = [];
                }
                return chatRoom;
            }
        }
    }
}

const updateLastSeen = async ({ chatRoomUUID, userId }) => {
    console.log('Updating last seen for userID', userId, chatRoomUUID);
    return await db.query(`update chatRoomParticipants cRP 
    left join chatRooms cR on cRP.chatRoomId = cR.chatRoomId
    set cRP.lastOpenTimestamp = unix_timestamp() where cRP.userId = ? and cR.UUID = ?`, [userId, chatRoomUUID]);
}


/**
 * Returns a list of short user briefs, typically when client uses the search functionality.
 * @param {number} userId - The user whom executes the query
 * @param {string} query - The query to find matches
 * @param {number} skip 
 * @param {number} limit 
 * @returns {UserSocialBrief[]}
 */
const chatSearchQuery = async ({userId, query, skip = 0, limit = 10}) => {

    const queryFeedback = await db.query('call `chatSearchQuery`(?,?,?,?,@error); select @error as procError;', [userId, query, skip,limit]);
     // Inspect each result
     for (let queryResultPortion of queryFeedback) {

        if (Array.isArray(queryResultPortion) && queryResultPortion.length) {
            // Get first object and check what is it (error/ chatroom)
            if ('procError' in queryResultPortion[0] && queryResultPortion[0].procError) {
                throw queryResultPortion[0]['procError'];
            }
            if ('username' in queryResultPortion[0]) {
                return queryResultPortion;
            }
        }
    }
    return [];
}
module.exports = { userTimeLeftToChat, insertMessage, getMessages, getPrivateChatRoom, sendMessage, getPublicRooms, getChatRoom, getUserChatsHistory, getChatRoomParties, updateLastSeen, chatSearchQuery };