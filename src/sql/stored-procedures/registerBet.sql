-- Return values
-- [n]  = Bet placed, betId returned
-- [varchar]  = Error
use casino;
drop PROCEDURE if exists `registerBet`;
CREATE PROCEDURE `registerBet`(
  in _userId bigint,
  in _betAmount decimal(18,8),
  in _betAmountUsd decimal(16,2),
  in _currency varchar(6),
  in _game varchar(25),
  in _betUUID varchar(36),
  in _avoidTransaction tinyint(1), -- Usually it's true as this is called from another stored proc
  out _betId bigint,
  out error varchar(155)
)
currentFunction:BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        IF _avoidTransaction IS NULL OR _avoidTransaction != 1 THEN
            ROLLBACK;
        END IF;
        SELECT "ERR_UNKNOWN" INTO error;
    END;
    
    SET @UNKNOWN_ERROR = "ERR_UNKNOWN";
    SET @INSUFFICIENT_BALANCE = "ERR_INSUFFICIENT_BALANCE"; 
    SET @INVALID_CURRENCY = "ERR_INVALID_CURRENCY";
    SET @ROUND_INEXISTENT = "ERR_ROUND_INEXISTENT";

    IF _avoidTransaction IS NULL OR _avoidTransaction != 1 THEN
        START TRANSACTION;
    END IF;
    SET @isBot = 0;

    IF _betUUID IS NULL THEN
        SELECT UUID() INTO _betUUID;
    END IF;
    (SELECT isBot into @isBot from users where id = @userId);
    IF @isBot = 1 THEN
        SET @availableBalance = (SELECT amount from userBalances where userId = _userId and currency = _currency);
        -- Currency must exist
        IF @availableBalance IS NULL THEN
            SELECT @INVALID_CURRENCY INTO error;
            IF _avoidTransaction IS NULL OR _avoidTransaction != 1 THEN
                ROLLBACK;
            END IF;
            LEAVE currentFunction;
        END IF;
        -- User needs to have balance in the selected currency
        IF @availableBalance < _betAmount THEN
            SELECT @INSUFFICIENT_BALANCE INTO error;
            IF _avoidTransaction IS NULL OR _avoidTransaction != 1 THEN
                ROLLBACK;
            END IF;
            LEAVE currentFunction;
        END IF;
    END IF;
    INSERT INTO `bets` (`userId`, `currency`, `amount`, `usdAmount`,`game`, `UUID` )
    VALUES (_userId,_currency,_betAmount, _betAmountUsd,_game,_betUUID );
    -- Retrieve inserted bet or throw error
    SET @betId = 0;
    (select betId into @betId from bets where UUID = _betUUID);
    IF @betId = 0 THEN
        SELECT 'NOBETID' INTO error;
        IF _avoidTransaction IS NULL OR _avoidTransaction != 1 THEN
            ROLLBACK;
        END IF;
        LEAVE currentFunction;
    END IF;
    -- Update balances
    UPDATE userBalances set amount = amount - _betAmount where currency = _currency and userId = _userId;
    -- Done
    SELECT @betId INTO _betId;
    IF _avoidTransaction IS NULL OR _avoidTransaction != 1 THEN
        COMMIT;
    END IF;
    LEAVE currentFunction;
END;