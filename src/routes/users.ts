import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import bcrypt from "bcryptjs";
import User from "../models/users";
import cookie from "@elysiajs/cookie";

const userPlugin = new Elysia({ prefix: "/users" });
export default userPlugin;

userPlugin
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET!,
      exp: "60d",
    }),
  )
  .use(cookie())
  .post(
    "/register",
    async ({ body, set, cookie: { auth }, jwt }) => {
      const { name, email, password } = body;

      const existing = await User.findOne({ email });
      if (existing) {
        set.status = 409;
        return { error: "Email already in use" };
      }

      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashed });

      const token = await jwt.sign({
        id: user._id.toString(),
      });

      auth.set({
        value: token,
        httpOnly: true,
        secure: Bun.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 24 * 60 * 60,
        path: "/",
      });

      return {
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2, maxLength: 50 }),
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
      }),
    },
  )

  .post(
    "/login",
    async ({ body, jwt, set, cookie: { auth } }) => {
      const { email, password } = body;

      const user = await User.findOne({ email });
      if (!user) {
        set.status = 401;
        return { error: "Invalid credentials" };
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        set.status = 401;
        return { error: "Invalid credentials" };
      }

      const token = await jwt.sign({
        id: user._id.toString(),
      });

      auth.set({
        value: token,
        httpOnly: true,
        secure: Bun.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 24 * 60 * 60,
        path: "/",
      });

      return {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
      }),
    },
  )

  .get("/me", async ({ jwt, set, cookie: { auth } }) => {
    if (!auth.value) {
      set.status = 401;
      return { error: "Missing token" };
    }

    const payload = await jwt.verify(auth.value as string);
    if (!payload) {
      set.status = 401;
      return { error: "Invalid or expired token" };
    }

    const user = await User.findById(payload.id).select("-password");
    if (!user) {
      set.status = 404;
      return { error: "User not found" };
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  });
