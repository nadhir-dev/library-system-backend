import mongoose from "mongoose";

mongoose
  .connect(Bun.env.DB_URL!)
  .then(() => console.log("Connected to DB"))
  .catch((e) => console.log(e));

export default mongoose;
