import mongoose from "mongoose";
import { config } from "./config";

const databaseConnection = () => {
  const connect = () => {
    mongoose
      .connect(`${config.DB_URL}`)
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

export default databaseConnection;
