import puppeteer from 'puppeteer';
import path from 'path';

import Course from '../model/courses.model.js';
import User from '../model/user.model.js';

export const CoursePage = async (req, res, next) => {
    try {
        const courseId = req.params.courseId;
        const course = await Course.findOne({ _id: courseId });
        res.status(200).json({ course });
    } catch (err) {
        console.log(err);
        next();
    }
};

export const Bookmark = async (req, res, next) => {
    try {
        const courseId = req.params.courseId;
        const userId = req.body._userID;

        const user = await User.findById(userId);
        if (!user.Bookmark.includes(courseId)) {
            user.Bookmark.push(courseId);
            console.log("Añadido a favoritos");
        } else {
            user.Bookmark.splice(user.Bookmark.indexOf(courseId), 1);
            console.log('Eliminado de favoritos');
        }

        await user.save();

        const course = await Course.findById(courseId);
        if (!course.bookmark.includes(userId)) {
            course.bookmark.push(userId);
            console.log("");
        } else {
            course.bookmark.splice(course.bookmark.indexOf(userId), 1);
            console.log("El curso ya se ha añadido a favoritos");
        }

        await course.save();

        console.log(user);
        res.status(202).json({ message: "" });
    } catch (err) {
        throw err;
    }
};

export const ShowBookmark = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        console.log(userId);

        const course = await User.findById(userId)
            .populate('Bookmark')
            .exec();

        console.log(course);
        res.json({ course });
    } catch (err) {
        console.log(err);
        next();
    }
};

export const unbookmark = async (req, res, next) => {
    try {
        const userId = req.body.userId;
        const courseId = req.body.id;

        const user = await User.findById(userId);
        user.Bookmark.splice(user.Bookmark.indexOf(courseId), 1);

        await user.save();

        const course = await Course.findById(courseId);
        course.bookmark.splice(course.bookmark.indexOf(userId), 1);

        await course.save();

        res.status(200).json({ message: "Eliminado de favoritos" });
    } catch (err) {
        console.log(err);
    }
};

export const rating = async (req, res, next) => {
    try {
        const courseId = req.body.courseId;
        const newRating = req.body.rating;

        const course = await Course.findById(courseId);
        const totalRating = course.rating.ratingSum + newRating;
        const timesUpdated = course.rating.timesUpdated + 1;
        course.rating.timesUpdated += 1;
        course.rating.ratingSum += newRating;
        course.rating.ratingFinal = totalRating / timesUpdated;

        await course.save();

        console.log(course);
        res.status(200).json({ course });
    } catch (err) {
        console.log(err);
        next();
    }
};

export const pdf = async (req, res, next) => {
    try {
        const courseId = req.params.courseId;
        const course = await Course.findById(courseId);

        if (!course) {
            res.status(400).json({ message: "La tutoría no existe" });
        }

        const pdfName = `invoice-${courseId}.pdf`;
        const pdfPath = path.join('Files', pdfName);

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setContent(`
            <h1>Batutorias. Aprender de más nunca está demás.</h1>
            <h2>-Tutoría creada por:</h2>
            <p>${course.name}</p>
            <h2>-Descripción de la tutoría:</h2>
            <p>${course.description}</p>
            <p>-¿Qué aprendiste durante esta tutoría?</p>
            <p>${course.willLearn}</p>
            <h2>TIPS</h2>
            <p>1. Esta tutoría es importante, trátala como a una de tus clases.</p>
            <p>2. Sé responsable con esta tutoría.</p>
            <p> Practicar mucho, te ayuda a recordar.</p>
            <p>4. Crea un buen ambiente de estudio.</p>
            <p>Final del documento.</p>
        `);

        await page.pdf({ path: pdfPath });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `inline; filename="${pdfName}"`
        );

        const fileStream = fs.createReadStream(pdfPath);
        fileStream.pipe(res);
    } catch (err) {
        console.log(err);
    }
};
