/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import { emailHelper } from '../../../helpers/emailHelper';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import {
  IAuthResetPassword,
  IChangePassword,
  ILoginData,
  IVerifyEmail,
} from '../../../types/auth';
// import cryptoToken from '../../../util/cryptoToken';
import generateOTP from '../../../util/generateOTP';

import { User } from '../user/user.model';
import { ResetToken } from '../resetToken/resetToken.model';
import AppError from '../../errors/AppError';
import unlinkFile from '../../../shared/unlinkFile';
import { downloadImage, facebookToken } from './auth.lib';

//login
const loginUserFromDB = async (payload: ILoginData) => {
  const { email, password } = payload;
  const isExistUser = await User.findOne({ email }).select('+password');
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //check verified and status
  if (!isExistUser.verified) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Please verify your account, then try to login again',
    );
  }

  //check match password
  if (
    password &&
    !(await User.isMatchPassword(password, isExistUser.password))
  ) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Password is incorrect!');
  }

  const tokenPayload = {
    id: isExistUser._id,
    role: isExistUser.role,
    email: isExistUser.email,
  };

  //create access token
  const accessToken = jwtHelper.createToken(
    tokenPayload,
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string,
  );

  //create refresh token
  const refreshToken = jwtHelper.createToken(
    tokenPayload,
    config.jwt.jwtRefreshSecret as Secret,
    config.jwt.jwtRefreshExpiresIn as string,
  );

  // send user data without password
  const { password: _, ...userWithoutPassword } = isExistUser.toObject();

  return { user: userWithoutPassword, accessToken, refreshToken };
};

//forget password
const forgetPasswordToDB = async (email: string) => {
  const isExistUser = await User.isExistUserByEmail(email);
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //send mail
  const otp = generateOTP();
  const value = {
    otp,
    email: isExistUser.email,
  };
  const forgetPassword = emailTemplate.resetPassword(value);
  emailHelper.sendEmail(forgetPassword);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 20 * 60000),
  };
  await User.findOneAndUpdate({ email }, { $set: { authentication } });
};

const verifyEmailToDB = async (payload: IVerifyEmail) => {
  const { email, oneTimeCode } = payload;

  const isExistUser = await User.findOne({ email }).select('+authentication');
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (!oneTimeCode) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Please give the otp, check your email we send a code',
    );
  }

  // console.log(isExistUser.authentication?.oneTimeCode, { payload });
  if (isExistUser.authentication?.oneTimeCode !== oneTimeCode) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'You provided wrong otp');
  }

  const date = new Date();
  if (date > isExistUser.authentication?.expireAt) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Otp already expired, Please try again',
    );
  }

  const tokenPayload = {
    id: isExistUser._id,
    role: isExistUser.role,
    email: isExistUser.email,
  };

  //create access token
  const accessToken = jwtHelper.createToken(
    tokenPayload,
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string,
  );

  //create refresh token
  const refreshToken = jwtHelper.createToken(
    tokenPayload,
    config.jwt.jwtRefreshSecret as Secret,
    config.jwt.jwtRefreshExpiresIn as string,
  );

  let message;
  let data;

  if (!isExistUser.verified) {
    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      { verified: true, authentication: { oneTimeCode: null, expireAt: null } },
    );
    message = 'Your email has been successfully verified.';
    data = { user: isExistUser, accessToken, refreshToken };
  } else {
    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      {
        authentication: {
          isResetPassword: true,
          oneTimeCode: null,
          expireAt: null,
        },
      },
    );

    // const createToken = cryptoToken();
    await ResetToken.create({
      user: isExistUser._id,
      token: accessToken,
      expireAt: new Date(Date.now() + 20 * 60000),
    });
    message = 'Verification Successful';
    data = { user: isExistUser, accessToken, refreshToken };
  }

  return { data, message };
};

