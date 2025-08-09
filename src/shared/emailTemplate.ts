import {
  ICreateAccount,
  INewsletterSubscriber,
  IResetPassword,
} from '../types/emailTamplate';

const createAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: 'Verify your account',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://i.ibb.co.com/Ldk41QBs/bbr.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
          <h2 style="color: #f9f9f9; font-size: 24px; margin-bottom: 20px;">Hi ${values.name},</h2>
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
            <div style="background-color: #FB9400; width: 120px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 20 minutes.</p>
              <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;text-align:left">If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};

const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: 'Reset your password',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://i.ibb.co.com/Ldk41QBs/bbr.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
            <div style="background-color: #FB9400; width: 120px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 20 minutes.</p>
              <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;text-align:left">If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};

const newsLetter = (values: INewsletterSubscriber) => {
  const data = {
    to: values.email,
    subject: 'Welcome to Our Newsletter!', // Changed from password reset
    html: `
    <body style="font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 30px auto; padding: 0 20px;">
        <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <div style="background: rgba(59, 130, 246, 0.5); padding: 24px 32px; text-align: center;">
            <h2 style="color: #fff; margin: 0; font-size: 22px; font-weight: 600;">Thanks for Subscribing!</h2>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px;">
            <h1 style="color: #1e293b; font-size: 24px; margin: 0 0 24px; font-weight: 600;">Welcome, ${values.name}!</h1>
            <p style="color: #64748b; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
              Thank you for subscribing to <strong>Our Newsletter</strong> with the email <strong>${values.email}</strong>. 
              We appreciate your interest!
            </p>
            
            <div style="background-color: rgba(59, 130, 246, 0.1); border-left: 4px solid rgba(59, 130, 246, 0.5); padding: 16px; margin: 24px 0; border-radius: 0 4px 4px 0;">
              <p style="color: #334155; font-size: 15px; margin: 0; line-height: 1.5;">
                You'll receive our next update soon.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">
              © ${new Date().getFullYear()} Our Newsletter. All rights reserved.
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 8px;">
              <a href="#" style="color: #64748b; text-decoration: none;">Unsubscribe</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    `,
  };
  return data;
};

export const emailTemplate = {
  createAccount,
  resetPassword,
  newsLetter,
};
