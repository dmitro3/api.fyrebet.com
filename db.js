const mysql = require("mysql");




class Db {
  constructor() {
    this.dbPool = mysql.createPool({
      host: "localhost",
      user: "root",
      password:
        "u9fayf87asdyfisajdfrke3wqjr98usad98fjuasdopfksdaf+fsaSDIAJSUDa_+dASdas",
      database: "casino",
      insecureAuth: true,
      multipleStatements: true
    })
  }

  query(sql, args) {
    let pool = this.dbPool;
    return new Promise((resolve, reject) => {
      pool.getConnection(function (err, connection) {
        if (err) {
          return reject(err);
        }
        connection.query(sql, args, function (err, result) {
          connection.release();
          if (err) {
            return reject(err);
          }
          return resolve(result);
        });
      });
    });
  }
}

const db = new Db();

const escape = mysql.escape

module.exports = { db, escape };
