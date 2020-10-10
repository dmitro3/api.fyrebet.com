-- Return values
-- [n]  = Bet placed, betId returned
-- [varchar]  = Error
use casino;
drop PROCEDURE if exists `fortuneWheelCloseRound`;
CREATE PROCEDURE `fortuneWheelCloseRound`(
  in _roundId bigint
)
currentFunction:BEGIN
    -- Close bets
    UPDATE fortuneWheelRounds rounds
    LEFT JOIN fortuneWheelBets bets
        ON rounds.roundId = bets.roundId AND bets.multiplier = rounds.winningMultiplier
    LEFT JOIN userBalances balances
        ON bets.userId = balances.userId and balances.currency = bets.currency
    SET rounds.isDrawn = 1,
        balances.amount = balances.amount+(bets.amount * rounds.winningMultiplier),
        bets.isWon = 1
    WHERE rounds.roundId = _roundId;
END;