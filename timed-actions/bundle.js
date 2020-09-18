const ratesUpdater = require("./ratesUpdater");

const startAll = () => {
    ratesUpdater.start();
}


module.exports = { startAll };