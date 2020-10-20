// Equal chances duel

// Users must join with a bet of the same ratio as others



class EqualChancesDuel{
    constructor({
        isPublic, // boolean
        parties, // Usually one party only when this is public
        maxParties, // Maximum n. of parties allowed to join
        betAmount, // In US Dollars
        timeToBet=  600000, // 10 minutes to make a bet or kicked out
    }){
        this.isPublic = isPublic;
        this.parties = parties;
        this.maxParties = maxParties;
        this.betAmount = betAmount;
        this.timeToBet = 600000;
    }

}