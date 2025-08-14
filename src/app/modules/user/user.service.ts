// src/app/modules/user/user.service.ts
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES, STATUS } from '../../../enums/user';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import unlinkFile from '../../../shared/unlinkFile';
import AppError from '../../errors/AppError';

const createUserFromDb = async (payload: IUser) => {
  payload.role = USER_ROLES.USER;

  const result = await User.create(payload);
  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  const otp = generateOTP();
  const emailValues = {
    name: result.fullName,
    otp,
    email: result.email,
  };

  const accountEmailTemplate = emailTemplate.createAccount(emailValues);
  emailHelper.sendEmail(accountEmailTemplate);

  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 20 * 60000),
  };

  const updatedUser = await User.findOneAndUpdate(
    { _id: result._id },
    { $set: { authentication } },
    { new: true },
  );

  if (!updatedUser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found for update');
  }

  return result;
};

const getAllUsers = async (query: Record<string, unknown>) => {
  const {
    page = 1,
    limit = 10,
    role,
    status,
    verified,
    isSubscribed,
    search,
  } = query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build filter object
  const filter: Record<string, unknown> = { isDeleted: false };

  if (role) filter.role = role;
  if (status) filter.status = status;
  if (verified !== undefined) filter.verified = verified === 'true';
  if (isSubscribed !== undefined) filter.isSubscribed = isSubscribed === 'true';

  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phoneNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const result = await User.find(filter)
    .select('-password -authentication')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean({ virtuals: true });

  const totalData = await User.countDocuments(filter);

  return {
    result,
    totalData,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(totalData / limitNum),
  };
};

const getMe = async (userId: string): Promise<Partial<IUser>> => {
  const user = await User.findById(userId)
    .select('-password -authentication')
    .lean({ virtuals: true });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return user;
};

const updateProfile = async (
  user: JwtPayload,
  payload: Partial<IUser>,
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const existingUser = await User.findById(id);

  if (!existingUser) {
    throw new AppError(StatusCodes.NOT_FOUND, "User doesn't exist!");
  }

  if (!existingUser.verified) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Please verify your account first',
    );
  }

  if (existingUser.isDeleted) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'User account is deleted');
  }

  const updatedUser = await User.findByIdAndUpdate(id, payload, {
    new: true,
    select: '-password -authentication',
  });

  return updatedUser;
};

const updateProfileImage = async (
  userId: string,
  imagePath: string,
): Promise<Partial<IUser | null>> => {
  const existingUser = await User.findById(userId);

  if (!existingUser) {
    throw new AppError(StatusCodes.NOT_FOUND, "User doesn't exist!");
  }

  if (!existingUser.verified) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Please verify your account first',
    );
  }

  // Remove old image if exists
  if (existingUser.image) {
    unlinkFile(existingUser.image);
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { image: imagePath },
    {
      new: true,
      select: '-password -authentication',
    },
  );

  return updatedUser;
};

const getSingleUser = async (id: string): Promise<IUser | null> => {
  const result = await User.findById(id)
    .select('-password -authentication')
    .lean({ virtuals: true });

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return result;
};

const searchUserByPhone = async (searchTerm: string, userId: string) => {
  const filter: Record<string, unknown> = {
    _id: { $ne: userId },
    isDeleted: false,
  };

  if (searchTerm) {
    filter.$or = [
      { phoneNumber: { $regex: searchTerm, $options: 'i' } },
      { fullName: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  const result = await User.find(filter)
    .select('fullName email phoneNumber image')
    .limit(10)
    .lean();

  return result;
};

const deleteUserAccount = async (userId: string, requesterId: string) => {
  const userToDelete = await User.findById(userId);
  const requester = await User.findById(requesterId);

  if (!userToDelete) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (!requester) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Requester not found');
  }

  // Self-deletion
  if (userId === requesterId) {
    if (
      userToDelete.role === USER_ROLES.ADMIN ||
      userToDelete.role === USER_ROLES.SUPER_ADMIN
    ) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        'Admins cannot delete their own accounts',
      );
    }

    // Soft delete
    await User.findByIdAndUpdate(userId, {
      isDeleted: true,
      status: STATUS.DELETED,
      email: `deleted_${Date.now()}_${userToDelete.email}`, // Prevent email conflicts
    });

    return { message: 'Account deleted successfully' };
  }

  // Admin deletion
  if (
    requester.role !== USER_ROLES.ADMIN &&
    requester.role !== USER_ROLES.SUPER_ADMIN
  ) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Only admins can delete other users',
    );
  }

  // Prevent deletion of admin/super admin accounts
  if (
    userToDelete.role === USER_ROLES.ADMIN ||
    userToDelete.role === USER_ROLES.SUPER_ADMIN
  ) {
    throw new AppError(StatusCodes.FORBIDDEN, 'Cannot delete admin accounts');
  }

  // Only SUPER_ADMIN can delete ADMIN
  if (
    userToDelete.role === USER_ROLES.ADMIN &&
    requester.role !== USER_ROLES.SUPER_ADMIN
  ) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Only Super Admin can delete Admin accounts',
    );
  }

  await User.findByIdAndUpdate(userId, {
    isDeleted: true,
    status: STATUS.DELETED,
    email: `deleted_${Date.now()}_${userToDelete.email}`,
  });

  return { message: 'User deleted successfully' };
};

const adminUpdateUser = async (
  adminId: string,
  userId: string,
  payload: Partial<IUser>,
) => {
  const admin = await User.findById(adminId);
  const userToUpdate = await User.findById(userId);

  if (!admin) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Admin not found');
  }

  if (!userToUpdate) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (
    admin.role !== USER_ROLES.ADMIN &&
    admin.role !== USER_ROLES.SUPER_ADMIN
  ) {
    throw new AppError(StatusCodes.FORBIDDEN, 'Only admins can update users');
  }

  // Prevent role changes to admin roles by non-super-admins
  if (
    payload.role &&
    (payload.role === USER_ROLES.ADMIN ||
      payload.role === USER_ROLES.SUPER_ADMIN) &&
    admin.role !== USER_ROLES.SUPER_ADMIN
  ) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Only Super Admin can assign admin roles',
    );
  }

  // Prevent updating other admins unless super admin
  if (
    (userToUpdate.role === USER_ROLES.ADMIN ||
      userToUpdate.role === USER_ROLES.SUPER_ADMIN) &&
    admin.role !== USER_ROLES.SUPER_ADMIN
  ) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Only Super Admin can update admin accounts',
    );
  }

  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    select: '-password -authentication',
  });

  return updatedUser;
};

const changeUserStatus = async (
  adminId: string,
  userId: string,
  status: STATUS,
) => {
  return adminUpdateUser(adminId, userId, { status });
};

export const UserService = {
  createUserFromDb,
  getMe,
  updateProfile,
  updateProfileImage,
  getSingleUser,
  searchUserByPhone,
  getAllUsers,
  deleteUserAccount,
  adminUpdateUser,
  changeUserStatus,
};
