-- Return values
-- [n]  = Bet placed, betId returned
-- [varchar]  = Error
use casino;
drop PROCEDURE if exists `getPrivateChatroom`;
CREATE PROCEDURE `getPrivateChatroom`(
  in userUUIDx varchar(36),
  in userUUIDy varchar(36),
  out _chatRoomUUID varchar(36),
  out _wasCreated tinyint(1),
  out error varchar(155)
)
currentFunction:BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT "ERR_UNKNOWN" INTO error;
    END;
    START TRANSACTION;

    -- Requesting user ID
    SET @userIDx = NULL;
    SET @userIDy = NULL;
    SELECT id INTO @userIDx FROM users where UUID = userUUIDx LIMIT 1;
    SELECT id INTO @userIDy FROM users where UUID = userUUIDy LIMIT 1;
    IF @userIDx is NULL or @userIDy is null THEN
        ROLLBACK;
        SELECT "ERR_NO_ACCESS_TO_CONVERSATION" into error;
        leave currentFunction;
    END IF;
    SELECT cR.UUID into _chatRoomUUID 
    FROM chatRoomParticipants cRP
    LEFT JOIN chatRooms cR on cRP.chatRoomId = cR.chatRoomId 
    WHERE (cRP.userId = @userIDx or cRP.userId = @userIDy ) and cR.type = 'PRIVATE'
    GROUP BY cRP.chatRoomId
    HAVING count(cRP.userId) = 2;
    IF _chatRoomUUID IS NULL THEN
        
        SET @willCreateChatRoomWithUUID = UUID();
        SET @createdChatRoomId = 0;
        INSERT INTO chatRooms (UUID, `type`) VALUES (@willCreateChatRoomWithUUID, 'PRIVATE');
        SELECT chatRooms.chatRoomId INTO @createdChatRoomId FROM chatRooms WHERE chatRooms.UUID = @willCreateChatRoomWithUUID;
        IF @createdChatRoomId IS NULL or @createdChatRoomId = 0 THEN
            ROLLBACK;
            SELECT "ERR_UNKNOWN" into error;
            leave currentFunction;
        END IF;
        INSERT INTO chatRoomParticipants (chatRoomId, userId) VALUES
        (@createdChatRoomId,@userIDy),
        (@createdChatRoomId,@userIDx);
        SELECT @willCreateChatRoomWithUUID INTO _chatRoomUUID; 
        SELECT 1 INTO _wasCreated;
    ELSE 
        SELECT 0 INTO _wasCreated;
    END IF;
    COMMIT;
END;
