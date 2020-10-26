-- Return values
-- [n]  = Bet placed, betId returned
-- [varchar]  = Error
use casino;
drop PROCEDURE if exists `registerJackpotRouletteBet`;
CREATE PROCEDURE `registerJackpotRouletteBet`(
  in _roundId bigint,
  in _userId bigint,
  in _betAmount decimal(18,8),
  in _betAmountUsd decimal(16,2),
  in _currency varchar(6),
  out _betId bigint,
  out error varchar(155)
)
currentFunction:BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT "ERR_UNKNOWN" INTO error;
    END;
    SET @UNKNOWN_ERROR = "ERR_UNKNOWN";
    SET @INSUFFICIENT_BALANCE = "ERR_INSUFFICIENT_BALANCE"; 
    SET @BETS_CLOSED = "ERR_BETS_CLOSED";
    SET @INVALID_CURRENCY = "ERR_INVALID_CURRENCY";
    SET @ROUND_INEXISTENT = "ERR_ROUND_INEXISTENT";
    SET @BET_GUID = UUID();


    START TRANSACTION;
    SET @registeredBetId = null;
    SET @err = null;
    CALL `registerBet`(_userId, _betAmount, _betAmountUsd, _currency,'JACKPOT_ROULETTE',@BET_GUID,1,@registeredBetId,@err);
    IF @registeredBetId IS NULL OR NOT @registeredBetId > 0 THEN
        -- Did not register base bet. Throw error
        SELECT @err into error;
        ROLLBACK;
        leave currentFunction;
    END IF;
    -- Base bet registered. Continue by mapping base bet to jackpotroulette bet
    INSERT INTO jackpotRouletteBets values (@registeredBetId, _roundId);
    COMMIT;
END;



