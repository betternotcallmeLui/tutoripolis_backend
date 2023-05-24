import { Router } from 'express';
import multer from 'multer';

import {
    uploadCourse,
    uploadVideo,
    teacherHome,
    deleteCourse,
    editCourse,
    updateCourse,
    watchedByUsers
} from '../controllers/teacher';
import { authentication } from '../Authentication/is-auth';

const router = Router();

const ImagefileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toDateString() + '-' + file.originalname);
    }
});

const ImagefileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
        console.log('tipo de archivo incorrecto');
    }
};

const VideofileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'videos');
    },
    filename: (req, file, cb) => {
        const currentDate = new Date();
        cb(null, currentDate.toDateString() + '-' + file.originalname);
    }
});

const VideofileFilter = (req, file, cb) => {
    if (file.mimetype === 'video/mp4') {
        cb(null, true);
    } else {
        cb(null, false);
        console.log('tipo de archivo incorrecto');
    }
};

const imageMulter = multer({ storage: ImagefileStorage, fileFilter: ImagefileFilter }).single('image');
const videoMulter = multer({ storage: VideofileStorage, fileFilter: VideofileFilter }).any();

router.post('/creator/create-course', imageMulter, uploadCourse);
router.post('/creator/videoUpload/:courseID', videoMulter, uploadVideo);
router.post('/creater/homepage', authentication, teacherHome);
router.post('/course/delete', authentication, deleteCourse);
router.post('/course/edit', authentication, editCourse);
router.put('/course/Update', imageMulter, updateCourse);
router.post('/watchedByuser', watchedByUsers);

export default router;
