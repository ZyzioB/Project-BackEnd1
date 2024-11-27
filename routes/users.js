import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Users from '../models/users.js';
import Whitelist from '../models/whitelist.js'; 
import { JWT_SECRET } from '../constants.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password, firstName, lastName, age, role } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).send('Required fields missing');
  }

  if (password.length < 3) {
    return res.status(400).send('Password must be at least 3 characters');
  }

  const existingUser = await Users.findOne({ email });
  if (existingUser) {
    return res.status(409).send('User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = new Users({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      age,
      role,
    });

    await newUser.save();
    res.status(201).send(newUser);
  } catch (error) {
    res.status(500).send('Error creating user: ' + error.message);
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email and password required');
  }

  const user = await Users.findOne({ email });
  if (!user) {
    return res.status(404).send('User not found');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).send('Invalid credentials');
  }

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }  
  );

  try {
    await Whitelist.create({ token });

    res.status(200).send({ token });
  } catch (error) {
    res.status(500).send('Error adding token to whitelist: ' + error.message);
  }
});

router.get('/me', async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(400).send('No token provided');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await Users.findById(decoded.id);

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send('Failed to authenticate token');
  }
});

router.patch('/me', async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(400).send('No token provided');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await Users.findById(decoded.id);

    if (!user) {
      return res.status(404).send('User not found');
    }

    const { firstName, lastName, age, email, password, role } = req.body;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.age = age || user.age;
    user.email = email || user.email;
    user.password = password ? await bcrypt.hash(password, 10) : user.password;
    user.role = role || user.role;

    await user.save();
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send('Error updating user: ' + error.message);
  }
});

router.get('/', async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(400).send('No token provided');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await Users.findById(decoded.id);

    if (!user || user.role !== 'admin') {
      return res.status(403).send('Access denied');
    }

    const users = await Users.find();
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send('Failed to authenticate token');
  }
});

router.delete('/:id', async (req, res) => {
  const token = req.headers.authorization;
  const userIdToDelete = req.params.id;

  if (!token) {
    return res.status(400).send('No token provided');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await Users.findById(decoded.id);

    if (!user || (user.id !== userIdToDelete && user.role !== 'admin')) {
      return res.status(403).send('You are not allowed to delete this user');
    }

    await Users.findByIdAndDelete(userIdToDelete);
    res.status(200).send('User deleted');
  } catch (error) {
    res.status(500).send('Error deleting user: ' + error.message);
  }
});

export default router;
