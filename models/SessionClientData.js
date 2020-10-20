// Data sent from client to server socket on initial handshake


const Langs = require('../constants/Langs');

class ClientData {
    /**
     * @property {String}
     * @type {String}
     */
    language;
    /**
     * @property {Array}
     * @type {Array}
     */
    languages;
    /**
     * @property {String}
     * @type {String}
     */
    userAgent;
    constructor(clientDataRaw) {
        clientDataRaw = typeof clientDataRaw === 'object' ? clientDataRaw : {};
        const { language, languages, userAgent } = clientDataRaw;
        this.language = language;
        this.languages = languages;
        this.userAgent = userAgent;
    }
    isValid() {
        if (typeof this.language !== 'string') {
            this.language = 'EN';
        }

        this.language = this.language in Object.keys(Langs) || 'EN'
        return true;
    }
}

module.exports = ClientData;