"use strict";

/** User of the site. */

const { NotFoundError, UnauthorizedError, BadRequestError } = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config")

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users (username,
                             password,
                             first_name,
                             last_name,
                             phone,
                             join_at,
                             last_login_at)
         VALUES
           ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
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
    //TODO: 1. username DNE 2. wrong password

    const user = result.rows[0]

    return user && await bcrypt.compare(password, user.password) === true;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
   const result = await db.query(
      `UPDATE users
          SET last_login_at = current_timestamp
          WHERE username = $1
        RETURNING username`,
      [username]);

    if (!result.rows[0]) {
      throw new NotFoundError(`${username} not found`)
    }
  }

  //TODO: UPDATE / DELETE: test for username existing (throw Errors in DNE)

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username,
         first_name,
         last_name
        FROM users
        ORDER BY username`);
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
    const result = await db.query(
      `SELECT m.id,
              m.body,
              m.to_username,
              m.sent_at,
              m.read_at,
              u.username,
              u.first_name,
              u.last_name,
              u.phone
          FROM messages AS m
          JOIN users AS u
            ON m.to_username = u.username
          WHERE m.from_username = $1`,
      [usr]);

    const messages = result.rows;
    const formattedMessages = messages.map(msg => {
      return {
        id: msg.id,
        to_user: {
          username: msg.username,
          first_name: msg.first_name,
          last_name: msg.last_name,
          phone: msg.phone
        },
        body: msg.body,
        sent_at: msg.sent_at,
        read_at: msg.read_at
      }
    });

    return formattedMessages;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(usr) {
    const result = await db.query(
      `SELECT m.id,
              m.body,
              m.from_username,
              m.sent_at,
              m.read_at,
              u.username,
              u.first_name,
              u.last_name,
              u.phone
          FROM messages AS m
          JOIN users AS u
            ON m.from_username = u.username
          WHERE m.to_username = $1`,
      [usr]);

    const messages = result.rows;
    const formattedMessages = messages.map(msg => {
      return {
        id: msg.id,
        from_user: {
          username: msg.username,
          first_name: msg.first_name,
          last_name: msg.last_name,
          phone: msg.phone
        },
        body: msg.body,
        sent_at: msg.sent_at,
        read_at: msg.read_at
      }
    });

    return formattedMessages;
  }
}


module.exports = User;
