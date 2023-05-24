import Course from '../model/courses.model.js';
import User from '../model/user.model.js';

export const allCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json({ course: courses });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Un error no ha ocurrido." });
    }
};

export const fetchCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json({ course: courses });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Un error no ha ocurrido." });
    }
};

export const preferenceCourses = async (req, res, next) => {
    try {
        const category = req.params.course;
        if (category === "preferences") {
            const userId = req.body.userId;
            let courseArray = [];
            let no_of_course = 0;

            const user = await User.findOne({ _id: userId });
            for (const preference of user.preferences) {
                try {
                    const courses = await Course.find({ category: preference });
                    no_of_course++;
                    courseArray.push(...courses);
                    if (no_of_course === user.preferences.length) {
                        res.status(200).json({ course: courseArray });
                    }
                } catch (err) {
                    console.log(err);
                }
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Un error no ha ocurrido." });
    }
};

export const getPreferences = async (req, res, next) => {
    try {
        const preferencesArray = req.body.interest;
        const userId = req.body.userId;
        const user = await User.findOne({ _id: userId });
        user.preferences = preferencesArray;
        await user.save();
        res.status(200).json({ message: "Preferencias agregadas." });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Un error ha ocurrido." });
    }
};