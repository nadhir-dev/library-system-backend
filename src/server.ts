import "./config/db";
import { app } from "./app";

app.listen(Bun.env.PORT!, () =>
  console.log(`server running on port ${Bun.env.PORT}`),
);
