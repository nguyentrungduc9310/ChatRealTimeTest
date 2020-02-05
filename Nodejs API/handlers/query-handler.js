'user strict';
const DB = require('../config/db');

class QueryHandler {

  constructor(app){
    this.db = DB;
  }

  async userNameCheck (username){
    return await this.db.query(`SELECT count(username) as count FROM users WHERE LOWER(username) = ?`, `${username}`);
  }

  async registerUser(params){
    try {
      return await this.db.query("INSERT INTO users (`username`,`password`,`online`) VALUES (?,?,?)", [params['username'],params['password'],'Y']);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async loginUser(params){
    try {
      return await this.db.query(`SELECT id FROM users WHERE LOWER(username) = ? AND password = ?`, [params.username,params.password]);
    } catch (error) {
      return null;
    }
  }

  async getUserInfo(params){
    debugger
    try {
      const result = await this.db.query(`SELECT * FROM users WHERE id = ? AND online = 'Y'`, [params.userId]);
      return params.socketId ? result[0]['socketId'] : result;
    } catch (error) {
      return null;
    }
  }

  async getUserByUsername(username){
    try {
      return await this.db.query(`SELECT * FROM users WHERE LOWER(username) = ?`, `${username}`);
    } catch (error) {
      return null;
    }
  }

  async userSessionCheck(param){
    try {
      const result = await this.db.query(`SELECT * FROM users WHERE id = ? AND online = 'Y'`, `${param.userId}`);
      if(result !== null){
        return result[0]['username'];
      }else{
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  async addSocketId(prams){
    try {
      return await this.db.query(`UPDATE users SET socketId = ?, online= ? WHERE id = ?`, [prams.socketId,'Y',prams.userId]);
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async makeUserOnline(userId){
    try {
      return await this.db.query(`UPDATE users SET online= ? WHERE id = ?`, ['Y',userId]);
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async isUserLoggedOut(userSocketId){
    try {
      return await this.db.query(`SELECT online FROM users WHERE socketId = ?`, [userSocketId]);
    } catch (error) {
      return null;
    }
  }

  async logoutUser(userId){
    try {
      return await this.db.query(`UPDATE users SET socketId = ?, online= ? WHERE id = ?`, ['','N',userId]);
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  getChatList(userId, userSocketId){
    console.log(userId, userSocketId);
    try {
      return Promise.all([
        this.db.query(`SELECT id,online,username FROM users WHERE id = ?`, [userId]),
        this.db.query(`SELECT id,online,username FROM users WHERE online = ? and socketId != ?`, ['Y',userSocketId])
      ]).then( (response) => {
        return response[1];
        // return {
        //   userinfo : response[0].length > 0 ? response[0][0] : response[0],
        //   chatlist : response[1]
        // };
      }).catch( (error) => {
        console.warn(error);
        return (null);
      });
    } catch (error) {
      console.warn(error);
      return null;
    }
  }

  async insertMessages(params){
    try {
      return await this.db.query(
        "INSERT INTO messages (`fromUserId`,`toUserId`,`message`) values (?,?,?)",
        [params.fromUserId, params.toUserId, params.message]
      );
    } catch (error) {
      console.warn(error);
      return null;
    }
  }

  async getMessages(param){
    try {
      return await this.db.query(
        "SELECT id,fromUserId as fromUserId,toUserId as toUserId,message FROM messages WHERE (fromUserId = ? AND toUserId = ? ) OR (fromUserId = ? AND toUserId = ? )	ORDER BY id ASC",
        [param.userId, param.toUserId, param.toUserId, param.userId]
      );
    } catch (error) {
      console.warn(error);
      return null;
    }
  }
}
module.exports = new QueryHandler();
