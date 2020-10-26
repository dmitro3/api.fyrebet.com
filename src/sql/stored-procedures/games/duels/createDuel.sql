-- Return values
-- [n]  = Bet placed, betId returned
-- [varchar]  = Error
use casino;
drop PROCEDURE if exists `createDuel`;
CREATE PROCEDURE `createDuel`(
  in _challengerUserId bigint,
  in _challengedUserUUID bigint,
  in _duelStartConditionType varchar(55),
  in _duelStartConditionValue varchar(255),
  in _maxParties int,
  in _duelType varchar(50),
  out _createdDuelUUID varchar(36),
  out error varchar(155)
)
currentFunction:BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT "ERR_UNKNOWN" INTO error;
    END;
    START TRANSACTION;
    SET @CHALLENGER_BLOCKED = "ERR_UNKNOWN";
    SET @WILL_CREATE_DUEL_UUID = UUID();
    IF @betId = 0 THEN
        SELECT @UNKNOWN_ERROR INTO error;
        ROLLBACK;
        LEAVE currentFunction;
    END IF;


    -- Make sure the challenged user party exists
    SELECT id INTO @challengedUserId FROM users WHERE UUID = _challengedUserUUID LIMIT 1;
    IF @challengedUserId IS NULL THEN
        -- User not found 
        SELECT 'ERR_USER_NOT_FOUND' INTO error;
        ROLLBACK;
        LEAVE currentFunction;
    END IF;

    IF _challengedUserUUID IS NOT NULL THEN
        -- Ensure the parties did not block eachother
        IF EXISTS (SELECT 1 from userBlocks where targetUserId = _challengedUserUUID and blockeeUserId = _challengerUserId LIMIT 1) THEN
            -- The challenger blocked the target. 
            SELECT 'ERR_TARGET_USER_BLOCKED' INTO error;
            ROLLBACK;
            LEAVE currentFunction;
        END IF;
        -- Ensure the parties did not block eachother
        IF EXISTS (SELECT 1 from userBlocks where targetUserId = _challengedUserUUID and blockeeUserId = _challengerUserId LIMIT 1) THEN
            -- The other party has blocked the challenger. 
            SELECT 'ERR_BLOCKED_BY_USER' INTO error;
            ROLLBACK;
            LEAVE currentFunction;
        END IF;
    END IF;
    -- STORE THE DUEL
    INSERT INTO duels (duelUUID, createdTimestamp, duelStartConditionType, duelStartConditionValue, maxParties, duelType)
    VALUES (@WILL_CREATE_DUEL_UUID, unix_timestamp(), _duelStartConditionType, _duelStartConditionValue, _maxParties, _duelType);
    SET @createdDuelId = null;
    IF NOT EXISTS (SELECT @createdDuelId:=duelId FROM duels WHERE duelUUID = @WILL_CREATE_DUEL_UUID LIMIT 1) THEN
        SELECT @UNKNOWN_ERROR INTO error;
        ROLLBACK;
        LEAVE currentFunction;
    END IF;
    -- STORE PARTICIPANTS
    INSERT INTO duelParties 
    VALUES (@createdDuelId,_challengerUserId ),
            (@createdDuelId,@challengedUserId );
    SELECT @WILL_CREATE_DUEL_UUID INTO _createdDuelUUID;
    COMMIT;
END;