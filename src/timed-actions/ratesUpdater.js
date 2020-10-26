const Coinpayments = require("../interfaces/coinpayments");
const Constants = require("../constants/TimedActions");
const ratesActions = require("../actions/rates");
const ratesStore = require("../store/rates");
const { setRates } = require("../actions/rates");
const RatesDbo = require("../dbo/rates");

const start = () => {
    let isFirstRun = true;
    async function _start() {
        try {
            // Get rates from Coinpayments API
            const rates = await Coinpayments.getRates();
            if (rates)
                ratesActions.setRates(rates);
        }
        catch (e) {
            if (isFirstRun) {
                ratesActions.setRates(RatesDbo.getRates(), true)
            }
            console.log("[ERROR] ratesUpdater.js");
        }
    }

    _start();
    isFirstRun = false;
    setInterval(_start, Constants.FETCH_RATES_DELAY_MS);
}
module.exports = { start }