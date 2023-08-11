const fs = require('fs');
const db = require('../../Models');
const User_Course = db.user_course;
const Course = db.course;
const User = db.user;

const getData = () => {
    return new Promise(async (resolve, reject) => {
        fs.readFile(__dirname + "/../../data.json", function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data.toString()));
            }
        })
    });
}

exports.bulkRegisterUserAndCreateCourseAndAssign = async (req, res) => {
    try {
        const data = await getData();
        const obj = [];
        for (let i = 0; i < data.length; i++) {
            const courseArray = (data[i].course).split(',');
            if (courseArray.length > 1) {
                for (let j = 0; j < courseArray.length; j++) {
                    obj.push({
                        name: data[i].name,
                        email: data[i].email,
                        createdAt: data[i].created_at,
                        status: (data[i].status).length <= 1 ? null : data[i].status,
                        course: courseArray[j].length <= 1 ? null : courseArray[j],
                        city: (data[i].city).length <= 1 ? null : data[i].city,
                        state: (data[i].state).length <= 1 ? null : data[i].state,
                        country: (data[i].country).length <= 1 ? null : data[i].country,
                        mobileNumber: (data[i].Phone).length <= 1 ? null : data[i].Phone
                    });
                }
            } else if (courseArray.length === 1) {
                obj.push({
                    name: data[i].name,
                    email: data[i].email,
                    createdAt: data[i].created_at,
                    status: (data[i].status).length <= 1 ? null : data[i].status,
                    course: courseArray[0].length <= 1 ? null : courseArray[0],
                    city: (data[i].city).length <= 1 ? null : data[i].city,
                    state: (data[i].state).length <= 1 ? null : data[i].state,
                    country: (data[i].country).length <= 1 ? null : data[i].country,
                    mobileNumber: (data[i].Phone).length <= 1 ? null : data[i].Phone
                });
            } else {
                obj.push({
                    name: data[i].name,
                    email: data[i].email,
                    createdAt: data[i].created_at,
                    status: (data[i].status).length <= 1 ? null : data[i].status,
                    course: null,
                    city: (data[i].city).length <= 1 ? null : data[i].city,
                    state: (data[i].state).length <= 1 ? null : data[i].state,
                    country: (data[i].country).length <= 1 ? null : data[i].country,
                    mobileNumber: (data[i].Phone).length <= 1 ? null : data[i].Phone
                });
            }
        }
        for (let i = 0; i < obj.length; i++) {
            const isUser = await User.findOne({ where: { email: obj[i].email } });
            if (!isUser) {
                const user = await User.create({
                    name: obj[i].name,
                    email: obj[i].email,
                    mobileNumber: obj[i].mobileNumber,
                    password: `${(obj[i].email).slice(0, 8)}`,
                    // address: obj[i].address,
                    city: obj[i].city,
                    state: obj[i].state,
                    country: obj[i].country,
                    // pinCode: obj[i].pinCode,
                    createdAt: obj[i].createdAt
                });
                if (obj[i].course) {
                    const isCourse = await Course.findOne({ where: { title: obj[i].course } });
                    if (!isCourse) {
                        const course = await Course.create({ title: obj[i].course, adminId: req.admin.id });
                        const isUserCourse = await User_Course.findOne({ where: { courseId: course.id, userId: user.id } });
                        if (!isUserCourse) {
                            await User_Course.create({ courseId: course.id, userid: user.id });
                        }
                    } else {
                        const isUserCourse = await User_Course.findOne({ where: { courseId: isCourse.id, userId: user.id } });
                        if (!isUserCourse) {
                            await User_Course.create({ courseId: isCourse.id, userId: user.id });
                        }
                    }
                }
            } else {
                if (obj[i].course) {
                    const isCourse = await Course.findOne({ where: { title: obj[i].course } });
                    if (!isCourse) {
                        const course = await Course.create({ title: obj[i].course, adminId: req.admin.id });
                        const isUserCourse = await User_Course.findOne({ where: { courseId: course.id, userId: isUser.id } });
                        if (!isUserCourse) {
                            await User_Course.create({ courseId: course.id, userid: isUser.id });
                        }
                    } else {
                        const isUserCourse = await User_Course.findOne({ where: { courseId: isCourse.id, userId: isUser.id } });
                        if (!isUserCourse) {
                            await User_Course.create({ courseId: isCourse.id, userId: isUser.id });
                        }
                    }
                }
            }
        }
        res.status(201).send({
            success: true,
            message: `User added successfully!`
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};