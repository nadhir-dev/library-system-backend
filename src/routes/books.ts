import { t, Elysia } from "elysia";
import mongoose from "mongoose";
import {
  Author,
  Book,
  BookComment,
  BookRequest,
  Customer,
  Order,
} from "../models/books";
import jwt from "@elysiajs/jwt";
import User from "../models/users";

const bookPlugin = new Elysia();

bookPlugin
  .get(
    "/books",
    async ({ query }) => {
      const skip = (query.page - 1) * query.limit;
      const search = query.name.trim();

      let filter: Record<string, any> = {};
      if (search) {
        const matchingAuthors = await Author.find({
          name: { $regex: search, $options: "i" },
        }).select("_id");
        const authorIds = matchingAuthors.map((a) => a._id);

        filter = {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { isbn: { $regex: search, $options: "i" } },
            ...(authorIds.length > 0 ? [{ authors: { $in: authorIds } }] : []),
          ],
        };
      }

      const [books, total] = await Promise.all([
        Book.find(filter)
          .populate("authors")
          .skip(skip)
          .limit(query.limit)
          .sort({ createdAt: -1 }),
        Book.countDocuments(filter),
      ]);

      return {
        data: books,
        pagination: {
          total,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(total / query.limit),
          hasNext: query.page < Math.ceil(total / query.limit),
          hasPrev: query.page > 1,
        },
      };
    },
    {
      query: t.Object({
        page: t.Integer({ default: 1 }),
        limit: t.Integer({ default: 10 }),
        name: t.String({ default: "", trim: true }),
      }),
    },
  )
  .get(
    "/books/:id",
    async ({ params, set }) => {
      const conditions: Record<string, any>[] = [{ isbn: params.id }];
      if (mongoose.Types.ObjectId.isValid(params.id)) {
        conditions.push({ _id: new mongoose.Types.ObjectId(params.id) });
      }

      const book = await Book.findOne({ $or: conditions }).populate("authors");

      if (!book) {
        set.status = 404;
        return { error: "Book not found" };
      }

      return { data: book };
    },
  )
  .post(
    "/books/:id/rate",
    async ({ params, body, set }) => {
      const book = await Book.findById(params.id);
      if (!book) {
        set.status = 404;
        return { error: "Book not found" };
      }
      const oldTotal = book.avgRating! * book.ratingCount!;
      book.ratingCount! += 1;
      book.avgRating = (oldTotal + body.rating) / book.ratingCount!;
      await book.save();
      return { data: book };
    },
    {
      body: t.Object({
        rating: t.Number({ minimum: 1, maximum: 5 }),
      }),
      params: t.Object({
        id: t.String(),
      }),
    },
  )
  .get(
    "/authors",
    async ({ query }) => {
      const [authors, total] = await Promise.all([
        Author.find({
          name: { $regex: `^${query.name}`, $options: "i" },
        })
          .limit(query.limit)
          .skip((query.page - 1) * query.limit)
          .sort({ createdAt: -1 }),
        Author.countDocuments(),
      ]);

      return {
        data: authors,
        pagination: {
          total,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(total / query.limit),
          hasNext: query.page < Math.ceil(total / query.limit),
          hasPrev: query.page > 1,
        },
      };
    },
    {
      query: t.Object({
        name: t.String({ default: "", trim: true }),
        page: t.Integer({ default: 1, min: 0 }),
        limit: t.Integer({ default: 10, min: 0 }),
      }),
    },
  )
  .group("", (app) =>
    app
      // .use(
      //   jwt({
      //     name: "jwt",
      //     secret: Bun.env.JWT_SECRET!,
      //     exp: "60d",
      //   }),
      // )
      // .guard({
      //   cookie: t.Cookie({
      //     auth: t.String(),
      //   }),
      // })
      // .onBeforeHandle(async ({ jwt, cookie: { auth }, set }) => {
      //   const payload = await jwt.verify(auth.value);
      //   if (!payload) {
      //     set.status = 401;
      //     return { error: "Missing token" };
      //   }

      //   const userExists = await User.exists({ _id: payload.id });

      //   if (!userExists) {
      //     return { error: "Invalid token" };
      //   }
      // })
      .post(
        "/authors",
        async ({ body, set }) => {
          try {
            const authors = await Author.insertMany(body.authors);
            return { message: `${authors.length} author(s) added`, authors };
          } catch (e: any) {
            if (e.code === 11000) {
              set.status = 409;
              return {
                error: "One or more authors already exist",
              };
            }
            throw e;
          }
        },
        {
          body: t.Object({
            authors: t.Array(
              t.Object({
                name: t.String({ minLength: 2 }),
                bio: t.Optional(t.String()),
                nationality: t.Optional(t.String()),
                birthYear: t.Integer({ max: new Date().getFullYear() }),
              }),
              { minItems: 1 },
            ),
          }),
        },
      )
      .patch(
        "/authors/:id",
        async ({ params, body, set }) => {
          const author = await Author.findByIdAndUpdate(params.id, body, {
            new: true,
            runValidators: true,
          });
          if (!author) {
            set.status = 404;
            return { error: "Author not found" };
          }
          return { message: "Author updated", author };
        },
        {
          body: t.Object({
            name: t.Optional(t.String({ minLength: 2 })),
            bio: t.Optional(t.String()),
            nationality: t.Optional(t.String()),
            birthYear: t.Optional(
              t.Integer({ max: new Date().getFullYear() }),
            ),
          }),
        },
      )
      .delete("/authors/:id", async ({ params, set }) => {
        const author = await Author.findByIdAndDelete(params.id);
        if (!author) {
          set.status = 404;
          return { error: "Author not found" };
        }
        return { message: "Author deleted" };
      })
      .post(
        "/books",
        async ({ body, set }) => {
          const authorIds = [...new Set(body.books.flatMap((b) => b.authors))];
          if (authorIds.length > 0) {
            const found = await Author.find({ _id: { $in: authorIds } });
            if (found.length !== authorIds.length) {
              set.status = 404;
              return { error: "One or more author IDs not found" };
            }
          }

          try {
            const books = await Book.insertMany(body.books);
            return { message: `${books.length} book(s) added`, books };
          } catch (e: any) {
            if (e.code === 11000) {
              set.status = 400;
              return {
                error:
                  "One or more books already exists, in other words some books with the same isbn and edition exist",
              };
            }
          }
        },
        {
          body: t.Object({
            books: t.Array(
              t.Object({
                title: t.String({ minLength: 1 }),
                authors: t.Array(t.String(), { minItems: 1 }),
                cover: t.String({ format: "uri" }),
                genre: t.Optional(t.String()),
                publishedYear: t.Optional(t.Number()),
                quantity: t.Optional(t.Number({ minimum: 0 })),
                price: t.Optional(t.Number({ minimum: 0 })),
                language: t.Optional(t.String()),
              }),
              { minItems: 1 },
            ),
          }),
        },
      )
      .patch(
        "/orders/:id",
        async ({ params, body, set }) => {
          const order = await Order.findById(params.id);
          if (!order) {
            set.status = 404;
            return { error: "Order not found" };
          }

          if (body.status === "sold" && order.status === "pending") {
            for (const item of order.items) {
              await Book.findByIdAndUpdate(item.book, {
                $inc: { quantity: -item.quantity },
              });
            }
          }

          order.status = body.status;
          await order.save();

          return { message: "Order updated", order };
        },
        {
          body: t.Object({
            status: t.Union([
              t.Literal("pending"),
              t.Literal("sold"),
              t.Literal("delivered"),
              t.Literal("canceled"),
            ]),
          }),
        },
      )
      .get(
        "/book-requests",
        async ({ query }) => {
          const page = Math.max(1, Number(query.page) || 1);
          const limit = Math.min(50, Number(query.limit) || 10);
          const skip = (page - 1) * limit;
          const status = query.status ?? null;

          const filter = status ? { status } : {};
          const [requests, total] = await Promise.all([
            BookRequest.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
            BookRequest.countDocuments(filter),
          ]);

          return {
            data: requests,
            pagination: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit),
              hasNext: page < Math.ceil(total / limit),
              hasPrev: page > 1,
            },
          };
        },
        {
          query: t.Object({
            page: t.Optional(t.String()),
            limit: t.Optional(t.String()),
            status: t.Optional(
              t.Union([
                t.Literal("pending"),
                t.Literal("acquired"),
                t.Literal("rejected"),
              ]),
            ),
          }),
        },
      )
      .get(
        "/orders",
        async ({ query }) => {
          const page = Math.max(1, Number(query.page) || 1);
          const limit = Math.min(50, Number(query.limit) || 10);
          const skip = (page - 1) * limit;
          const status = query.status ?? null;

          const filter = status ? { status } : {};
          const [orders, total] = await Promise.all([
            Order.find(filter)
              .populate("customer")
              .populate("items.book", "title isbn cover")
              .skip(skip)
              .limit(limit)
              .sort({ createdAt: -1 }),
            Order.countDocuments(filter),
          ]);

          return {
            data: orders,
            pagination: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit),
              hasNext: page < Math.ceil(total / limit),
              hasPrev: page > 1,
            },
          };
        },
        {
          query: t.Object({
            page: t.Optional(t.String()),
            limit: t.Optional(t.String()),
            status: t.Optional(
              t.Union([
                t.Literal("pending"),
                t.Literal("sold"),
                t.Literal("delivered"),
                t.Literal("canceled"),
              ]),
            ),
          }),
        },
      )
      .patch("/book-requests/:id/acquire", async ({ params: { id }, set }) => {
        const request = await BookRequest.findById(id);
        if (!request) {
          set.status = 404;
          return { error: "Book request not found" };
        }
        if (request.status !== "pending") {
          set.status = 409;
          return { error: `Request is already ${request.status}` };
        }

        request.status = "acquired";
        await request.save();

        return { message: "Book request marked as acquired", request };
      })
      .delete("/book-comments/:id", async ({ params: { id }, set }) => {
        const comment = await BookComment.findByIdAndDelete(id);
        if (!comment) {
          set.status = 404;
          return { error: "Comment not found" };
        }
        return { message: "Comment deleted" };
      })
      .patch("/book-requests/:id/reject", async ({ params: { id }, set }) => {
        const request = await BookRequest.findById(id);
        if (!request) {
          set.status = 404;
          return { error: "Book request not found" };
        }
        if (request.status !== "pending") {
          set.status = 409;
          return { error: `Request is already ${request.status}` };
        }

        request.status = "rejected";
        await request.save();

        return { message: "Book request rejected", request };
      }),
  )
  .post(
    "/book-requests",
    async ({ body }) => {
      const bookAlreadyExists = await Book.exists({
        title: { $regex: `^${body.title}$`, $options: "i" },
        quantity: { $gt: 0 },
      });

      const request = await BookRequest.create(body);
      return {
        message: `Book request submitted${bookAlreadyExists ? ", a book with the same title exists if u want to check it" : ""}`,
        request,
      };
    },
    {
      body: t.Object({
        title: t.String({ minLength: 1 }),
        author: t.Optional(t.String()),
        notes: t.Optional(t.String()),
      }),
    },
  )

  .post(
    "/book-comments/:bookId",
    async ({ body, set, params: { bookId } }) => {
      const book = await Book.findById(bookId);
      if (!book) {
        set.status = 404;
        return { error: "Book not found" };
      }
      const comment = await BookComment.create({ ...body, bookId });
      return { message: "Comment submitted", comment };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        comment: t.String({ minLength: 1 }),
        rating: t.Optional(t.Number({ minimum: 1, maximum: 5 })),
      }),
    },
  )

  .post(
    "/orders",
    async ({ body, set }) => {
      const existingCustomer = await Customer.findOne({ phone: body.phone });
      if (existingCustomer) {
        const bookIds = body.items.map((i) => new mongoose.Types.ObjectId(i.bookId));
        const duplicateOrder = await Order.findOne({
          customer: existingCustomer._id,
          status: "pending",
          "items.book": { $all: bookIds },
        });
        if (duplicateOrder) {
          set.status = 409;
          return {
            error: "You already have a pending order with the same books",
          };
        }
      }
      for (const item of body.items) {
        const book = await Book.findById(item.bookId);
        if (!book) {
          set.status = 404;
          return { error: `Book ${item.bookId} not found` };
        }
        if (book.quantity < item.quantity) {
          set.status = 409;
          return {
            error: `Not enough stock for "${book.title}", only ${book.quantity} left`,
          };
        }
      }

      const customer = await Customer.create({
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        address: body.address,
      });

      const order = await Order.create({
        customer: customer._id,
        items: body.items.map((i) => ({
          book: i.bookId,
          quantity: i.quantity,
        })),
        status: "pending",
        delivery: body.delivery ?? "home",
      });

      return {
        message: "Order placed successfully, we will contact you soon",
        order,
      };
    },
    {
      body: t.Object({
        firstName: t.String({ minLength: 2 }),
        lastName: t.String({ minLength: 2 }),
        phone: t.String({ minLength: 8 }),
        address: t.Optional(t.String()),
        delivery: t.Optional(t.Union([t.Literal("home"), t.Literal("bureau")])),
        items: t.Array(
          t.Object({
            bookId: t.String(),
            quantity: t.Number({ minimum: 1 }),
          }),
          { minItems: 1 },
        ),
      }),
    },
  )
  .get("/book-comments/:bookId", async ({ params: { bookId } }) => {
    const comments = await BookComment.find({ bookId }).sort({
      createdAt: -1,
    });
    return { data: comments, total: comments.length };
  });

export default bookPlugin;
