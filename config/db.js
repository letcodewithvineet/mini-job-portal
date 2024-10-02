import mongoose from "mongoose";
import chalk from "chalk";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    //console.log(chalk.bgMagenta.white(`Connected to Mongodb Database ${mongoose.connection.host}`))
  } catch (error) {
    //console.log(chalk.bgRed.white(`MongoDB Errors ${error}`))
  }
};

export default connectDB;
