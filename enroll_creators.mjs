import mongoose from 'mongoose';
import Course from './src/Models/Course.js';
import User from './src/Models/User.js';

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/nova_learn');
  const courses = await Course.find({});
  let enrolledCount = 0;
  let privateCount = 0;

  for (const course of courses) {
    if (course.instructor) {
      const creatorId = course.instructor;
      
      // Make sure all user-created courses (where instructor exists and is not admin) 
      // are private (published: false) if they were created as custom courses.
      // We will assume any course without specific properties could be user-created,
      // but the user only complained about *their* courses. 
      // Since all courses created by normal users should be private, let's fix visibility:
      // We will revert the "published: true" for user-created courses.
      // Wait, let's just make the user enrolled first.
      
      const isEnrolled = course.enrolledStudents.some(
        s => s.studentId && s.studentId.toString() === creatorId.toString()
      );
      
      if (!isEnrolled) {
        course.enrolledStudents.push({ studentId: creatorId, progress: 0 });
        await course.save();
        enrolledCount++;
        
        const user = await User.findById(creatorId);
        if (user) {
          const alreadyInUser = user.enrolledCourses.some(
            ec => ec.courseId && ec.courseId.toString() === course._id.toString()
          );
          if (!alreadyInUser) {
            user.enrolledCourses.push({ courseId: course._id, title: course.title });
            await user.save();
          }
        }
      }
      
      // Also ensure self-created courses are unpublished as per Issue 2 requirement
      // Wait, admin-created courses might also have an instructor. Admin-created courses might need to be "published: true".
      // How do we distinguish? Let's check user role.
      const user = await User.findById(creatorId);
      if (user && user.role !== 'admin' && course.published === true) {
         course.published = false;
         await course.save();
         privateCount++;
      }
    }
  }
  
  console.log(`Auto-enrolled creators into ${enrolledCount} courses.`);
  console.log(`Reverted ${privateCount} user-created courses back to private (published: false).`);
  await mongoose.disconnect();
}

run().catch(console.error);
