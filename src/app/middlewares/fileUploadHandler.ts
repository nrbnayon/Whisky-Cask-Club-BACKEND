/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import { Request } from 'express';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import AppError from '../errors/AppError';

const fileUploadHandler = () => {
  //create upload folder
  const baseUploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir);
  }

  //folder create for different file
  const createDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  };

  //create filename
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadDir;
      switch (file.fieldname) {
        case 'image':
          uploadDir = path.join(baseUploadDir, 'images');
          break;
        case 'gifImage':
          uploadDir = path.join(baseUploadDir, 'gifImage');
          break;

        case 'media':
          uploadDir = path.join(baseUploadDir, 'medias');
          break;
        case 'doc':
          uploadDir = path.join(baseUploadDir, 'docs');
          break;
        default:
          throw new AppError(StatusCodes.BAD_REQUEST, 'File is not supported');
      }
      createDir(uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName =
        file.originalname
          .replace(fileExt, '')
          .toLowerCase()
          .split(' ')
          .join('-') +
        '-' +
        Date.now();
      cb(null, fileName + fileExt);
    },
  });

  const filterFilter = (req: Request, file: any, cb: FileFilterCallback) => {
    if (file.fieldname === 'image' || file.fieldname === 'coverPhoto') {
      // Allow all images without checking the type

      // //TODO: update file system
      // if (file.mimetype === 'image/gif' || file.mimetype.startsWith('image/')) {
      //   cb(null, true);
      // }

      cb(null, true);
    } else if (file.fieldname === 'gifImage') {
      if (file.mimetype === 'image/gif') {
        cb(null, true);
      } else {
        cb(new AppError(StatusCodes.BAD_REQUEST, 'Only .gif file supported'));
      }
    } else if (file.fieldname === 'media') {
      if (file.mimetype === 'video/mp4' || file.mimetype === 'audio/mpeg') {
        cb(null, true);
      } else {
        cb(
          new AppError(
            StatusCodes.BAD_REQUEST,
            'Only .mp4, .mp3 file supported',
          ),
        );
      }
    } else if (file.fieldname === 'doc') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new AppError(StatusCodes.BAD_REQUEST, 'Only pdf supported'));
      }
    } else {
      throw new AppError(StatusCodes.BAD_REQUEST, 'This file is not supported');
    }
  };

  const upload = multer({
    storage: storage,
    fileFilter: filterFilter,
  }).fields([
    { name: 'gifImage', maxCount: 10 },
    { name: 'image', maxCount: 10 },
    { name: 'coverPhoto', maxCount: 10 },
    { name: 'media', maxCount: 10 },
    { name: 'doc', maxCount: 10 },
  ]);
  return upload;
};

export default fileUploadHandler;
