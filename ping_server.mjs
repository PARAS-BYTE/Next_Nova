import mongoose from 'mongoose';
import Course from './src/Models/Course.js';
import User from './src/Models/User.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { request } from 'http';
dotenv.config();

async function runLocalhostRequest() {
    await mongoose.connect('mongodb://127.0.0.1:27017/nova_learn');
    const user = await User.findOne({ username: 'Paras' });
    const course = await Course.findOne({ 'enrolledStudents.studentId': user._id });
    const lessonId = course.modules[0]?.lessons[0]?._id;
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback');
    
    const postData = JSON.stringify({
        courseId: course._id.toString(),
        lessonId: lessonId.toString()
    });

    const options = {
        hostname: '127.0.0.1',
        port: 3000,
        path: `/api/courses/${course._id.toString()}/complete-lesson`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'Authorization': `Bearer ${token}`
        }
    };

    const req = request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log(`STATUS: ${res.statusCode}`);
            console.log(`BODY: ${data}`);
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
    });

    req.write(postData);
    req.end();
    
    await mongoose.disconnect();
}

runLocalhostRequest().catch(console.error);
