create table chatRooms(
  `chatRoomId` bigint not null primary key AUTO_INCREMENT,
  `UUID` varchar(36) not null, -- UUID is what users always see,
  `type` varchar(25) not null, -- Chat type "constants/Chat". If PUBLIC, everyone is a participant and can see it.
  `niceName` varchar(25) not null,
  `iconAssetUrl` text,
);

create table chatRoomsParticipants(
    `chatRoomId` bigint not null,
    `userId` bigint not null
);


