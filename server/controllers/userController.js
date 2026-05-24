import asyncHandler from "express-async-handler";
import User from "../models/User.js";

// @desc   List users (admin: all, manager: their team + self)
// @route  GET /api/users
// @access Private (manager/admin)
export const getUsers = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.user.role === "manager") {
    filter = { $or: [{ manager: req.user._id }, { _id: req.user._id }] };
  }
  const users = await User.find(filter).select("-password").sort({ name: 1 });
  res.json(users);
});
