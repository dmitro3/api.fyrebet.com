const BaseModel = require( "../BaseModel");
const JackpotRouletteBet = require( "./Bet");
const JackpotRouletteDraw = require("./Draw");

const getRoll = require("../../classes/provablyfair");
/**
 * @typedef {Object} JackpotRouletteRoundObject
 * @property {string} roundUUID
 * @property {boolean} isDrawn
 * @property {number} roll
 * @property {number} drawTimestamp
 * @property {number} createdTimestamp
 * @property {string} hashedSecret
 */


class JackpotRouletteRound extends BaseModel {
  /**
   * @type {string}
   */
  roundUUID;
  /**
   * @type {boolean}
   */
  isDrawn;
  /**
   * Redundant variable exposing Draw's roll result.
   * @type {number}
   */
  roll;
  /**
   * @type {number}
   */
  drawTimestamp;
  /**
   * @type {number}
   */
  createdTimestamp;
  /**
   * @type {string}
   */
  hashedSecret;
  /**
   * @type {string}
   */
  secret;
  /**
   * Place bets. Only a stack of last 50 will be kept for performance reasons
   * @type {JackpotRouletteBet[]}
   */
  bets;
  /**
   * @type {number}
   */
  potSize;

  /**
   * 
   * @type {JackpotRouletteDraw} 
   */
  draw;

  /**
   * @param {JackpotRouletteRoundObject} d
   */
  constructor(d) {
    super(d);
    this.potSize = this.potSize || 0;
    if (!Array.isArray(this.bets)) {
      this.bets = [];
    }
  }

  /**
   * @param {JackpotRouletteDraw} draw
   */
  assignDraw(draw) {
    this.roll = draw.roll;
    this.isDrawn = true;
  }

  /**
   * @returns {boolean}
   */
  hasBetsOpen(){
    // For now, we only allow users to bets if the game has not yet drawn
    return !this.isDrawn;
  }

  /**
     * @param {JackpotRouletteBet} bet
     */
  storeBet(bet){
    this.bets.push(bet);
    this.potSize += bet.getUsdAmount();
  }



  /**
   * Creates a fresh Jackpot Roulette Round
   * @returns {JackpotRouletteRound}
   * @param {number} previousRoundId - Will be used as nonce for calculating roll
   */
  static async createNew(previousRoundId){ 
    let now = parseInt(new Date() / 1000)
    // Note: NEVER output the secret to the client BEFORE draw. 
    const secret =  crypto.SHA256('.*' + Date.now().toString() + ".z" + Date.now().toString().split("").reverse().join("") + ".fx").toString(crypto.enc.Hex)

    // Output a HASHED secret instead
    const hashedSecret = hashedSecret = crypto.SHA256(secret).toString(crypto.enc.Hex);

    return new JackpotRouletteRound({
      createdTimestamp: now,
      drawTimestamp: undefined, // Undefined because two players need to enter the jacpot
      isDrawn: false,
      hashedSecret,
      secret,
      draw: null,
      roundUUID: null, // Will be defined by the database.
      roll: getRoll(secret,previousRoundId+1)
    });

    
  }


}

module.exports =JackpotRouletteRound