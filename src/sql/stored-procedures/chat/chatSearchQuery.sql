-- Return values
-- [n]  = Bet placed, betId returned
-- [varchar]  = Error
use casino;
drop PROCEDURE if exists `chatSearchQuery`;
CREATE PROCEDURE `chatSearchQuery`(
  in _userId bigint,
  in _query varchar(50),
  in _skip int,
  in _limit int,
  out _error varchar(155)
)
currentFunction:BEGIN
        SELECT 
            u.username, 
            avatars.url as iconUrl,
            cM.messageText as lastMessageText,
            cM.timestamp as lastMessageTimestmap,
            (select COUNT(cMX.messageId) 
            from chatMessages cMX 
                where cMX.chatRoomId = cRP.chatRoomId
                    and cMX.userId != cRP.userId
                    and cMX.timestamp > cRP.lastOpenTimestamp) as unreadMessages
        FROM users u
        LEFT JOIN avatars on u.avatarUUID = avatars.UUID and size = 32 
        LEFT JOIN chatRoomParticipants cRP on  u.id  = cRP.userId  -- We got the chats the user is within
        -- SELECT LAST MESSAGE FROM THE CHAT
        LEFT JOIN chatMessages cM on cRP.chatRoomId = cM.chatRoomId and
            cM.messageId = (SELECT MAX(messageId) from chatMessages where chatRoomId = cM.chatRoomId limit 1)
        where u.username like CONCAT('%',_query,'%')
        limit _skip, _limit;
    -- FIRST THINGS FIRST, SELECT USER'S CHATROOM
END;
