-- Return values
-- [n]  = Bet placed, betId returned
-- [varchar]  = Error
use casino;
drop PROCEDURE if exists `getChatThread`;
CREATE PROCEDURE `getChatThread`(
  in _chatRoomUUID varchar(36),
  in _userId bigint,
  out _error varchar(155)
)
currentFunction:BEGIN
    
    SELECT `type` into @chatRoomType from chatRooms where UUID = _chatRoomUUID;
    IF @chatRoomType IS NULL OR 
    (   (@chatRoomType = 'PRIVATE' OR @chatRoomType = 'GROUP') AND 
        (_userId IS NULL OR NOT EXISTS (SELECT 1 from chatRoomParticipants 
                    left join chatRooms on chatRoomParticipants.chatRoomId = chatRooms.chatRoomId 
                    where chatRoomParticipants.userId = _userId and chatRooms.UUID = _chatRoomUUID LIMIT 1) ) ) THEN
        SELECT "ERR_NO_ACCESS_TO_CONVERSATION" INTO _error;
        leave currentFunction;
    END IF;
    SET SESSION group_concat_max_len = 1000000; -- Build up messages 
    IF @chatRoomType = 'PUBLIC' THEN
        select chatRooms.UUID as chatRoomUUID, chatRooms.type as chatRoomType, chatRooms.iconUrl,
        CONCAT('[', GROUP_CONCAT(JSON_OBJECT('userUUID', u.UUID, 'userId',u.id)) , ']') as participants,
        (SELECT CONCAT('[', GROUP_CONCAT(JSON_OBJECT('messageUUID', cM.UUID, 'messageText',cM.messageText,'userUUID',cMU.UUID,'avatarUrl',avatars.url,'username',cMU.username)) , ']') 
            FROM chatMessages cM 
            left join users cMU on cM.userId = cMU.id 
            left join avatars on cMU.avatarUUID = avatars.UUID and avatars.size = 32
            where cM.chatRoomId = chatRooms.chatRoomId LIMIT 50) as messages
        from chatRooms
        left join chatRoomParticipants cRP on chatRooms.chatRoomId = cRP.chatRoomId
        left join users u on cRP.userID = u.id
        where chatRooms.UUID = _chatRoomUUID
        group by chatRooms.chatRoomId
        limit 1;
    ELSE
        IF @chatRoomType = 'PRIVATE' THEN
            select 
            cR.UUID as chatRoomUUID,
            otherPartyAvatar.url as iconUrl,
            otherPartyUser.username as chatName,
            count(cM.messageId) as missedMessages,
            cR.type as chatRoomType,
            (SELECT CONCAT('[', GROUP_CONCAT(JSON_OBJECT('messageUUID', cM.UUID, 'messageText',cM.messageText,'userUUID',cMU.UUID,'avatarUrl',avatars.url,'username',cMU.username)) , ']')
            FROM chatMessages cM 
            left join users cMU on cM.userId = cMU.id 
            left join avatars on cMU.avatarUUID = avatars.UUID and avatars.size = 32
            where cM.chatRoomId = cRP.chatRoomId LIMIT 50) as messages
            from chatRoomParticipants cRP
            left join chatRooms cR on cRP.chatRoomId = cR.chatRoomId
            left join chatMessages cM on cR.chatRoomId = cM.chatRoomId and cM.timestamp > cRP.lastOpenTimestamp
            left join users otherPartyUser on cRP.userId = otherPartyUser.id 
            left join avatars otherPartyAvatar on otherPartyUser.avatarUUID = otherPartyAvatar.UUID and size = 32
            where cRP.userId != _userId and cR.UUID = _chatRoomUUID
            group by cRP.chatRoomId, chatRoomType, chatRoomUUID, otherPartyAvatar.url, otherPartyUser.username limit 1;
        END IF;
    END IF;
    
END;
