import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    await dbConnect();
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ message: "Please provide username, email, and password" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters long" }, { status: 400 });
    }

    const userExistsByEmail = await User.findOne({ email });
    if (userExistsByEmail) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 400 });
    }

    const userExistsByUsername = await User.findOne({ username });
    if (userExistsByUsername) {
      return NextResponse.json({ message: "Username already taken" }, { status: 400 });
    }

    const user = await User.create({ username, email, password });
    
    if (!user) {
      return NextResponse.json({ message: "Invalid user data" }, { status: 400 });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    const response = NextResponse.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    }, { status: 201 });

    response.cookies.set('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      path: '/',
    });

    return response;
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: error.message || "Server error while registering user" }, { status: 500 });
  }
}
