-- Return values
-- [n]  = Bet placed, betId returned
-- [varchar]  = Error
use casino;
drop PROCEDURE if exists `updateAvatar`;
CREATE PROCEDURE `updateAvatar`(
  in _userId bigint,
  in _assetPath varchar(125),
  in _avatarUpdateDelay int,
  out error varchar(100)
)
currentFunction:BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SELECT "ERR_UNKNOWN" INTO error;
    END;
    SET @ERR_WAIT_BEFORE_UPDATING_AVATAR = "ERR_WAIT_BEFORE_UPDATING_AVATAR";
    -- Check when was the last time he updated his avatar
    SET @lastUpdated = 0;
    SELECT avatarLastUpdated into @lastUpdated from users where id = _userId;
    IF @lastUpdated IS NOT NULL AND unix_timestamp() - @lastUpdated < _avatarUpdateDelay THEN
        SELECT @ERR_WAIT_BEFORE_UPDATING_AVATAR INTO error;
        LEAVE currentFunction;
    END IF;

    UPDATE users set avatarLastUpdated = unix_timestamp(), avatarPath = _assetPath where id = _userId;
END;