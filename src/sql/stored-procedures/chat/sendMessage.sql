-- Return values
-- [n]  = Bet placed, betId returned
-- [varchar]  = Error
use casino;
drop PROCEDURE if exists `sendMessageToChatroom`;
CREATE PROCEDURE `sendMessageToChatroom`(
  in _userId bigint,
  in _chatRoomUUID varchar(36),
  in _messageText text,
  out _insertedMessageUUID varchar(36),
  out error varchar(155)
)
currentFunction:BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT "ERR_UNKNOWN" INTO error;
    END;
    START TRANSACTION;
    -- Check whether the userId is a participant of the chat
    SET @chatRoomType = 'PRIVATE';
    SET @chatRoomId = 0;

    SELECT cR.type, cR.chatRoomId INTO @chatRoomType, @chatRoomId FROM chatRooms cR WHERE cR.UUID = _chatRoomUUID LIMIT 1;
    IF @chatRoomId IS NULL OR @chatRoomId = 0 OR (@chatRoomType != 'PUBLIC' AND NOT EXISTS(SELECT 1 from chatRoomParticipants cRP where cRP.userId = _userId and cRP.chatRoomId = @chatRoomId LIMIT 1) )THEN
        SELECT "ERR_NO_ACCESS_TO_CONVERSATION" INTO error;
        ROLLBACK;
        leave currentFunction;
    END IF;
    
    -- LEFT JOIN chatRooms cR on cRP.chatRoomId = cR.chatRoomId
    -- WHERE cR.UUID = _chatRoomUUID AND cRP.userId = _userId;
    
    SET @willInsertChatMessageUUID = UUID();
    INSERT INTO chatMessages (userId, messageText, `timestamp`, chatRoomId, UUID) 
    VALUES(_userId, _messageText, UNIX_TIMESTAMP(), @chatRoomId, @willInsertChatMessageUUID);
    IF NOT EXISTS (SELECT 1 FROM chatMessages WHERE UUID = @willInsertChatMessageUUID) THEN
        ROLLBACK;
        SELECT "ERR_UNKNOWN" INTO error;
        leave currentFunction;
    END IF;
    SELECT @willInsertChatMessageUUID INTO _insertedMessageUUID;
    COMMIT;
END;
