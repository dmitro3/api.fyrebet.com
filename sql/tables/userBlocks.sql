create table if not exists `userBlocks`(
    targetUserId bigint not null,
    blockeeUserId bigint null,  -- Has an user requested the block? 
    expirationTimestamp int null -- If null, it's forever lol
);

