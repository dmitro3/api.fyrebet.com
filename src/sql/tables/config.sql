create table if not exists `config`(
    PUBLIC_CHAT_DEFAULT_COOLDOWN_MS int not null default 10000, 
    LEVEL_XP_REQUIRED_MULTIPLIER int not null default 250,
    XP_TO_USD_RATIO int not null default 10
)