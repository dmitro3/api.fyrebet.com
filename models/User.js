
const BaseModel = require("./BaseModel");


class User{
    /**
     * @type {Number}
     */
    id;
    /**
     * @type {string}
     */
    username;
    /**
     * Defaults to size 32
     * @type {string}
     */
    avatarUrl;
    /**
     * @type {string}
     */
    UUID;
    
}


module.exports = User