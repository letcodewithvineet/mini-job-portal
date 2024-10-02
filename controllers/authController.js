import userModel from "../models/userModel.js";

export const registerController = async (req, res, next) => {
  const { name, email, password } = req.body;
  // validate
  if (!name) {
    return next("Please provide name");
  }
  if (!email) {
    return next("Please provide email");
  }
  if (!password || password.length < 6) {
    return next("Please provide a password with at least 6 characters");
  }
  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    return next("Email already registered. Please log in.");
  }
  const user = await userModel.create({ name, email, password });
  // generate token
  const token = user.createJWT();
  res.status(201).send({
    success: true,
    message: "User created successfully",
    user: {
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      location: user.location,
    },
    token,
  });
};

export const loginController = async (req, res, next) => {
  const { email, password } = req.body;
  // validate
  if (!email || !password) {
    return next("Please provide both email and password");
  }
  // find user by email
  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    return next("Invalid username or password");
  }
  // compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next("Invalid username or password");
  }
  user.password = undefined;
  const token = user.createJWT();
  res.status(200).json({
    success: true,
    message: "Login successful!",
    user,
    token,
  });
};
