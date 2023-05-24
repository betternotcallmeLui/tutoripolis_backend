import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        required: true,
    },
    resetVerified: {
        type: Boolean,
        required: false,
    },
    courses: [
        {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Course',
        },
    ],
    preferences: [String],
    bookmark: [
        {
            type: Schema.Types.ObjectId,
            required: false,
            ref: 'Course',
        },
    ],
});

const User = mongoose.model('User', userSchema);

export default User;
