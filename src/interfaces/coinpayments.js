const Coinpayments = require('coinpayments');

var fs = require("fs");

const credentials = {
    key: fs.readFileSync('/var/apiKeys/coinpayments.public', 'utf8').trim(),
    secret: fs.readFileSync('/var/apiKeys/coinpayments.private', 'utf8').trim()
}




const client = new Coinpayments(credentials)


const getRates = async () => {
    const rates = await client.rates({
        short: 1,
        accepted: 1
    });
    let ret = [];
    const USDBTC = rates['USD']['rate_btc'];
    function getValueInUsd(currencyValue) {
        return parseFloat((1 / USDBTC * currencyValue).toFixed(8));
    }


    for (let shortCode in rates) {
        const rate = rates[shortCode];
        if (rate.accepted) { // We only want to display coins we accept as payments
            ret.push({
                shortCode: shortCode,
                usdValue: getValueInUsd(rate.rate_btc),
                lastUpdate: rate.last_update
            });

        }
    }
    return ret;
}

module.exports = { client, getRates };