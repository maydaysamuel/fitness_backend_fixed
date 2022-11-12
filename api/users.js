const express = require('express');
const usersRouter = express.Router();
const { getUserByUsername, createUser, getPublicRoutinesByUser, getUser, getAllRoutinesByUser } = require('../db');
const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
const { requireUser } = require('./utils');
const { JWT_SECRET = 'neverTell' } = process.env;

// POST /api/users/login
usersRouter.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  // request must have both
  if (!username || !password) {
    next({
      name: 'MissingCredentialsError',
      message: 'Please supply both a username and password'
    });
  }

  try {
    const user = await getUser({username, password});
    if(!user) {
      next({
        name: 'IncorrectCredentialsError',
        message: 'Username or password is incorrect',
      })
    } else {
      const token = jwt.sign({id: user.id, username: user.username}, JWT_SECRET, { expiresIn: '1w' });
      res.send({ user, message: "you're logged in!", token });
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/users/register
usersRouter.post('/register', async (req, res, next) => {
  const { username, password, } = req.body;

  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      next({
        error: `api error`,
        name: 'UserExistsError',
        message: `User ${username} is already taken.`
      });
    }

    if (password.length < 8) {
      next({
        error: `api error`,
        name: 'PasswordLengthError',
        message: 'Password Too Short!'
      })
    }

    const user = await createUser({
      username,
      password,
    });

    const token = jwt.sign({
      id: user.id,
      username
    }, process.env.JWT_SECRET, {
      expiresIn: '1w'
    });

    res.send({
      message: "thank you for signing up",
      token: token,
      user: user
    });
  } catch ({ name, message }) {
    next({ name, message })
  }
});

// GET /api/users/me
usersRouter.get('/me', requireUser, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(error)
  }
})


// GET /api/users/:username/routines
usersRouter.get('/:username/routines', async (req, res, next) => {
  try {
    const {username} = req.params;
    const user = await getUserByUsername(username);
    if(!user) {
      next({
        name: 'NoUser',
        message: `Error looking up user ${username}`
      });
    } else if(req.user && user.id === req.user.id) {
      const routines = await getAllRoutinesByUser({username: username});
      res.send(routines);
    } else {
      const routines = await getPublicRoutinesByUser({username: username});
      res.send(routines);
    }
  } catch (error) {
    next(error)
  }
})
module.exports = usersRouter;