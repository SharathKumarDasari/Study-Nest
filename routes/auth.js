const express = require('express');
const router = express.Router();
const connectDB = require('../dbConnect');
const { createUser, findUser } = require('../models/User');
const bcrypt = require('bcryptjs');

// Middleware to check if the user is an admin
async function isAdmin(req, res, next) {
    const { adminUsername, adminPassword } = req.body;
    const collection = await connectDB();
    const admin = await findUser(collection, adminUsername);

    if (!admin || admin.role !== 'admin') {
        return res.status(403).send('Access denied');
    }

    const isMatch = await bcrypt.compare(adminPassword, admin.password);
    if (!isMatch) {
        return res.status(403).send('Access denied');
    }

    next();
}

router.post('/register', isAdmin, async (req, res) => {
    const { rollno, password, role } = req.body;
    const collection = await connectDB();
    const existingUser = await findUser(collection, rollno);

    if (existingUser) {
        return res.status(400).send('User already exists');
    }

    await createUser(collection, rollno, password, role);
    res.status(201).send('User registered successfully');
});

router.post('/login', async (req, res) => {
    const { rollno, password } = req.body;
    const collection = await connectDB();
    const user = await findUser(collection, rollno);

    if (!user) {
        return res.status(400).send('Invalid roll number or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).send('Invalid roll number or password');
    }

    const redirectUrl = user.role === 'teacher' ? '../lecturer/home.html' : '../student/home.html';
    res.send({ message: `Welcome, ${user.role}!`, redirect: redirectUrl });
});

module.exports = router;
