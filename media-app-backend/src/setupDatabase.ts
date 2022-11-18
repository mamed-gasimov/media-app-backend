import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export default () => {
  const connect = () => {
    mongoose
      .connect(process.env.DB_URL as string)
      .then(() => {
        console.log("Successfully connected to database!");
      })
      .catch((error) => {
        console.log("Error connecting to database", error);
        return process.exit(1);
      });
  };

  connect();

  mongoose.connection.on("disconnected", connect);
};
