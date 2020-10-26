-- Return values
-- [n]  = Bet placed, betId returned
-- [varchar]  = Error
use casino;
drop PROCEDURE if exists `createRound`;
CREATE PROCEDURE `createRound`(
  out error varchar(100)
)
currentFunction:BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN

        SELECT "ERR_UNKNOWN" INTO error;
    END;
    SET @UUID = UUID();
    -- Make sure previous round is Drawn

    set @lastRoundId = null;
    set @lastRoundIsDrawn = null;
    
    select sha2(unix_timestamp(),'asdds','256')
    (SELECT roundId, isDrawn 
    into @lastRoundId, @lastRoundIsDrawn 
    FROM jackpotRouletteRounds 
    order by roundId desc limit 1 );

    IF @lastRoundId IS NOT NULL AND @lastRoundIsDrawn != 1 THEN
        -- Previous round has not been drawn and it's a real issue;
        SELECT "ERR_UNDRAWN_ROUND" INTO error;
        leave currentFunction;
    END IF;
    -- Fill with the last round
    
    @nextRoundId = @lastRoundId + 1;

    @nextRoundSecret = select sha2( concat('-!21xzBALcal01LeStalWarCal-1' , unix_timestamp(), '912idaskozxiawiw19', @nextRoundId ),'256')

    @hashedSecret = sha2(@nextRoundSecret, 256);

    INSERT INTO jackpotRouletteRounds (UUID,createdTimestamp,drawTimestamp,`secret`,hashedSecret, roll, isDrawn)
    values(@UUID,unix_timestamp(), null, null, @secret, @hashedSecret, null, false)

    -- Check when was the last time he updated his avatar
    SET @lastUpdated = 0;
    SELECT avatarLastUpdated into @lastUpdated from users where id = _userId;
    IF @lastUpdated IS NOT NULL AND unix_timestamp() - @lastUpdated < _avatarUpdateDelay THEN
        SELECT @ERR_WAIT_BEFORE_UPDATING_AVATAR INTO error;
        LEAVE currentFunction;
    END IF;

    UPDATE users set avatarLastUpdated = unix_timestamp(), avatarPath = _assetPath where id = _userId;
END; 48 57 = 120