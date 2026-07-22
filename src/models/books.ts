import * as mongoose from "mongoose";

export interface IAuthor extends Document {
  name: string;
  bio?: string;
  nationality?: string;
  createdAt: Date;
  birthYear: number;
}

const AuthorSchema = new mongoose.Schema<IAuthor>(
  {
    name: { type: String, required: true, trim: true },
    bio: { type: String, trim: true },
    nationality: { type: String, trim: true },
    birthYear: { type: Number, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
AuthorSchema.index(
  { name: 1, bio: 1, nationality: 1, birthYear: 1 },
  { unique: true },
);

export const Author = mongoose.model<IAuthor>("Author", AuthorSchema);

export interface IBook extends Document {
  title: string;
  authors: mongoose.Types.ObjectId[];
  isbn?: string;
  genre?: string;
  publishedYear?: number;
  quantity: number;
  createdAt: Date;
  edition?: number;
  cover?: string;
  price?: number;
  language?: string;
  description?: string;
  avgRating?: number;
  ratingCount?: number;
}

const BookSchema = new mongoose.Schema<IBook>(
  {
    title: { type: String, required: true, trim: true },
    authors: [{ type: mongoose.Types.ObjectId, ref: "Author", required: true }],
    isbn: { type: String, sparse: true, trim: true },
    genre: { type: String, trim: true },
    publishedYear: { type: Number },
    edition: { type: Number, min: 1, default: 1 },
    quantity: { type: Number, required: true, default: 1, min: 0 },
    cover: { type: String },
    price: { type: Number, min: 0 },
    language: { type: String, default: "arabic", trim: true },
    description: { type: String, trim: true },
    avgRating: { type: Number, default: 4, min: 0, max: 5 },
    ratingCount: { type: Number, default: 1, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
BookSchema.index({ isbn: 1, edition: 1 }, { unique: true });

export const Book = mongoose.model<IBook>("Book", BookSchema);

const OrderStatus = ["pending", "sold", "delivered", "canceled"] as const;
export type OrderStatus = (typeof OrderStatus)[number];

export interface ICustomer extends Document {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
}

const CustomerSchema = new mongoose.Schema<ICustomer>({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
});

export const Customer = mongoose.model<ICustomer>("Customer", CustomerSchema);

interface IOrderItem {
  book: mongoose.Types.ObjectId;
  quantity: number;
}

export interface IOrder extends Document {
  customer: mongoose.Types.ObjectId;
  items: IOrderItem[];
  status: "pending" | "sold" | "delivered" | "canceled";
  delivery: "home" | "bureau";
  notes?: string;
}

const ORDER_STATUSES = ["pending", "sold", "delivered", "canceled"] as const;

const OrderSchema = new mongoose.Schema<IOrder>(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    items: [
      {
        book: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1, default: 1 },
      },
    ],
    status: { type: String, enum: ORDER_STATUSES, default: "pending" },
    delivery: { type: String, enum: ["home", "bureau"], default: "home" },
    notes: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Order = mongoose.model<IOrder>("Order", OrderSchema);

const RequestStatus = ["pending", "acquired", "rejected"] as const;
export type RequestStatus = (typeof RequestStatus)[number];

export interface IBookRequest extends Document {
  title: string;
  author?: string;
  notes?: string;
  status: RequestStatus;
  createdAt: Date;
}

const BookRequestSchema = new mongoose.Schema<IBookRequest>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, trim: true },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: RequestStatus,
      default: "pending",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const BookRequest = mongoose.model<IBookRequest>(
  "BookRequest",
  BookRequestSchema,
);

export interface IBookComment extends Document {
  bookId: mongoose.Types.ObjectId;
  name: string;
  comment: string;
  rating?: number;
  createdAt: Date;
}

const BookCommentSchema = new mongoose.Schema<IBookComment>(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    comment: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const BookComment = mongoose.model<IBookComment>(
  "BookComment",
  BookCommentSchema,
);
