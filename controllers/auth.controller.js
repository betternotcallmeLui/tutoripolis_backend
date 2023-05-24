import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import nodemailer from 'nodemailer';
import sendgridTransport from 'nodemailer-sendgrid-transport';
import User from '../model/user.model.js';
import Otp from '../model/otp.model.js';
import * as api_key from '../config/config.js';

const transporter = nodemailer.createTransport(
    sendgridTransport({
        auth: {
            api_key: api_key.Sendgrid,
        },
    })
);

export const signup = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        let otp = null;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validación fallida');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({
            email: email,
            password: hashedPassword,
            isverified: false,
            name: name,
            resetVerified: false,
        });
        await newUser.save();

        otp = Math.floor(100000 + Math.random() * 900000);
        const newOtp = new Otp({
            otp: otp,
            email: email,
        });
        await newOtp.save();

        await transporter.sendMail({
            to: email,
            from: 'notlui69@outlook.es',
            subject: 'Verificación OTP',
            html: `
        <img src="https://i.imgur.com/uXsAFnF.png"  />
        <p style="font-size:50px">Verificación</p>
        <p style="font-size:25px ">El equipo de batutorias te da la bienvenida a la plataforma</p>
        <p style="font-size:25px">Este es tu código de verificación: ${otp}</p>
      `,
        });

        res.status(201).json({ message: 'OTP enviado a tu correo' });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        res.status(error.statusCode).json({ message: error.message, data: error.data });
    }
};

export const otpVerification = async (req, res, next) => {
    try {
        const { otp, email } = req.body;

        const user = await Otp.findOne({ email: email });
        if (!user) {
            const error = new Error('Validación fallida, este usuario no existe.');
            error.statusCode = 403;
            error.data = {
                value: otp,
                message: 'Invalid email',
                param: 'otp',
                location: 'otpVerification',
            };
            throw error;
        }

        if (user.otp !== otp) {
            const error = new Error('El OTP es erróneo');
            error.statusCode = 401;
            error.data = {
                value: otp,
                message: 'Otp incorrect',
                param: 'otp',
                location: 'otp',
            };
            throw error;
        }

        const matchedUser = await User.findOne({ email: email });
        matchedUser.isverified = true;
        const access_token = jwt.sign({ email: email, userId: matchedUser._id }, api_key.accessToken, {
            algorithm: 'HS256',
            expiresIn: api_key.accessTokenLife,
        });
        const referesh_token = jwt.sign({ email: email }, api_key.refereshToken, {
            algorithm: 'HS256',
            expiresIn: api_key.refreshTokenLife,
        });

        matchedUser.refreshToken = referesh_token;
        await matchedUser.save();

        await Otp.deleteOne({ email: email });

        res.status(200).json({ message: 'Usuario verificado', access_token, referesh_token });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

export const resendOtp = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error('Validación fallida, este usuario no existe.');
            error.statusCode = 403;
            error.data = {
                message: 'Invalid email',
                param: 'email',
                location: 'resendOtp',
            };
            throw error;
        }

        let otp = Math.floor(100000 + Math.random() * 900000);
        const newOtp = new Otp({
            otp: otp,
            email: email,
        });
        await newOtp.save();

        await transporter.sendMail({
            to: email,
            from: 'notlui69@outlook.es',
            subject: 'Verificación OTP',
            html: `
                <img src="https://i.imgur.com/uXsAFnF.png"  />
                <p style="font-size:50px">Verificación</p>
                <p style="font-size:25px ">El equipo de batutorias te da la bienvenida a la plataforma</p>
                <p style="font-size:25px">Este es tu código de verificación: ${otp}</p>
            `,
        });

        res.status(200).json({ message: 'OTP reenviado' });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const error = new Error('Validación fallida');
            error.statusCode = 422;
            error.data = errors.array();
            console.log(error, error[0]);
            res.status(422).json({ message: "No existe un usuario con este correo." });
            throw error;
        }

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(401).json({ message: "Las contraseñas no coinciden" });
        }

        if (!user.isverified) {
            console.log("El usuario no está verificado");
            const otp = Math.floor(100000 + Math.random() * 900000);
            console.log("otp =", otp);
            let otpRecord = await Otp.findOne({ email: email });

            if (!otpRecord) {
                const newOtp = new Otp({
                    otp: otp,
                    email: email
                });
                await newOtp.save();
            } else {
                otpRecord.otp = otp;
                await otpRecord.save();
            }

            transporter.sendMail({
                to: email,
                from: "notlui69@outlook.es",
                subject: "Verificación OTP",
                html: `
            <img src="https://i.imgur.com/uXsAFnF.png"  />
            <p style="font-size:50px">Verificación</p>
            <p style="font-size:25px">El equipo de batutorias te da la bienvenida a la plataforma</p>
            <p style="font-size:25px">Este es tu código de verificación: ${otp}</p>
          `
            });

            console.log("Correo enviado ", otp);

            return res.status(422).json({
                message: "No te has verificado con un OTP, se ha reenviado un correo con un nuevo OTP.",
                redirect: true
            });
        }

        const matchPass = await bcrypt.compare(password, user.password);

        if (matchPass) {
            const access_token = jwt.sign({ email: email }, accessToken, {
                algorithm: "HS256",
                expiresIn: accessTokenLife
            });
            const referesh_token = jwt.sign({ email: email }, refreshToken, {
                algorithm: "HS256",
                expiresIn: refreshTokenLife
            });

            return res.status(201).json({
                message: "Usuario loggeado",
                access_token: access_token,
                referesh_token: referesh_token,
                username: user.name,
                userId: user._id
            });
        } else {
            return res.status(401).json({ message: "Las contraseñas no coinciden" });
        }
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const email = req.body.email;
        console.log(email);
        const otp = Math.floor(100000 + Math.random() * 900000);
        const user = await User.findOne({ email: email });

        if (!user) {
            const error = new Error("Validación fallida");
            error.statusCode = 401;
            res.status(401).json({ message: "El usuario no existe" });
            error.data = {
                value: email,
                message: " El OTP es incorrecto"
            };
            res.status(422).json({ message: " El usuario no existe" });
            throw error;
        } else {
            const newOtp = new Otp({
                otp: otp,
                email: email
            });

            await newOtp.save();
            transporter.sendMail({
                to: email,
                from: "notlui69@outlook.es",
                subject: "Cambia tu contraseña en Batutorías",
                html: `
            <img src="https://i.imgur.com/uXsAFnF.png"  />
            <p style="font-size:50px">Recuperación de contraseña</p>
            <p style="font-size:25px">Restablece tu contraseña con el siguiente código: ${otp}</p>
          `
            });

            console.log("Correo enviado  ", otp);
            res.status(201).json({ message: "OTP para cambiar contraseña" });
        }
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

