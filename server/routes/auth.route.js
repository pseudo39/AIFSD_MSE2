const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Student = require('../models/student.model');

const router = express.Router();

router.post('/register', async (req, res) => {
	const { name, email, password } = req.body;

	try {
		const existingStudent = await Student.findOne({ email });

		if (existingStudent) {
			return res.status(400).json({ message: 'Email already registered' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const student = new Student({
			name,
			email,
			password: hashedPassword,
		});

		await student.save();

		return res.status(201).json({ message: 'Student registered successfully' });
	} catch (error) {
		return res.status(500).json({ message: 'Server error', error: error.message });
	}
});

router.post('/login', async (req, res) => {
	const { email, password } = req.body;

	try {
		const student = await Student.findOne({ email });

		if (!student) {
			return res.status(400).json({ message: 'Invalid email or password' });
		}

		const isMatch = await bcrypt.compare(password, student.password);

		if (!isMatch) {
			return res.status(400).json({ message: 'Invalid email or password' });
		}

		const token = jwt.sign(
			{
				id: student._id,
				email: student.email,
			},
			process.env.JWT_SECRET,
			{ expiresIn: '1d' }
		);

		return res.json({
			token,
			student: {
				id: student._id,
				name: student.name,
				email: student.email,
			},
		});
	} catch (error) {
		return res.status(500).json({ message: 'Server error', error: error.message });
	}
});

module.exports = router;
