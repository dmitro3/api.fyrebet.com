
const BaseModel = require("./BaseModel");

/**
 * When user loads history of his chats, each single available chat would be represented by this model
 */
class ChatHistoryThread extends BaseModel{
    /**
     * @type {string}
     */
    lastMessageText;
    /**
     * @type {string}
     */
    chatRoomUUID;
    /**
     * @type {string}
     */
    iconUrl;
    /**
     * @type {string}
     */
    chatName;
    
  /**
   * @type {number}
   */
  unreadMessages;
    
}


module.exports = ChatHistoryThread;