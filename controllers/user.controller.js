import bcrypt from "bcryptjs";

import User from "../models/userModel.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import customError from "../utils/customError.js";
import { generateJWT } from "./../utils/generateJWT.js";

const getUsers = asyncWrapper(async (req, res) => {
  const query = req.query;

  const limit = parseInt(query.limit) || 10;
  const page = parseInt(query.page) || 1;
  const skip = (page - 1) * limit;

  const users = await User.find().limit(limit).skip(skip);
  res.json({ status: 200, data: users });
});

const signup = asyncWrapper(async (req, res, next) => {
  const { name, email, address, number, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return next(customError.create("User already exists", 409, "conflict"));

  const hashedPass = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    address,
    number,
    password: hashedPass,
    role,
  });

  const token = generateJWT({
    id: newUser._id,
    email: newUser.email,
    role: newUser.role,
  });
  newUser.token = token;

  res.json({ status: 201, data: { newUser } });
});

const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(customError.create("email and password are required", 400, "fail"));

  const user = await User.findOne({ email: email });
  if (!user) return next(customError.create("user not found!", 400, "fail"));

  const matchedPassword = await bcrypt.compare(password, user.password);

  if (!matchedPassword)
    return next(customError.create("the password is incorrect", 500, "error"));

  // logged in successfully
  const token = generateJWT({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  return res.json({ status: "success", data: { token } });
});

export default { getUsers, signup, login };