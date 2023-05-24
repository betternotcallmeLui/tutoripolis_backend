import express from 'express';
import { check } from 'express-validator';

import { signup, login, otpVerification, resetPassword, resendOtp, resetOtpVerification, newPassword } from '../controllers/auth.controller.js';
import { googleLogin, googleSignUp } from '../controllers/googleAuth.controller.js';
import Auth from '../Authentication/is-auth.js';
import User from '../model/user.model.js';

const router = express.Router();

router.post('/signup', [
    check('email')
        .isEmail()
        .withMessage('Por favor ingresa un correo válido')
        .custom(async (value, { req }) => {
            const user = await User.findOne({ email: value });
            if (user) {
                return Promise.reject('El correo ya existe.');
            }
        }),

    check('password')
        .trim()
        .isLength({ min: 5 }),

    check('name')
        .trim()
        .not()
        .isEmpty()

], signup);

router.post('/login', [
    check('email')
        .isEmail()
        .withMessage('Por favor ingresa un correo válido')
        .custom(async (value, { req }) => {
            const user = await User.findOne({ email: value });
            if (!user) {
                return Promise.reject('No hay ninguna cuenta con este correo');
            }
        })
], login);

router.post('/signup/otp', otpVerification);
router.post('/signup/resetOtp', resetPassword);
router.post('/signup/otp-resend', resendOtp);
router.post('/signup/checkOtp', resetOtpVerification);
router.post('/signup/reset-password', newPassword);

router.post("/google_login", googleLogin);
router.post("/google_signup", googleSignUp);

router.post("/auth/token/", Auth.GetnewAccessToken);

export default router;
