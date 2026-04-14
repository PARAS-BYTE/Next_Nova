import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    await dbConnect();
    const token = request.cookies.get('jwt')?.value || request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const body = await request.json();

    // Only allow safe fields to update
    const allowedFields = [
      "username",
      "name",
      "avatarUrl",
      "learningPreferences",
      "onboardingData",
      "onboardingCompleted"
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        user[field] = body[field];
      }
    });

    const updatedUser = await user.save();

    return NextResponse.json({
      message: "✅ Data persistence synchronized!",
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        name: updatedUser.name,
        avatarUrl: updatedUser.avatarUrl,
        learningPreferences: updatedUser.learningPreferences,
        xp: updatedUser.xp,
        level: updatedUser.level,
        coins: updatedUser.coins,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Update Profile API Error:", error);
    return NextResponse.json({ message: "Update failed!" }, { status: 500 });
  }
}
