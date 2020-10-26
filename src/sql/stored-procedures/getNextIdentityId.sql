use casino;
drop PROCEDURE if exists `getNextIdentityId`;
CREATE PROCEDURE `getNextIdentityId`(
    in _searchTable varchar(255),
    out _autoIncrement bigint 
)
BEGIN
    SELECT AUTO_INCREMENT
    INTO _autoIncrement
    FROM  INFORMATION_SCHEMA.TABLES
    WHERE TABLE_NAME = _searchTable
    LIMIT 1;
END;
