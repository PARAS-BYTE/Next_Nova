import mongoose from 'mongoose';
import Course from './src/Models/Course.js';
import User from './src/Models/User.js';
import { completeLesson } from './src/controllers/CourseController.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

async function runTest() {
    await mongoose.connect('mongodb://127.0.0.1:27017/nova_learn');
    
    // Find Paras
    const user = await User.findOne({ username: 'Paras' });
    if (!user) return console.log('User not found');
    
    // Find course where user is enrolled
    const course = await Course.findOne({ 'enrolledStudents.studentId': user._id });
    if (!course) return console.log('Course not found');
    
    const lessonId = course.modules[0]?.lessons[0]?._id;
    if (!lessonId) return console.log('No lessons found');
    
    // Mock req and res
    const req = {
        params: { id: course._id.toString() },
        body: { courseId: course._id.toString(), lessonId: lessonId.toString() },
        cookies: {},
        headers: { authorization: `Bearer ${getFakeToken(user._id)}` }
    };
    
    let resData, resStatus;
    const res = {
        status: (code) => {
            resStatus = code;
            return { json: (data) => { resData = data; } };
        }
    };
    
    await completeLesson(req, res);
    console.log(`Status: ${resStatus}`);
    console.log(`Response:`, resData);
    
    await mongoose.disconnect();
}

function getFakeToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback');
}

runTest().catch(console.error);
