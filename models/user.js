"use strict";

/** User of the site. */

const { NotFoundError, UnauthorizedError } = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config")

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users (username,
                             password,
                             first_name,
                             last_name,
                             phone,
                             join_at)
         VALUES
           ($1, $2, $3, $4, $5, current_timestamp)
         RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]);

    return result.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password
          FROM users
          WHERE username = $1`,
      [username]);

    const user = result.rows[0]

    return await bcrypt.compare(password, user.password)
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    await db.query(
      `UPDATE users
          SET last_login_at = current_timestamp
          WHERE username = $1`,
      [username]);
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username,
         first_name,
         last_name
        FROM users`);
    return result.rows;
  }


  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username,
              first_name,
              last_name,
              phone,
              join_at,
              last_login_at
          FROM users
          WHERE username = $1`,
      [username]);

    if (!result.rows[0]) {
      throw new NotFoundError(`${username} cannot be found`)
    }

    return result.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}, ...]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(usr) {
    const messageResult = await db.query(
      `SELECT id,
              body,
              sent_at,
              read_at
          FROM messages
          WHERE from_username = $1`,
      [usr]);

    const messages = messageResult.rows;
    const { username, first_name, last_name, phone } = await User.get(usr);
    const basicUser = { username, first_name, last_name, phone };

    for (let message of messages) {
      message.to_user = basicUser;
    }

    return messages;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(usr) {
    const messageResult = await db.query(
      `SELECT id,
              body,
              sent_at,
              read_at
          FROM messages
          WHERE to_username = $1`,
      [usr]);

    const messages = messageResult.rows;
    const { username, first_name, last_name, phone } = await User.get(usr);
    const basicUser = { username, first_name, last_name, phone };

    for (let message of messages) {
      message.from_user = basicUser;
    }

    return messages;
  }
}


module.exports = User;
