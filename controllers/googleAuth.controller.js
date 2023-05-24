import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/user';
import { OAuth2Client } from 'google-auth-library';
import { googleAuth, accessToken, accessTokenLife, refreshToken, refreshTokenLife } from '../config/config';

const client = new OAuth2Client(googleAuth);

export const googleSignUp = async (req, res) => {
    try {
        const { tokenId } = req.body;
        const response = await client.verifyIdToken({ idToken: tokenId, audience: googleAuth });
        const { email, email_verified, name } = response.payload;
        console.log(response.payload);
        if (!email_verified) {
            const error = new Error("Inicio de sesión fallido");
            error.statusCode = 403;
            res.status(403).json({ message: "no verificado" });
            throw error;
        } else if (email_verified) {
            const user = await User.findOne({ email: email });
            if (!user) {
                const hashedPassword = await bcrypt.hash(Math.random(100), 12);
                const newUser = new User({
                    email: email,
                    password: hashedPassword,
                    isverified: true,
                    name: name,
                    resetVerified: false,
                });
                await newUser.save();
                res.status(201).json({ message: "La cuenta ha sido creada" });
            } else {
                res.status(201).json({ message: "Este usuario ya tiene una cuenta", username: user.name, userId: user._id });
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Un error ha ocurrido." });
    }
};

export const googleLogin = async (req, res) => {
    try {
        const { tokenId } = req.body;
        const response = await client.verifyIdToken({ idToken: tokenId, audience: googleAuth });
        const { email, email_verified, name } = response.payload;
        console.log(response.payload);
        if (!email_verified) {
            const error = new Error("Inicio de sesión fallido");
            error.statusCode = 403;
            res.status(403).json({ message: "No verificado." });
            throw error;
        } else if (email_verified) {
            const user = await User.findOne({ email: email });
            if (!user) {
                res.status(404).json({ message: "La cuenta de este usuario no existe.", username: user.name, userId: user._id });
            } else {
                const access_token = jwt.sign({ email: email }, accessToken, {
                    algorithm: "HS256",
                    expiresIn: accessTokenLife,
                });

                const referesh_token = jwt.sign({ email: email }, refreshToken, {
                    algorithm: "HS256",
                    expiresIn: refreshTokenLife,
                });

                res.status(201).json({
                    message: "Usuario iniciado",
                    access_token: access_token,
                    referesh_token: referesh_token,
                    username: user.name,
                    userId: user._id,
                });
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Un error ha ocurrido." });
    }
};
