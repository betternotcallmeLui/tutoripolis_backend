import { Router } from 'express';
import { authentication } from '../Authentication/is-auth';
import { CoursePage, Bookmark, ShowBookmark, unbookmark, rating, pdf } from '../controllers/coursepage';

const router = Router();

router.get('/course/:courseName/:courseId', authentication, CoursePage);
router.post('/home/:courseId/:courseName', authentication, Bookmark);
router.get('/users/:userName/:userId', authentication, ShowBookmark);
router.post('/unbookmark', authentication, unbookmark);
router.put('/rating', authentication, rating);
router.get('/pdf/download/:courseId', pdf);

export default router;
