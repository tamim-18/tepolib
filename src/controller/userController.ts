import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import User from "../models/userModel";
import { AuthRequest } from "../types/AuthRequest";
import { config } from "../config/config"; // Ensure JWT secret is stored securely
import mongoose from "mongoose";

import CrimeReport from "../models/crimeReportModel";

// Helper function to generate JWT token
const generateToken = (userId: string) => {
  if (!config.jwtSecret) {
    throw new Error("JWT secret is not defined");
  }
  return jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: "7d" });
};

/**
 * @desc Register a new user
 * @route POST /api/users/register
 */

/**
 * @desc User Signup with Phone Number Validation
 * @route POST /api/users/signup
 */
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      email,
      password,
      displayName,
      phoneNumber,
      profileImage,
      bio,
      contactInfo,
    } = req.body;

    // console.log("✅ Received Signup Request:", req.body); // Debugging log

    // **1️⃣ Validate Email Format**
    if (!email || !/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      return next(createHttpError(400, "Invalid email format"));
    }

    // **2️⃣ Validate Phone Number Format**
    const phoneRegex = /^(?:\+88|01)?\d{9,11}$/; // ✅ Accepts +88, 01, or direct 11-digit numbers
    if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
      return next(
        createHttpError(
          400,
          "Invalid phone number format. Must be a valid Bangladeshi number."
        )
      );
    }

    // **3️⃣ Check if Email or Phone Number Already Exists**
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });
    if (existingUser) {
      return next(
        createHttpError(400, "Email or phone number already registered")
      );
    }

    // **4️⃣ Hash Password**
    const hashedPassword = await bcrypt.hash(password, 10);

    // **5️⃣ Create New User**
    const newUser = new User({
      email,
      password: hashedPassword,
      displayName,
      phoneNumber,
      profileImage,
      bio: bio || "",
      contactInfo: contactInfo || "",
      isVerified: false, // Default from schema
      role: "unverified", // Default from schema
      isBanned: false, // Default from schema
    });

    await newUser.save();

    // **6️⃣ Return Success Response**
    res.status(201).json({
      message: "User registered successfully. Please verify your phone number.",
      user: {
        id: newUser._id,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        isVerified: newUser.isVerified,
        role: newUser.role,
        isBanned: newUser.isBanned,
        profileImage: newUser.profileImage,
        bio: newUser.bio,
        contactInfo: newUser.contactInfo,
      },
    });
  } catch (error) {
    console.error("❌ Signup Error:", error);
    next(createHttpError(500, "Internal Server Error"));
  }
};

/**
 * @desc Login user
 * @route POST /api/users/login
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return next(createHttpError(401, "Invalid email or password"));
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(createHttpError(401, "Invalid email or password"));
    }

    // Generate JWT token
    const token = generateToken((user._id as string).toString());

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    next(createHttpError(500, "Internal Server Error"));
  }
};

/**
 * @desc Logout user (Token-based logout)
 * @route POST /api/users/logout
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    next(createHttpError(500, "Internal Server Error"));
  }
};

/**
 * @desc Get user profile
 * @route GET /api/users/profile
 */

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("✅ getProfile - User ID from req:", req.userId); // Debugging log

    if (!req.userId) {
      return next(createHttpError(401, "Unauthorized: Missing user ID"));
    }

    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return next(createHttpError(404, "User not found"));
    }

    res.status(200).json(user);
  } catch (error) {
    next(createHttpError(500, "Internal Server Error"));
  }
};

/**
 * @desc Update user profile
 * @route PUT /api/users/profile
 */
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { displayName, profileImage, bio, contactInfo } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { displayName, profileImage, bio, contactInfo },
      { new: true, select: "-password" }
    );

    if (!updatedUser) {
      return next(createHttpError(404, "User not found"));
    }

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    next(createHttpError(500, "Internal Server Error"));
  }
};

/**
 * @desc Verify phone number (Admin not required)
 * @route POST /api/users/verify-phone
 */
export const verifyPhone = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phoneNumber } = req.body;

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "Phone number verified successfully" });
  } catch (error) {
    next(createHttpError(500, "Internal Server Error"));
  }
};

/**
 * @desc Get all users (Admin Only)
 * @route GET /api/users/all-users
 */
export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    next(createHttpError(500, "Internal Server Error"));
  }
};

/**
 * @desc Ban/Unban a user (Admin Only)
 * @route POST /api/users/ban-user
 */
export const toggleBanUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, isBanned } = req.body;
    console.log("✅ toggleBanUser - Received User ID:", userId); // Debugging log

    // ✅ Ensure userId is a valid ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("❌ Invalid ObjectId format");
      return next(createHttpError(400, "Invalid User ID format"));
    }

    const objectId = new mongoose.Types.ObjectId(userId);

    // ✅ Find user using the converted ObjectId
    const user = await User.findById(objectId);

    if (!user) {
      console.log("❌ User not found in database");
      return next(createHttpError(404, "User not found"));
    }

    user.isBanned = isBanned;
    await user.save();

    console.log(`✅ User ${isBanned ? "banned" : "unbanned"} successfully`);

    res
      .status(200)
      .json({ message: `User has been ${isBanned ? "banned" : "unbanned"}` });
  } catch (error) {
    console.error("❌ toggleBanUser Error:", error);
    next(createHttpError(500, "Internal Server Error"));
  }
};

/// Crime Reports of a User

export const getUserReports = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params; // User ID from URL

    // ✅ Fetch all reports where user ID matches
    const reports = await CrimeReport.find({ user: id }).sort({
      createdAt: -1,
    });

    if (!reports || reports.length === 0) {
      return next(createHttpError(404, "No reports found for this user"));
    }

    res.status(200).json(reports);
  } catch (error) {
    console.error("❌ getUserReports Error:", error);
    next(createHttpError(500, "Internal Server Error"));
  }
};

// Change Password
export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return next(
        createHttpError(400, "Both old and new passwords are required")
      );
    }

    // Find the user
    const user = await User.findById(req.userId);
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }

    // Check if the old password is correct
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return next(createHttpError(400, "Incorrect old password"));
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    next(createHttpError(500, "Internal Server Error"));
  }
};
