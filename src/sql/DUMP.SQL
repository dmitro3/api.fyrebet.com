select 
cR.UUID as chatRoomUUID,
otherPartyAvatar.url as avatarUrl,
count(cM.messageId) as missedMessages
from chatRoomParticipants cRP
left join chatRooms cR on cRP.chatRoomId = cR.chatRoomId
left join chatMessages cM on cR.chatRoomId = cM.chatRoomId and cM.timestamp > cRP.lastOpenTimestamp
left join chatRoomParticipants secondaryCRP on cRP.chatRoomId = secondaryCRP.chatRoomId and cR.type = 'PRIVATE' and secondaryCRP.userId != cRP.userId
left join users otherPartyUser on secondaryCRP.userId = otherPartyUser.id 
left join avatars otherPartyAvatar on otherPartyUser.avatarUUID = otherPartyAvatar.UUID and size = 32
where cRP.userId = 80
group by chatRoomUUID, avatarUrl