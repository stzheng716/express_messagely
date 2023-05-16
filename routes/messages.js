"use strict";

const Router = require("express").Router;
const Message = require("../models/message");
const { UnauthorizedError, BadRequestError } = require("../expressError");
const router = new Router();
const { ensureLoggedIn } = require("../middleware/auth");
router.use(ensureLoggedIn)

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
router.get("/:id", async function (req, res, next) {
  const currentUser = res.locals.user;
  const id = req.params.id;
  const message = await Message.get(id);
  const viableUsers = [message.from_user.username, message.to_user.username];

  if (!(viableUsers.includes(currentUser.username))) {
    throw new UnauthorizedError(
      `${currentUser.username} not authorized to see this message`
    );
  }

  return res.json({ message });
})


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", async function (req, res, next) {
  const from_username = res.locals.user.username;
  const { to_username, body } = req.body;

  if (!to_username || !body) {
    throw new BadRequestError("to_username and body are required.")
  }
  const message = await Message.create({ from_username, to_username, body });

  return res.json({ message });
})


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", async function (req, res, next) {
  const currentUser = res.locals.user;
  const messageId = req.params.id;
  const viewMessage = await Message.get(messageId);

  if (viewMessage.to_user.username !== currentUser.username) {
    throw new UnauthorizedError(`${currentUser.username} not authorized to see this message`);
  }

  const message = await Message.markRead(messageId);

  return res.json({ message });
})


module.exports = router;