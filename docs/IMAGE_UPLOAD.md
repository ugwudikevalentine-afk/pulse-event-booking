
Image Upload Guide
PULSE uses image URLs for event photos by default. This keeps the starter kit simple and avoids forcing a specific storage provider on you.

If you want admins to upload images directly from their computer, follow one of the guides below.

Option 1: Cloudinary (Easiest)
Sign up at cloudinary.com (free tier: 25GB storage)
Install the SDK:
Bash

npm install cloudinary
Add to .env:
text

CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
Create src/lib/cloudinary.ts:
TypeScript

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "pulse-events",
  });

  return result.secure_url;
}
Add a file input to your admin event form and call uploadImage() before saving.
Option 2: Vercel Blob (Best for Vercel deployments)
Install:
Bash

npm install @vercel/blob
Enable Blob storage in your Vercel project dashboard.
Create src/lib/blob.ts:
TypeScript

import { put } from "@vercel/blob";

export async function uploadImage(file: File): Promise<string> {
  const blob = await put(`events/${file.name}`, file, {
    access: "public",
  });
  return blob.url;
}
Option 3: AWS S3
Install:
Bash

npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
Add to .env:
text

AWS_ACCESS_KEY_ID="your_key"
AWS_SECRET_ACCESS_KEY="your_secret"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"
Create an upload helper using the S3 client.
Security Tips
Validate file types (only allow jpg, png, webp)
Limit file size (recommend 5MB max)
Use server-side uploads, never expose API keys to the browser
Consider using presigned URLs for direct-to-storage uploads
