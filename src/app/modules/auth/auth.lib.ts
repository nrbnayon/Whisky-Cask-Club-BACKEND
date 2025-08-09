/* eslint-disable no-undef */
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

import { logger } from '../../../shared/logger';

export const facebookToken = async (token: string) =>
  (
    await axios.get(
      `https://graph.facebook.com/me?access_token=${token}&fields=name,email,picture.width(300).height(300)`,
    )
  ).data;

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'images');

export const downloadImage = async (
  imageUrl: string,
  id: string,
): Promise<string> => {
  try {
    logger.info(`Downloading image from ${imageUrl}`);

    // Ensure upload directory exists
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    // Download image
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 5000, // 5 second timeout
    });

    // Generate filename with extension
    const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
    const filename = `${id}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Save file
    await fs.writeFile(filepath, response.data);
    logger.info(`Image saved to ${filepath}`);

    // Return public URL path
    return `/uploads/images/${filename}`;
  } catch (error) {
    logger.error(`Failed to download image: ${error}`);
    throw new Error(`Failed to download image: ${error}`);
  }
};
