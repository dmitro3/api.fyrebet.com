create table if not exists `duels`(
    duelId bigint not null primary key auto_increment,
    duelUUID varchar(36) not null,
    createdTimestamp int not null,
    duelStartConditionType varchar(55), -- For example when max parties reached, or when bets value contain 
    duelStartConditionValue varchar(255) null,
    maxParties int not null default 0, -- If 0, countless parties can join.
    duelType int,
)
