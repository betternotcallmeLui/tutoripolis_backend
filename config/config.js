export const Sendgrid = process.env.SENDGRID_KEY;
export const mongo = process.env.MONGO_DATABASE || "mongodb://mongo:guiwl6nuu571YjJCvjm9@containers-us-west-45.railway.app:7258";

export const accessToken = process.env.ACCESS_TOKEN_SECRET;
export const refreshToken = process.env.REFRESH_TOKEN_SECRET;

export const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
export const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE;

export const redisHost = process.env.REDIS_HOST;
export const redisPassword = process.env.REDIS_PASSWORD;
export const redisPort = process.env.REDIS_PORT;

export const googleAuth = process.env.OAuth2Client;

export const stripePayment = process.env.STRIPE_SECRET_TOKEN;