import jwt from 'jsonwebtoken';
import * as api_key from '../config/config';

export const authentication = (req, res, next) => {
    const access_token = req.headers['authorization'];

    if (!access_token) {
        const error = new Error("No estás autenticado");
        error.statusCode = 401;
        return res.status(401).json({ message: "No estás autenticado" });
    }

    const access = access_token.split(' ')[1];
    let payload;

    try {
        payload = jwt.verify(access, api_key.accessToken);
    } catch (err) {
        err.statusCode = 401;
        throw err;
    }

    if (!payload) {
        const error = new Error("No estás autenticado");
        error.statusCode = 401;
        return res.status(401).json({ message: "No estás autenticado" });
    }

    res.userID = payload['username'];
    next();
};

export const GetnewAccessToken = (req, res) => {
    const refresh_token = req.body.refresh_token;

    if (!refresh_token) {
        const error = new Error("No estás autenticado");
        error.statusCode = 401;
        return res.status(401).json({ message: "No estás autenticado" });
    }

    jwt.verify(refresh_token, api_key.refereshToken, (err, decoded) => {
        if (err) {
            const error = new Error("No estás autenticado");
            error.statusCode = 401;
            return res.status(401).json({ message: "No estás autenticado" });
        } else {
            const access_token = jwt.sign({ email: decoded['email'] }, api_key.accessToken, {
                algorithm: "HS256",
                expiresIn: api_key.accessTokenLife
            });

            const referesh_token = jwt.sign({ email: decoded['email'] }, api_key.refereshToken, {
                algorithm: "HS256",
                expiresIn: api_key.refereshTokenLife
            });

            return res.status(200).json({
                message: "Token creado con éxito.",
                access_token: access_token,
                refresh_token: referesh_token
            });
        }
    });
};
