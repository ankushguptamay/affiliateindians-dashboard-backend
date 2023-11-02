const fs = require('fs');
const db = require('../../Models');
const bcrypt = require('bcryptjs');
const User_Course = db.user_course;
const UserWallet = db.userWallet;
const Course = db.course;
const User = db.user;

// 3 STEP HIGH TICKET AFFILIATE SYSTEM
// AFFILIATE INDIANS BUSINESS BUILDER CHALLENGE
// BEGINNER MEMBERSHIP
// CLICKBANK MASTERY
// EXPERT MEMBERSHIP
// PRO MEMBERSHIP
// SUPER AFFILIATE MEMBERSHIP
// YOUR BONUSES

const getData = () => {
    return new Promise(async (resolve, reject) => {
        fs.readFile(__dirname + "/../../Data/3SHTAS.json", function (err, data) {
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
        const Title = '3 STEP HIGH TICKET AFFILIATE SYSTEM';
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
                // Creating Wallet
                await UserWallet.create({
                    userId: user.id
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

exports.findAllUserForOnlyBulkCheck = async (req, res) => {
    try {
        const users = await User.findAll({
            include: [{
                model: User_Course,
                as: "user_courses"
            }]
        });
        let OneCount = 0;
        let TwoCount = 0;
        let ThreeCount = 0;
        let FourCount = 0;
        let FiveCount = 0;
        let SixCount = 0;
        let SevenCount = 0;
        let EightCount = 0;
        for (let i = 0; i < users.length; i++) {
            const course = users[i].user_courses;
            // console.log(course);
            if (course.length === 1) {
                OneCount = OneCount + 1;
            } else if (course.length === 2) {
                TwoCount = TwoCount + 1;
            } else if (course.length === 3) {
                ThreeCount = ThreeCount + 1;
            } else if (course.length === 4) {
                FourCount = FourCount + 1;
            } else if (course.length === 5) {
                FiveCount = FiveCount + 1;
            } else if (course.length === 6) {
                SixCount = SixCount + 1;
            } else if (course.length === 7) {
                SevenCount = SevenCount + 1;
            } else if (course.length === 8) {
                EightCount = EightCount + 1;
            }
        }
        const data = `${OneCount} One, ${TwoCount} Two, ${ThreeCount} Three, ${FourCount} Four, ${FiveCount} Five, ${SixCount} Six, ${SevenCount} Seven, ${EightCount} Eight`;
        res.status(200).send({
            success: true,
            message: `All User fetched successfully!`,
            data: data
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};