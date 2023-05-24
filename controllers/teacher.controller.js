import Course from '../model/courses';

export const uploadCourse = async (req, res, next) => {
    try {
        const imageurl = req.file.path;
        const userId = req.body._id;
        const { title, category, name, willLearn, discription, discriptionLong, requirement, price } = req.body;

        console.log(userId, title);

        const course = new Course({
            title: title,
            category: category,
            imageurl: imageurl,
            name: name,
            willLearn: willLearn,
            discription: discription,
            discriptionLong: discriptionLong,
            requirement: requirement,
            rating: 0,
            price: price,
            creator: userId,
        });

        const result = await course.save();
        console.log(result);
        res.status(201).json({ message: "Tutoría creada correctamente", newCourse: result });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Un error ha ocurrido." });
    }
};

export const uploadVideo = async (req, res, next) => {
    try {
        const courseId = req.params.courseID;
        console.log(req.files);
        const videos = req.files;
        let videoContent = [];
        const course = await Course.findOne({ _id: courseId });
        videos.forEach(video => {
            let videoContentContainer = {
                videoUrl: null,
                usersWatched: [],
            };
            videoContentContainer.videoUrl = video.path;
            videoContent.push(videoContentContainer);
        });
        console.log(videoContent);
        course.videoContent = videoContent;
        await course.save();
        res.status(200).json({ message: "Video añadido correctamente" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Un error ha ocurrido." });
    }
};

export const watchedByUsers = async (req, res, next) => {
    try {
        const userId = req.body.userId;
        const videoId = req.body.videoId;
        const courseId = req.body.courseId;
        console.log(videoId);
        const course = await Course.findById({ _id: courseId });
        course.videoContent.every(video => {
            console.log(video);
            if (video._id == videoId) {
                if (!video.usersWatched.includes(userId)) {
                    video.usersWatched.push(userId);
                }
                return false;
            }
            return true;
            console.log("");
        });
        await course.save();
        console.log(course.videoContent);
        res.status(200).json({ message: "" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Un error ha ocurrido." });
    }
};

export const teacherHome = async (req, res, next) => {
    try {
        const userId = req.body.userId;
        const course = await Course.find({ creator: userId });
        res.status(200).json({ data: course });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Un error ha ocurrido." });
    }
};

export const deleteCourse = async (req, res, next) => {
    try {
        const courseId = req.body.courseId;
        await Course.findByIdAndRemove({ _id: courseId });
        res.status(200).json({ message: "Tutoría eliminada correctamente" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Un error ha ocurrido." });
    }
};

export const editCourse = async (req, res, next) => {
    try {
        const courseId = req.body.courseId;
        const course = await Course.findOne({ _id: courseId });
        res.status(200).json({ course });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Un error ha ocurrido." });
    }
};

export const updateCourse = async (req, res, next) => {
    try {
        console.log(req.file);
        const courseId = req.body.courseId;
        const title = req.body.title;
        const category = req.body.category;
        const imageurl = req.file.path;
        const name = req.body.name;
        const willLearn = req.body.willLearn;
        const discription = req.body.discription;
        const discriptionLong = req.body.discriptionLong;
        const requirement = req.body.requirement;
        const price = req.body.price;

        const course = await Course.findById({ _id: courseId });
        course.title = title;
        course.category = category;
        course.imageurl = imageurl;
        course.name = name;
        course.willLearn = willLearn;
        course.discription = discription;
        course.discriptionLong = discriptionLong;
        course.requirement = requirement;
        course.price = price;

        await course.save();
        res.status(201).json({ message: "Tutoría editada correctamente", course: course });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Un error ha ocurrido." });
    }
};