const resetPasswordToDB = async (
  token: string,
  payload: IAuthResetPassword,
) => {
  const { newPassword, confirmPassword } = payload;

  //isExist token
  const isExistToken = await ResetToken.isExistToken(token);

  if (!isExistToken) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
  }

  //user permission check
  const isExistUser = await User.findById(isExistToken.user).select(
    '+authentication',
  );
  if (!isExistUser?.authentication?.isResetPassword) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "You don't have permission to change the password. Please click again to 'Forgot Password'",
    );
  }

  //validity check
  const isValid = await ResetToken.isExpireToken(token);
  if (!isValid) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Token expired, Please click again to the forget password',
    );
  }

  //check password
  if (newPassword !== confirmPassword) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "New password and Confirm password doesn't match!",
    );
  }

  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const updateData = {
    password: hashPassword,
    authentication: {
      isResetPassword: false,
    },
  };

  await User.findOneAndUpdate({ _id: isExistToken.user }, updateData, {
    new: true,
  });
};

const changePasswordToDB = async (
  user: JwtPayload,
  payload: IChangePassword,
) => {
  const { currentPassword, newPassword, confirmPassword } = payload;

  const isExistUser = await User.findById(user.id).select('+password');
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //current password match
  if (
    currentPassword &&
    !(await User.isMatchPassword(currentPassword, isExistUser.password))
  ) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Password is incorrect');
  }

  //newPassword and current password
  if (currentPassword === newPassword) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Please give different password from current password',
    );
  }
  //new password and confirm password check
  if (newPassword !== confirmPassword) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Password and Confirm password doesn't matched",
    );
  }

  //hash password
  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const updateData = {
    password: hashPassword,
  };
  await User.findOneAndUpdate({ _id: user.id }, updateData, { new: true });
};

const deleteAccountToDB = async (user: JwtPayload) => {
  const result = await User.findByIdAndDelete(user?.id);
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No User found');
  }

  return result;
};

const newAccessTokenToUser = async (token: string) => {
  // Check if the token is provided
  if (!token) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Token is required!');
  }

  const verifyUser = jwtHelper.verifyToken(
    token,
    config.jwt.jwtRefreshSecret as Secret,
  );

  const isExistUser = await User.findById(verifyUser?.id);
  if (!isExistUser) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized access');
  }

  //create token
  const accessToken = jwtHelper.createToken(
    { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string,
  );

  return { accessToken };
};

const resendVerificationEmailToDB = async (email: string) => {
  // Find the user by ID
  const existingUser: any = await User.findOne({ email: email }).lean();

  if (!existingUser) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'User with this email does not exist!',
    );
  }

  if (existingUser?.isVerified) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'User is already verified!');
  }

  // Generate OTP and prepare email
  const otp = generateOTP();
  const emailValues = {
    name: existingUser.name,
    otp,
    email: existingUser.email,
  };
  const accountEmailTemplate = emailTemplate.createAccount(emailValues);
  emailHelper.sendEmail(accountEmailTemplate);

  // Update user with authentication details
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 20 * 60000),
  };

  await User.findOneAndUpdate(
    { email: email },
    { $set: { authentication } },
    { new: true },
  );
};

//! login with google

// interface IGoogleLoginPayload {
//   email: string;
//   name: string;
//   image?: string;
//   uid: string;
// }

// const googleLogin = async (payload: IGoogleLoginPayload) => {
//   const { email, name, image, uid } = payload;

//   if (!email || !uid) {
//     throw new AppError(StatusCodes.BAD_REQUEST, 'Email and UID are required');
//   }

//   // Check if user exists by email
//   let user = await User.findOne({ email });

//   if (user?.image && image) {
//     unlinkFile(user?.image);
//   }

//   if (!user) {
//     // Create new user if doesn't exist
//     user = await User.create({
//       email,
//       name,
//       image: image || '',
//       googleId: uid,
//       role: 'USER',
//       verified: true, // Google accounts are pre-verified
//     });
//   } else if (!user.googleId) {
//     // Update existing user with Google ID if they haven't logged in with Google before
//     user = await User.findByIdAndUpdate(
//       user._id,
//       {
//         googleId: uid,
//         verified: true,
//         image: image || user.image, // Keep existing image if no new image provided
//       },
//       { new: true },
//     );
//   }

