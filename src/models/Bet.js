const  { CurrencyCode } = require ("../constants/Currencies");
const BaseModel = require ("./BaseModel");
const UserSocialBrief = require("./UserBrief") ;
const {getValueInUSD} = require("../helpers/rates")
/**
 * @typedef {Object} BetObject
 * @property {string} betUUID
 * @property {CurrencyCode} currencyCode
 * @property {number} amount
 * @property {number} amountUsd
 * @property {UserSocialBrief} user
 */

class Bet extends BaseModel {
  /**
   * @type {string}
   */
  betUUID;
  /**
   * @type {CurrencyCode}
   */
  currencyCode;
  /**
   * @type {number}
   */
  amount;
  /**
   * @type {number}
   */
  amountUsd;
  /**
   * @type {UserSocialBrief}
   */
  user;
  /**
   *
   * @param {BetObject} obj
   */
  constructor(obj) {
    super(obj);
  }


  getUsdAmount(){
    return getValueInUSD({amount, currency: this.currencyCode})
  }
}
module.exports = Bet;