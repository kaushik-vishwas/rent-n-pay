import crypto from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3, { S3_BUCKET, S3_PUBLIC_BASE_URL } from './s3Config.js';

// Uploads now go to S3. Function names and the `secure_url` result field are
// kept so existing controllers work unchanged.

const detectFileType = (buf) => {
  if (!buf || buf.length < 12) return { ext: 'bin', mime: 'application/octet-stream' };
  const hex = buf.subarray(0, 12).toString('hex');
  const ascii = buf.subarray(0, 12).toString('latin1');

  if (hex.startsWith('ffd8ff')) return { ext: 'jpg', mime: 'image/jpeg' };
  if (hex.startsWith('89504e47')) return { ext: 'png', mime: 'image/png' };
  if (ascii.startsWith('GIF8')) return { ext: 'gif', mime: 'image/gif' };
  if (ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WEBP') {
    return { ext: 'webp', mime: 'image/webp' };
  }
  if (ascii.startsWith('%PDF')) return { ext: 'pdf', mime: 'application/pdf' };
  if (ascii.slice(4, 8) === 'ftyp') {
    const brand = ascii.slice(8, 12);
    if (brand.startsWith('heic') || brand.startsWith('heix') || brand.startsWith('mif1')) {
      return { ext: 'heic', mime: 'image/heic' };
    }
    if (brand.startsWith('avif')) return { ext: 'avif', mime: 'image/avif' };
    if (brand.startsWith('qt')) return { ext: 'mov', mime: 'video/quicktime' };
    return { ext: 'mp4', mime: 'video/mp4' };
  }
  if (hex.startsWith('1a45dfa3')) return { ext: 'webm', mime: 'video/webm' };
  if (ascii.trimStart().startsWith('<svg') || ascii.trimStart().startsWith('<?xml')) {
    return { ext: 'svg', mime: 'image/svg+xml' };
  }
  return { ext: 'bin', mime: 'application/octet-stream' };
};

const uploadToS3 = async (fileBuffer, folder, resourceType) => {
  const { ext, mime } = detectFileType(fileBuffer);
  const cleanFolder = String(folder || 'uploads').replace(/^\/+|\/+$/g, '');
  const publicId = `${cleanFolder}/${Date.now()}-${crypto.randomUUID()}`;
  const key = `${publicId}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: mime,
    }),
  );

  const url = `${S3_PUBLIC_BASE_URL}/${key}`;
  return {
    secure_url: url,
    url,
    public_id: publicId,
    key,
    format: ext,
    resource_type: resourceType === 'auto' ? mime.split('/')[0] : resourceType,
    bytes: fileBuffer.length,
  };
};

export const uploadImageToCloudinary = (fileBuffer, folder) =>
  uploadToS3(fileBuffer, folder, 'image');

export const uploadRawToCloudinary = (fileBuffer, folder) =>
  uploadToS3(fileBuffer, folder, 'raw');

export const uploadMediaToCloudinary = (fileBuffer, folder) =>
  uploadToS3(fileBuffer, folder, 'auto');
