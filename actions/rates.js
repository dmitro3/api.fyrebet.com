
const RatesDbo = require("../dbo/rates");
const dispatcher = require("../dispatcher")
const DispatcherEvents = require("../constants/DispatcherEvents")


const setRates = async (rates, skipDbo) => {

    // Save to DB
    !skipDbo && await RatesDbo.saveRates(rates);

    // Dispatch event - store will save new rates
    dispatcher.dispatch({
        event: DispatcherEvents.RATES_UPDATED,
        data: { rates }
    });


}

module.exports = { setRates };