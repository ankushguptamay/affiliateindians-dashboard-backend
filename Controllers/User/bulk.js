const fs = require('fs');
const db = require('../../Models');
const bcrypt = require('bcryptjs');
const User_Course = db.user_course;
const UserWallet = db.userWallet;
const Course = db.course;
const User = db.user;
const { Op } = require('sequelize');

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
        fs.readFile(__dirname + "/../../Data/SAM.json", function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data.toString()));
            }
        })
    });
}

// exports.bulkRegisterUserAndCreateCourseAndAssign = async (req, res) => {
//     try {
//         const obj = await getData();
//         let newRegister = 1;
//         let oldRegister = 0;
//         const Title = '8. SUPER AFFILIATE MEMBERSHIP';
//         for (let i = 0; i < obj.length; i++) {
//             const isUser = await User.findOne({ where: { email: obj[i].email } });
//             if (!isUser) {
//                 // Generating Code
//                 // 2.Today Day
//                 const Day = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
//                 const dayNumber = (new Date).getDay();
//                 // Get All Today Code
//                 const day = new Date().toISOString().slice(8, 10);
//                 const year = new Date().toISOString().slice(2, 4);
//                 const month = new Date().toISOString().slice(5, 7);
//                 let code = "AFUS" + day + month + year + Day[dayNumber] + newRegister;
//                 const salt = await bcrypt.genSalt(10);
//                 const bcPassword = await bcrypt.hash(`${(obj[i].email).slice(0, 8)}`, salt);
//                 const user = await User.create({
//                     name: obj[i].fullname,
//                     email: obj[i].email,
//                     password: bcPassword,
//                     userCode: code,
//                     termAndConditionAccepted: true
//                 });
//                 newRegister = parseInt(newRegister) + 1;
//                 await UserWallet.create({
//                     userId: user.id
//                 });
//                 const isCourse = await Course.findOne({ where: { title: Title } });
//                 const isUserCourse = await User_Course.findOne({ where: { courseId: isCourse.id, userId: user.id, verify: true, status: "paid" } });
//                 if (!isUserCourse) {
//                     await User_Course.create({ courseId: isCourse.id, userId: user.id, verify: true, status: "paid" });
//                 }
//             } else {
//                 oldRegister = parseInt(oldRegister) + 1;
//                 console.log(oldRegister);
//                 const isCourse = await Course.findOne({ where: { title: Title } });
//                 const isUserCourse = await User_Course.findOne({ where: { courseId: isCourse.id, userId: isUser.id, verify: true, status: "paid" } });
//                 if (!isUserCourse) {
//                     await User_Course.create({ courseId: isCourse.id, userId: isUser.id, verify: true, status: "paid" });
//                 }
//             }
//         }
//         res.status(201).send({
//             success: true,
//             message: `User added with ${Title} successfully! ${newRegister} new register and ${oldRegister} old register!`
//         });
//     }
//     catch (err) {
//         console.log(err);
//         res.status(500).send(err);
//     }
// };

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
        let moreThenEight =0;
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
            } else if(course.length>8){
                moreThenEight=moreThenEight+1;
            }
        }
        const data = `${OneCount} One, ${TwoCount} Two, ${ThreeCount} Three, ${FourCount} Four, ${FiveCount} Five, ${SixCount} Six, 
        ${SevenCount} Seven, ${EightCount} Eight, ${moreThenEight} MoreThenEight`;
        res.status(200).send({
            success: true,
            message: `All User fetched successfully!`,
            data: { data: data, length: users.length }
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.addUserToAllCourse = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            return res.send("User is not present!")
        }
        const findAllCourse = await Course.findAll({
            order: [
                ['createdAt', 'ASC']
            ]
        });
        let num = 0;
        for (let i = 0; i < findAllCourse.length; i++) {
            const isUserCourse = await User_Course.findOne({ where: { courseId: findAllCourse[i].id, userId: userId, verify: true, status: "paid" } });
            if (!isUserCourse) {
                await User_Course.create({ courseId: findAllCourse[i].id, userId: userId, verify: true, status: "paid", amount: findAllCourse[i].price });
                num = num + 1;
            }
        }
        res.status(201).send({
            success: true,
            message: `Total course ${findAllCourse.length} assign to user ${num}!`
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};
