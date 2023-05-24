import { Router } from 'express';
import { stripePayment, stripeCourse } from '../controllers/stripe.controller.js';
import { authentication } from '../Authentication/is-auth.js';

const router = Router();

router.post('/stripe/payment', authentication, stripePayment);
router.get('/stripe/:courseId', authentication, stripeCourse);

export default router;
