import { stripePayment as stripePaymentKey } from '../config/config';
import stripe from 'stripe';
import Course from '../model/courses';

const stripePaymentK = stripe(stripePaymentKey);

export const stripeCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const course = await Course.findById(courseId);
        res.status(200).json({ course: course });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error occurred" });
    }
};

export const stripePayment = async (req, res) => {
    try {
        const { amount, id } = req.body;
        console.log(amount, id);
        const paymentIntent = await stripePaymentK.paymentIntents.create({
            amount: amount,
            currency: "inr",
            description: "Tutoripolis, en desarrollo",
            payment_method: id,
            confirm: true,
        });
        console.log(paymentIntent);
        res.status(200).json({
            message: "Pago correcto",
            success: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Pago fallido",
            success: false,
        });
    }
};
