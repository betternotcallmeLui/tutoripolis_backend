import { Router } from 'express';
import { allCourses, fetchCourses, getPreferences, preferenceCourses } from '../controllers/homepage.controller.js';
import { authentication } from '../Authentication/is-auth.js';

const router = Router();

router.get('/home/allCourses', allCourses);
router.get('/home/:course', fetchCourses);
router.post('/home/interests/', authentication, getPreferences);
router.post('/home/:course', authentication, preferenceCourses);

export default router;
