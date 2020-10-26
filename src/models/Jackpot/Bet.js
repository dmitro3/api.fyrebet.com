
const Bet = require( "../Bet");


/**
 * @typedef { Object } _JackpotRouletteBetObject
 * @property {string} roundUUID
 *
 * @typedef {import("../Bet").BetObject & _JackpotRouletteBetObject} JackpotRouletteBetObject
 */

class JackpotRouletteBet extends Bet {
  /**
   * @type {string}
   */
  roundUUID;

  /**
   * @param {JackpotRouletteBetObject} obj
   */
  constructor(obj) {
    super(obj);
  }
}


module.exports = JackpotRouletteBet