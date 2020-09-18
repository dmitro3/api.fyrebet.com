
const { db, escape } = require('../db');

const getRates = async () => {
    return await db.query('select * from rates');
}

const saveRates = async (rates) => {
    console.log('>>>Dbo: Saving rates');
    const insertValuesString = [...Array(rates.length).keys()].map(() => {
        return ("(?,?,?)");
    }).join(", ");

    await db.query(`insert into rates (shortCode, usdValue, lastUpdate) values ${insertValuesString} on duplicate key update shortCode = VALUES(shortCode), usdValue = VALUES(usdValue), lastUpdate = VALUES(lastUpdate)`, [].concat.apply([], rates.map((rate) => {
        return Object.values(rate);
    })));


}


module.exports = { getRates, saveRates };