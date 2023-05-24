import mongoose from 'mongoose';

const { Schema } = mongoose;

const securitySchema = new Schema({
    otp: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        expires: '2h',
        default: Date.now,
    },
});

const Otp = mongoose.model('Otp', securitySchema);

export default Otp;
