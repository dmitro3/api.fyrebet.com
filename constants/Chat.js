const Langs = require("./Langs");
const keyMirror = require('keymirror')
const MIN_CHAT_DELAY = 60;
const ROOM_NAME = "/chat";
const MAX_HISTORY = 25;
const CHAT_HISTORY_LOAD_CHUNKS = 25;
const Types = keyMirror({
    PUBLIC: null,
    GAME: null,
    PRIVATE: null,
});

const DefaultRooms = Object.keys(Langs);


module.exports = { MIN_CHAT_DELAY, ROOM_NAME, MAX_HISTORY, Types, DefaultRooms, CHAT_HISTORY_LOAD_CHUNKS };