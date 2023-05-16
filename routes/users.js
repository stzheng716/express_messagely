"use strict";

const Router = require("express").Router;
const User = require("../models/user");
const router = new Router();
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name}, ...]}
 *
 **/
router.get("/", authenticateJWT, ensureLoggedIn, async function (req, res, next) {
  const users = await User.all();

  return res.json({users});
    });

/** GET /:username - get detail of user.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username", authenticateJWT, ensureLoggedIn, ensureCorrectUser, async function (req, res, next) {
  const username = req.query.username;
  const user = await User.get(username);

  return res.json({user});
})


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/to", authenticateJWT, ensureLoggedIn, ensureCorrectUser, async function (req, res, next) {
  const username = req.params.username;
  const messages = await User.messagesTo(username);

  return res.json({messages});
})


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/from", authenticateJWT, ensureLoggedIn, ensureCorrectUser, async function (req, res, next) {
  const username = req.params.username;
  const messages = await User.messagesFrom(username);

  return res.json({messages});
})

module.exports = router;