//   if (!user) {
//     throw new AppError(
//       StatusCodes.INTERNAL_SERVER_ERROR,
//       'Failed to create or update user',
//     );
//   }

//   // Generate tokens for authentication
//   const tokenPayload = {
//     id: user._id,
//     email: user.email,
//     role: user.role,
//   };

//   const accessToken = jwtHelper.createToken(
//     tokenPayload,
//     config.jwt.jwt_secret as Secret,
//     config.jwt.jwt_expire_in as string,
//   );

//   const refreshToken = jwtHelper.createToken(
//     tokenPayload,
//     config.jwt.jwtRefreshSecret as Secret,
//     config.jwt.jwtRefreshExpiresIn as string,
//   );

//   // Remove sensitive data before sending response
//   const userObject: any = user.toObject();
//   delete userObject.password;
//   delete userObject.authentication;

//   return {
//     user: userObject,
//     accessToken,
//     refreshToken,
//   };
// };

// const facebookLogin = async (payload: { token: string }) => {
//   if (!payload.token) {
//     throw new AppError(StatusCodes.BAD_REQUEST, 'Facebook token is required');
//   }

//   try {
//     const userData = await facebookToken(payload.token);

//     if (!userData?.email) {
//       throw new AppError(
//         StatusCodes.BAD_REQUEST,
//         'Unable to get email from Facebook account',
//       );
//     }

//     // Download Facebook image and get local URL/path
//     let localImage = '';
//     if (userData.picture?.data?.url) {
//       localImage = await downloadImage(
//         userData.picture.data.url,
//         userData?.id || '',
//       );
//     }

//     const userFields = {
//       name: userData.name || '',
//       email: userData.email,
//       image: localImage || '',
//       facebookId: userData.id,
//       role: 'USER' as const,
//       verified: true,
//     };

//     let user = await User.findOne({
//       $or: [{ email: userData.email }, { facebookId: userData.id }],
//     });

//     if (user?.image && localImage) {
//       unlinkFile(user?.image);
//     }

//     if (!user) {
//       user = await User.create(userFields);
//     } else if (!user.facebookId) {
//       user = await User.findByIdAndUpdate(
//         user._id,
//         {
//           ...userFields,
//           image: userFields.image || user.image,
//           name: userFields.name || user.name,
//         },
//         { new: true },
//       );
//     }

//     if (!user) {
//       throw new AppError(
//         StatusCodes.INTERNAL_SERVER_ERROR,
//         'Failed to create or update user',
//       );
//     }

//     const tokenPayload = {
//       id: user._id,
//       email: user.email,
//       role: user.role,
//     };

//     const [accessToken, refreshToken] = await Promise.all([
//       jwtHelper.createToken(
//         tokenPayload,
//         config.jwt.jwt_secret as Secret,
//         config.jwt.jwt_expire_in as string,
//       ),
//       jwtHelper.createToken(
//         tokenPayload,
//         config.jwt.jwtRefreshSecret as Secret,
//         config.jwt.jwtRefreshExpiresIn as string,
//       ),
//     ]);

//     const { password, authentication, ...userObject } = user.toObject();

//     return { user: userObject, accessToken, refreshToken };
//   } catch (error) {
//     if (error instanceof AppError) throw error;
//     throw new AppError(
//       StatusCodes.INTERNAL_SERVER_ERROR,
//       'Error processing Facebook login',
//     );
//   }
// };

export const AuthService = {
  verifyEmailToDB,
  loginUserFromDB,
  forgetPasswordToDB,
  resetPasswordToDB,
  changePasswordToDB,
  deleteAccountToDB,
  newAccessTokenToUser,
  resendVerificationEmailToDB,
};
