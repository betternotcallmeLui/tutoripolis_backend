import path from 'path';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

import redis from 'redis';
import mongoose from 'mongoose';

import express from 'express';
import bodyParser from 'body-parser';

import socketio from 'socket.io';

import config from './config/config';

import authRoutes from './routes/auth';
import teacherRoutes from './routes/teacher';
import homeRoutes from './routes/homepage';
import courseRoutes from './routes/coursepage';
import stripeRoute from './routes/stripe';

const { mongo, redisHost, redisPort, redisPassword } = config;

const MONGODB_URI = mongo;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const client = redis.createClient({
    host: redisHost,
    port: redisPort,
    password: redisPassword
});

io.on('connect', (socket) => {
    socket.on('join', ({ UserName, room, userId }, callback) => {
        console.log(UserName, room, userId);
        let newUser = false;
        let users = [{ id: [], names: [] }];

        if (client.exists(room)) {
            client.lrange(room, 0, -1, (err, result) => {
                if (err) {
                    callback(err);
                } else {
                    console.log("lrange result join=", result);
                    const History = [];

                    result.forEach(user => {
                        user = JSON.parse(user);
                        History.push(user);

                        if (!users[0].id.includes(user.userId)) {
                            users[0].id.push(user.userId);
                            users[0].names.push(user.UserName);
                            console.log("user added to list");
                        }
                    });

                    console.log(users);

                    if (!users[0].id.includes(userId)) {
                        newUser = true;
                        console.log("userUser");
                        users[0].id.push(userId);
                        users[0].names.push(UserName);
                    }

                    socket.emit('history', { History: History, users: users[0].names });
                    socket.join(room);
                    io.to(room).emit('admin', {
                        users: users[0].names,
                        UserName: 'admin',
                        newUser: newUser,
                        Message: newUser ? `Bienvenido al chat ${UserName}!` : `Bienvenido al chat ${UserName}!`
                    });
                    socket.broadcast.to(room).emit('admin', {
                        users: users,
                        UserName: `${UserName}`,
                        users: users[0].names,
                        newUser: newUser,
                        Message: `!${UserName} se ha unido!`
                    });
                    newUser = false;
                }
            });
        } else {
            client.hset(room, null, (err, result) => {
                if (err)
                    callback(err);
                else {
                    console.log("setting redis hset:", result);
                }
            });
        }

        callback();
    });

    socket.on('sendMessage', ({ UserName, userId, room, message }, callback) => {
        const user = { "UserName": UserName, "Message": message, "userId": userId };

        if (client.exists(room)) {
            client.rpush(room, JSON.stringify(user), (err, result) => {
                if (err)
                    callback(err);
                else {
                    console.log("rpush::", result);
                }
            });
        } else {
            client.hset(room, JSON.stringify(user), (err, result) => {
                if (err)
                    callback(err);
                else {
                    console.log("hset::", result);
                }
            });
        }

        client.lrange(room, 0, -1, (err, result) => {
            console.log("redis result=", result);
            if (err) {
                console.log(err);
            }
        });

        console.log(`${room} mensaje enviado por ${UserName} es:`, message);
        io.to(room).emit('Received_message', { UserName: UserName, Message: message });
        callback();
    });

    socket.on('disconnect', () => {
        console.log('disconnected');
    });
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/videos', express.static(path.join(__dirname, 'videos')));
app.use('/Files', express.static(path.join(__dirname, 'Files')));

app.use(cors());

app.set('port', process.env.PORT || 8080);

app.use(authRoutes);
app.use(teacherRoutes);
app.use(homeRoutes);
app.use(courseRoutes);
app.use(stripeRoute);

if (process.env.NODE_ENV !== 'test') {
    mongoose
        .connect(MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
        .then(() => {
            server.listen(app.get('port'));
            console.log("Servidor iniciado");
        })
        .catch(err => {
            console.log(err);
        });
}

export default app;
