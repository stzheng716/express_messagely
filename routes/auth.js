"use strict";

const Router = require("express").Router;
const router = new Router();

const jwt = require("jsonwebtoken")
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config")
const { UnauthorizedError, BadRequestError } = require("../expressError");
const User = require("../models/user")

/** POST /login: {username, password} => {token} */

router.post("/login", async function (req, res) {
    if (req.body.username === undefined || req.body.password === undefined) {
        throw new BadRequestError()};
    const { username, password } = req.body;
    if (await User.authenticate(username, password)) {
        User.updateLoginTimestamp(username);
        const token = jwt.sign({ username }, SECRET_KEY);
        return res.json({ token });
    }

    throw new UnauthorizedError("Invalid user/password");
})

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register", async function (req, res) {
    if (req.body === undefined) throw new BadRequestError();

    await User.register(req.body);
    const { username, password } = req.body;

    if (await User.authenticate(username, password)) {
        User.updateLoginTimestamp(username);
        const token = jwt.sign({ username }, SECRET_KEY);
        return res.json({ token });
    }

    throw new UnauthorizedError("Invalid user/password");
})


module.exports = router;