
const RatesDbo = require("../dbo/rates");
const dispatcher = require("../dispatcher")
const ActionTypes = require("../constants/ActionTypes")


const setRates = async (rates, skipDbo) => {

    // Save to DB
    !skipDbo && await RatesDbo.saveRates(rates);

    // Dispatch event - store will save new rates
    dispatcher.dispatch({
        actionType: ActionTypes.RATES_UPDATED,
        data: { rates }
    });


}

module.exports = { setRates };