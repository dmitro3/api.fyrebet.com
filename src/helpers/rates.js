

const ratesStore = require("../store/rates");




function getValueInUSD({ currency, amount }) {//
    const rates = ratesStore.getRates();
    const convertedValue =
        undefined === amount ? 0 : rates[currency].usdValue * amount;
    return parseFloat(convertedValue.toFixed(2));
}


module.exports = { getValueInUSD };