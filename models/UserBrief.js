const BaseModel = require('./BaseModel')
class UserSocialBrief extends BaseModel{
    /**
     * @type {string}
     */
    username;
    /**
     * Links of avatars indexed by different sizes (32,64,128)
     * @type {Object.<number,string>}
     */
    avatars;
    /**
     * @type {string}
     */
    lastMessageText;
    /**
     * @type {number}
     */
    lastMessageTimestamp;
    /**
     * @type {number}
     */
    unreadMessagesCount;
}

module.exports = UserSocialBrief;