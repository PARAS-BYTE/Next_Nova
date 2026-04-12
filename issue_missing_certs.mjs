import mongoose from 'mongoose';
import Course from './src/Models/Course.js';
import User from './src/Models/User.js';
import Certificate from './src/Models/Certificate.js';
import blockchainService from './src/utils/blockchainService.js';

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/nova_learn');
  const courses = await Course.find({}).populate('enrolledStudents.studentId');
  let issuedCount = 0;

  for (const course of courses) {
    for (const enrollment of course.enrolledStudents) {
      if (enrollment.completed && enrollment.studentId) {
        const studentId = enrollment.studentId._id || enrollment.studentId;
        const user = await User.findById(studentId);

        if (user) {
          // Check if cert exists
          const existingCert = await Certificate.findOne({ user: studentId, course: course._id });
          if (!existingCert) {
            console.log(`Issuing missing cert for ${user.username} in ${course.title}...`);
            try {
              const blockchainResult = await blockchainService.mintCertificate(
                  user.walletAddress || "0x0000000000000000000000000000000000000000",
                  {
                      courseTitle: course.title,
                      studentName: user.name || user.username,
                      score: 100
                  }
              );

              await Certificate.create({
                  user: user._id,
                  course: course._id,
                  studentName: user.name || user.username,
                  courseTitle: course.title,
                  tokenId: blockchainResult.tokenId,
                  transactionHash: blockchainResult.transactionHash,
                  blockchainUrl: `https://amoy.polygonscan.com/tx/${blockchainResult.transactionHash}`
              });

              issuedCount++;
            } catch (err) {
              console.error(`Failed cert for ${user.username}:`, err.message);
            }
          }
        }
      }
    }
  }
  
  console.log(`Issued ${issuedCount} missing certificates.`);
  await mongoose.disconnect();
}

run().catch(console.error);
