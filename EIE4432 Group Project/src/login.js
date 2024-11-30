import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import { validate_user, update_user, fetch_user, username_exist } from './userdb.js';

const route = express.Router();
const form = multer();

// Comment out the in-memory user management code
/*
const users = new Map();

async function update_user(username, password, role) {
  try {
    const user = {
      username: username,
      password: password,
      role: role,
      enabled: true,
    };

    users.set(username, user);

    const userjson = [];
    users.forEach((value) => {
      userjson.push(value);
    });

    await fs.writeFile('users.json', JSON.stringify(userjson));

    return true;
  } catch (error) {
    console.error('Error updating users:', error);
    return false;
  }
}

async function init_userdb() {
  try {
    if (users.size > 0) return;
    const data = await fs.readFile('users.json', 'utf-8');
    const userEntries = JSON.parse(data);
    userEntries.forEach((user) => {
      users.set(user.username, user);
    });
  } catch (error) {
    console.error('Error reading users.json:', error);
  }
}

async function validate_user(username, password) {
  const user = users.get(username);
  if (!user || user.password !== password) return false;
  return user;
}
*/

route.post('/login', form.none(), async (req, res) => {
  req.session.logged = req.session.logged || false;
  if (req.session.logged) req.session.logged = false;

  const { username, password } = req.body;
  const user = await validate_user(username, password);

  if (user) {
    if (!user.enabled) {
      return res.status(401).json({
        status: 'failed',
        message: `User \`${username}\` is currently disabled`,
      });
    }

    req.session.username = user.username;
    req.session.role = user.role;
    req.session.logged = true;
    req.session.timestamp = Date.now();

    return res.json({
      status: 'success',
      user: {
        username: user.username,
        role: user.role,
      },
    });
  } else {
    return res.status(401).json({
      status: 'failed',
      message: 'Incorrect username and password',
    });
  }
});

route.post('/logout', (req, res) => {
  if (req.session.logged) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ status: 'failed', message: 'Logout failed' });
      }
      res.end();
    });
  } else {
    res.status(401).json({
      status: 'failed',
      message: 'Unauthorized',
    });
  }
});

route.get('/me', (req, res) => {
  if (req.session.logged) {
    return res.json({
      status: 'success',
      user: {
        username: req.session.username,
        role: req.session.role,
      },
    });
  } else {
    return res.status(401).json({
      status: 'failed',
      message: 'Unauthorized',
    });
  }
});

route.post('/register', form.none(), async (req, res) => {
  const { username, password, role, enabled } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      status: 'failed',
      message: 'Missing fields',
    });
  }

  if (username.length < 3) {
    return res.status(400).json({
      status: 'failed',
      message: 'Username must be at least 3 characters',
    });
  }

  if (await username_exist(username)) {
    return res.status(400).json({
      status: 'failed',
      message: `Username ${username} already exists`,
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      status: 'failed',
      message: 'Password must be at least 8 characters',
    });
  }

  if (role !== 'admin' && role !== 'user') {
    return res.status(400).json({
      status: 'failed',
      message: 'Role can only be either `admin` or `user`',
    });
  }

  if (await update_user(username, password, role)) {
    return res.json({
      status: 'success',
      user: {
        username: username,
        password: password,
        role: role,
        enabled: enabled,
      },
    });
  } else {
    return res.status(500).json({
      status: 'failed',
      message: 'Account created but unable to save into the database',
    });
  }
});

export default route;
