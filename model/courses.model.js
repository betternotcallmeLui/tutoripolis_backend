import mongoose from 'mongoose';

const { Schema } = mongoose;

const courseSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        imageurl: {
            type: String,
            required: false,
        },
        name: {
            type: String,
            required: true,
        },
        willLearn: {
            type: String,
            required: false,
        },
        description: {
            type: String,
            required: true,
        },
        descriptionLong: {
            type: String,
            required: false,
        },
        requirement: {
            type: String,
            required: false,
        },
        price: {
            type: String,
            required: false,
        },
        creator: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        bookmark: [
            {
                type: Schema.Types.ObjectId,
                required: false,
                ref: 'User',
            },
        ],
        videoContent: [
            {
                videoUrl: {
                    type: String,
                    required: false,
                },
                usersWatched: [
                    {
                        type: Schema.Types.ObjectId,
                        required: false,
                        ref: 'User',
                    },
                ],
            },
        ],
        rating: {
            ratingSum: {
                type: Number,
                required: false,
                default: 1,
            },
            timesUpdated: {
                type: Number,
                required: false,
                default: 1,
            },
            ratingFinal: {
                type: Number,
                required: false,
                default: 1,
            },
        },
    },
    { timestamps: true }
);

const Course = mongoose.model('Course', courseSchema);

export default Course;
