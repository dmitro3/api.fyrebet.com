-- Return values
-- [n]  = Bet placed, betId returned
-- [varchar]  = Error
use casino;
drop PROCEDURE if exists `userRegister`;
CREATE PROCEDURE `userRegister`(
  in _email varchar(125),
  in _password varchar(32),
  in _authentication_token varchar(255),
  in _username varchar(18),
  in _isBot tinyint(1),
  out _userId bigint,
  out error varchar(100)
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
    SET @USER_UUID = UUID();
    START TRANSACTION;
    -- Close bets
    
    INSERT INTO users(`email`,`password`,`authentication_token`,`username`,`created`,`isBot`,`uuid`)
    VALUES (_email,_password,_authentication_token,_username,unix_timestamp(),_isBot,@USER_UUID);

    SET @userId = 0;
    (select id into @userId from users where uuid = @USER_UUID);
    IF @userId is null or @userId = 0  THEN
        SELECT @UNKNOWN_ERROR INTO error;
        ROLLBACK;
        LEAVE currentFunction;
    END IF;

    INSERT INTO userBalances (`userId`, `currency`, `amount`) VALUES (@userId,'BTC',0);
    INSERT INTO userBalances (`userId`, `currency`, `amount`) VALUES (@userId,'ETH',0);
    INSERT INTO userBalances (`userId`, `currency`, `amount`) VALUES (@userId,'LTC',0);
    INSERT INTO userBalances (`userId`, `currency`, `amount`) VALUES (@userId,'BCH',0);
    INSERT INTO userBalances (`userId`, `currency`, `amount`) VALUES (@userId,'XRP',0);
    INSERT INTO userBalances (`userId`, `currency`, `amount`) VALUES (@userId,'DOGE',0);
    -- Create BALANCES
    SELECT @userId into _userId;
    -- Done
    COMMIT;
END;