export const resetOtpVerification = async (req, res, next) => {
    try {
        const email = req.body.email;
        const otp = req.body.otp;
        console.log("Cambiar:", otp);
        const otpUser = await Otp.findOne({ email: email });

        if (!otpUser) {
            const error = new Error("Validación fallida");
            error.statusCode = 401;
            res.status(401).json({ message: "El OTP es incorrecto" });
            error.data = {
                value: email,
                message: " OTP incorrecto"
            };
            res.status(422).json({ message: " El OTP es incorrecto o ha expirado" });
            throw error;
        }

        if (otpUser.otp == otp) {
            const matched = await User.findOne({ email: email });
            matched.resetVerified = true;
            await matched.save();
            res.status(201).json({ message: "Correo verificado", email: email });
        } else {
            res.status(402).json({ message: "OTP incorrecto", email: email });
        }
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

export const newPassword = async (req, res, next) => {
    try {
        const email = req.body.email;
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;
        let resetUser;
        const user = await User.findOne({ email: email });

        if (!user) {
            const error = new Error("El usuario con este correo no existe.");
            error.statusCode = 401;
            res.status(401).json({ message: "El usuario con este correo no existe." });
            error.data = {
                value: email,
                message: "El usuario con este correo no existe."
            };
            res.status(422).json({ message: " El usuario no exixte" });
            throw error;
        }

        if (user.resetVerified) {
            resetUser = user;
            resetUser.resetVerified = false;
            const hashedPassword = await bcrypt.hash(newPassword, 12);
            resetUser.password = hashedPassword;
            await resetUser.save();
            console.log("result", result);
            res.status(201).json({ message: "La contraseña se cambió exitosamente" });
        } else {
            console.log("Por favor, verifica tu correo primero.");
            res.status(401).json({ message: "Por favor, verifica tu correo primero." });
        }
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};
