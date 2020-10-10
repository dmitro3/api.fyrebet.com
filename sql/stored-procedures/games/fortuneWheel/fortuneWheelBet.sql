-- Return values
-- [n]  = Bet placed, betId returned
-- [varchar]  = Error
use casino;
drop PROCEDURE if exists `fortuneWheelBet`;
CREATE PROCEDURE `fortuneWheelBet`(
  in _roundId bigint,
  in _userId bigint,
  in _betAmount decimal(18,8),
  in _currency varchar(6),
  in _multiplier int,
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
    SET @isBot = 0;
    (SELECT isBot into @isBot from users where id = @userId);
    IF @isBot = 1 THEN
        SET @availableBalance = (SELECT amount from userBalances where userId = _userId and currency = _currency);
        -- Currency must exist
        IF @availableBalance IS NULL THEN
            SELECT @INVALID_CURRENCY INTO error;
            ROLLBACK;
            LEAVE currentFunction;
        END IF;
        -- User needs to have balance in the selected currency
        IF @availableBalance < _betAmount THEN
            SELECT @INSUFFICIENT_BALANCE INTO error;
            ROLLBACK;
            LEAVE currentFunction;
        END IF;
    END IF;
    -- Check if bets are closed or open
    set @isDrawn = 0;
    set @roundDrawTimestamp = 0;
    (SELECT isDrawn, drawTimestamp into @isDrawn, @roundDrawTimestamp from fortuneWheelRounds where roundId = _roundId);
    IF @isDrawn = 1 or unix_timestamp() >= @roundDrawTimestamp THEN
        SELECT @BETS_CLOSED INTO error;
        ROLLBACK;
        LEAVE currentFunction;
    END IF;
    -- Register the bet
    INSERT INTO `fortuneWheelBets` (`roundId`, `userId`, `currency`, `amount`, `multiplier`,`reference`) 
    VALUES (_roundId,_userId,_currency,_betAmount,_multiplier,@BET_GUID);
    -- Retrieve inserted bet or throw error
    SET @betId = 0;
    (select betId into @betId from fortuneWheelBets where reference = @BET_GUID);
    IF @betId = 0 THEN
        SELECT @UNKNOWN_ERROR INTO error;
        ROLLBACK;
        LEAVE currentFunction;
    END IF;
    -- Update balances
    UPDATE userBalances set amount = amount - _betAmount where currency = _currency and userId = _userId;
    -- Done
    SELECT @betId INTO _betId;
    COMMIT;
    LEAVE currentFunction;
END;



select users.*,
'+'+GROUP_CONCAT(CONCAT('{size:"', avatars.size, '", url:"',avatars.url,'"}')) list 
avatars as avatarPath 
from users left join 
avatars on users.avatarId = avatars.avatarId where users.authentication_token = ? 
limit 1