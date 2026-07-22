import { Elysia, t } from "elysia";

const cloudName = Bun.env.CLOUDINARY_CLOUD_NAME!;
const apiKey = Bun.env.CLOUDINARY_API_KEY!;
const apiSecret = Bun.env.CLOUDINARY_API_SECRET!;

export default new Elysia().post(
  "/upload",
  async ({ body, set }) => {
    const timestamp = Math.round(Date.now() / 1000);
    const str = `timestamp=${timestamp}${apiSecret}`;
    const signature = Array.from(
      new Uint8Array(
        await crypto.subtle.digest("SHA-1", new TextEncoder().encode(str)),
      ),
    )
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const formData = new FormData();
    formData.append("file", body.image);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!res.ok) {
      const err = await res.json();
      set.status = 400;
      return { error: err.error?.message || "Upload failed" };
    }

    const data = await res.json();
    return { url: data.secure_url };
  },
  {
    body: t.Object({
      image: t.String(),
    }),
  },
);
