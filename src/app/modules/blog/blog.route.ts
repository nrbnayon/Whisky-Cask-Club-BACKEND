import fileUploadHandler from '../../middlewares/fileUploadHandler';
import express, { NextFunction, Request, Response } from 'express';
import { BlogController } from './blog.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post(
  '/create-blog',
  auth(USER_ROLES.ADMIN),
  fileUploadHandler(),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  BlogController.createBlog,
);

router.patch(
  '/update-blog/:id',
  auth(USER_ROLES.ADMIN),
  fileUploadHandler(),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  BlogController.updateBlogById,
);

router.get('/all-blogs', BlogController.getAllBlogs);

router.get('/blog-details/:id', BlogController.getBlogById);

router.delete(
  '/delete-blog/:id',
  auth(USER_ROLES.ADMIN),
  BlogController.deleteBlogById,
);

export const BlogRoutes = router;
