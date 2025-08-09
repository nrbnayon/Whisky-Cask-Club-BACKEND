//create blog by author

import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { IBlog } from './blog.interface';
import { Blog } from './blog.model';
import { Types } from 'mongoose';
import unlinkFile from '../../../shared/unlinkFile';

const createBlog = async (userId: string, payload: IBlog) => {
  payload.author = new Types.ObjectId(userId);
  const isExistUser = await User.isExistUserById(userId);

  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (isExistUser.role !== 'ADMIN') {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'You are not a valid person to create blog',
    );
  }

  if (!isExistUser.verified) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Please verify your account first',
    );
  }

  const createBlog = await Blog.create(payload);

  return createBlog;
};

// get all blogs with pagination
const getAllBlogs = async (query: Record<string, unknown>) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const blogs = await Blog.find()
    .skip(skip)
    .limit(size)
    .populate('author', 'name email');

  const totalBlogs = await Blog.countDocuments();
  const totalPages = Math.ceil(totalBlogs / size);

  return {
    metadata: {
      totalBlogs,
      totalPages,
      currentPage: pages,
      pageSize: size,
    },
    blogs,
  };
};

// get blog by id
const getBlogById = async (id: string) => {
  const existBlog = await Blog.findById(id).populate('author', 'name email');

  if (!existBlog) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Blog not found');
  }

  return existBlog;
};

// update blog by id

const updateBlogById = async (
  blogId: string,
  userId: string,
  payload: Partial<IBlog>,
): Promise<Partial<IBlog | null>> => {
  const existBlog = await Blog.findById(blogId);

  const isExistUser = await User.isExistUserById(userId);

  if (!existBlog) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Blog not found');
  }

  if (!isExistUser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (isExistUser.role !== 'ADMIN') {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to update this blog',
    );
  }

  if (payload.image && existBlog.image) {
    unlinkFile(existBlog.image);
  }

  const updateDoc = await Blog.findOneAndUpdate({ _id: blogId }, payload, {
    new: true,
  });

  return updateDoc;
};

// delete blog by id

const deleteBlogById = async (blogId: string, userId: string) => {
  const existBlog = await Blog.findById(blogId);

  if (!existBlog) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Blog not found');
  }

  const isExistUser = await User.isExistUserById(userId);

  if (!isExistUser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (isExistUser.role !== 'ADMIN') {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to delete this blog',
    );
  }

  await Blog.findByIdAndDelete(blogId);
};

export const BlogServices = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlogById,
  deleteBlogById,
};
