export type IVerifyEmail = {
  email_address: string;
  oneTimeCode: number;
};

export type ILoginData = {
  email_address: string;
  password: string;
};

export type IAuthResetPassword = {
  newPassword: string;
  confirmPassword: string;
};

export type IChangePassword = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
