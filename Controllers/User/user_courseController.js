const fs = require('fs');
const db = require('../../Models');
const bcrypt = require('bcryptjs');
const User_Course = db.user_course;
const Course = db.course;
const User = db.user;

// SUPER AFFILIATE MEMBERSHIP
// AFFILIATE INDIANS BUSINESS BUILDER CHALLENGE
// 3 STEP HIGH TICKET AFFILIATE SYSTEM
// EXPERT MEMBERSHIP
// YOUR BONUSES
// BEGINNER MEMBERSHIP
// PRO MEMBERSHIP
// CLICKBANK MASTERY

const getData = () => {
    return new Promise(async (resolve, reject) => {
        fs.readFile(__dirname + "/../../Data/SAM.json", function (err, data) {
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
        const obj = await getData();
        let newRegister = 0;
        let oldRegister = 0;
        const Title = 'SUPER AFFILIATE MEMBERSHIP';
        for (let i = 0; i < obj.length; i++) {
            const isUser = await User.findOne({ where: { email: obj[i].email } });
            if (!isUser) {
                const salt = await bcrypt.genSalt(10);
                const bcPassword = await bcrypt.hash(`${(obj[i].email).slice(0, 8)}`, salt);
                newRegister = parseInt(newRegister) + 1;
                const country = (obj[i].country).length <= 1 ? null : obj[i].country;
                const joinTime = (obj[i].joined_at).length <= 1 ? null : obj[i].joined_at;
                const user = await User.create({
                    name: obj[i].fullname,
                    email: obj[i].email,
                    password: bcPassword,
                    createdAt: joinTime,
                    country: country
                });
                const isCourse = await Course.findOne({ where: { title: Title } });
                const isUserCourse = await User_Course.findOne({ where: { courseId: isCourse.id, userId: user.id } });
                if (!isUserCourse) {
                    await User_Course.create({ courseId: isCourse.id, userId: user.id });
                }

            } else {
                oldRegister = parseInt(oldRegister) + 1;
                const isCourse = await Course.findOne({ where: { title: Title } });
                const isUserCourse = await User_Course.findOne({ where: { courseId: isCourse.id, userId: isUser.id } });
                if (!isUserCourse) {
                    await User_Course.create({ courseId: isCourse.id, userId: isUser.id });
                }


            }
        }
        res.status(201).send({
            success: true,
            message: `User added with ${Title} successfully! ${newRegister} new register and ${oldRegister} old register!`
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};