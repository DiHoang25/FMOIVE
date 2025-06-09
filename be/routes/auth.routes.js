const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login success
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: User registration
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *               full_name:
 *                 type: string
 *               dob:
 *                 type: string
 *               gender:
 *                 type: string
 *               email:
 *                 type: string
 *               identity_card:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               address:
 *                 type: string     
 *     responses:
 *       201:
 *         description: User registered
 *       400:
 *         description: Username exists or bad input
 */
router.post('/register', authController.register);

module.exports = router;
