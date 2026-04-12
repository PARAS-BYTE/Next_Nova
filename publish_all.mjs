import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/nova_learn');
  const res = await mongoose.connection.collection('courses').updateMany({}, { $set: { published: true } });
  console.log('Updated courses:', res);
  await mongoose.disconnect();
}

run().catch(console.error);
