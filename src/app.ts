import { Elysia } from "elysia";
import userPlugin from "./routes/users";
import bookPlugin from "./routes/books";
import uploadPlugin from "./routes/upload";
import swagger from "@elysiajs/openapi";
import cors from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";

export const app = new Elysia({ nativeStaticResponse: true })
  .onRequest(({ request }) => {
    console.log(`${request.method} ${request.url}`);
  })
  .use(
    cors({
      origin: true,
      credentials: true,
    }),
  )
  .use(
    swagger({
      path: "/docs",
      documentation: {
        info: {
          title: "My API",
          version: "1.0.0",
        },
      },
    }),
  );

app.use(uploadPlugin).use(userPlugin).use(bookPlugin);
