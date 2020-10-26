-- Return values
-- [n]  = Bet placed, betId returned
-- [varchar]  = Error
use casino;
drop PROCEDURE if exists `getChatsHistory`;
CREATE PROCEDURE `getChatsHistory`(
  in userId bigint,
  in userLangShortCode varchar(5),
  in _skip int,
  in _limit int,
  out error varchar(155)
)
currentFunction:BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SELECT "ERR_UNKNOWN" INTO error;
    END;
    select 
        cR.UUID as chatRoomUUID,
        cR.type as chatRoomType,
        CASE cR.type
            WHEN 'PRIVATE' THEN otherPartyAvatar.url
            ELSE cR.iconUrl
        END as iconUrl,
        (select COUNT(cM.messageId) 
            from chatMessages cM 
                where cM.chatRoomId = cR.chatRoomId 
                    and cM.userId != cRP.userId
                    and cM.timestamp > cRP.lastOpenTimestamp) as unreadMessages ,
        lastMessage.messageText as lastMessageText,
        lastMessage.timestamp as lastMessageTimestamp,
        CASE cR.type 
            WHEN 'PUBLIC' THEN "Global"
            WHEN 'PRIVATE' THEN otherPartyUser.username
            ELSE ''
        END as chatName
        from chatRooms cR
        left join chatRoomParticipants cRP on cR.chatRoomId = cRP.chatRoomId
        left join chatRoomParticipants secondaryCRP on cRP.chatRoomId = secondaryCRP.chatRoomId and cR.type = 'PRIVATE' and secondaryCRP.userId != cRP.userId
        left join users otherPartyUser on secondaryCRP.userId = otherPartyUser.id 
        left join avatars otherPartyAvatar on otherPartyUser.avatarUUID = otherPartyAvatar.UUID and otherPartyAvatar.size = 32
        left join chatMessages lastMessage on cR.chatRoomId = lastMessage.chatRoomId and lastMessage.messageId = (select MAX(messageId) from chatMessages tmpCM where tmpCM.chatRoomId = cR.chatRoomId limit 1)
        where cRP.userId = userId or (cR.type = 'PUBLIC' and cR.UUID = userLangShortCode)
        order by lastMessageTimestamp desc
    limit _skip, _limit;
END;
