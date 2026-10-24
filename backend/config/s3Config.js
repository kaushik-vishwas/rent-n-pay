import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const S3_BUCKET = process.env.AWS_S3_BUCKET_NAME;

// Optional CDN/custom domain (e.g. CloudFront). Falls back to the bucket URL.
export const S3_PUBLIC_BASE_URL = (
  process.env.AWS_S3_PUBLIC_BASE_URL ||
  `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`
).replace(/\/+$/, '');

export default s3;
