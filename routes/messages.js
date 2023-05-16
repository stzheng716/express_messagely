"use strict";

const Router = require("express").Router;
const Message = require("../models/message");
const { UnauthorizedError } = require("../expressError");
const router = new Router();
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", authenticateJWT, ensureLoggedIn, async function (req, res, next) {
  const currentUser = res.locals.user;
  const id = req.params.id;
  const message = await Message.get(id);
  const viableUsers = [message.from_user.username, message.to_user.username];

  if (!(currentUser in viableUsers)) {
    throw new UnauthorizedError(`${currentUser} not authorized to see this message`);
  }

  return res.json({message});
})


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", authenticateJWT, ensureLoggedIn, async function (req, res, next) {
  const currentUser = res.locals.user;
  const { to_username, body } = req.body;
  const message = await Message.create(currentUser, to_username, body);

  return res.json({message});
})


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", authenticateJWT, ensureLoggedIn, async function (req, res, next) {
  const currentUser = res.locals.user;
  const messageId = req.params.id;
  const viewMessage = await Message.get(messageId);

  if (viewMessage.to_user !== currentUser) {
    throw new UnauthorizedError(`${currentUser} not authorized to see this message`);
  }

  const message = await Message.markRead(messageId);

  return res.json({message});
})


module.exports = router;