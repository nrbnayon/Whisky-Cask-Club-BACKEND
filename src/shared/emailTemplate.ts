// src/shared/emailTemplate.ts

import {
  INewsletterSubscriber,
  IResetPassword,
  ICreateAccount,
} from '../types/emailTemplate';

/**
 * Base email template with consistent styling
 */
const getBaseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f5f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;">
          <tr>
            <td>
              ${content}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Create account verification email template
 */
const createAccount = (values: ICreateAccount) => {
  const content = `
    <!-- Header with brand -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0; padding: 40px 32px; text-align: center;">
      <div style="background: rgba(255, 255, 255, 0.15); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
        <div style="color: white; font-size: 40px; line-height: 1;">✓</div>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Account Verification</h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 12px 0 0; font-size: 16px;">Secure your account with verification</p>
    </div>
    
    <!-- Main content -->
    <div style="background: white; padding: 40px 32px; border-radius: 0 0 12px 12px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #2d3748; margin: 0 0 24px; font-size: 24px; font-weight: 600;">Hello ${values.name}! 👋</h2>
      
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
        Welcome to our platform! To complete your account setup and ensure security, please use the verification code below.
      </p>
      
      <!-- Verification code box -->
      <div style="text-align: center; margin: 32px 0;">
        <div style="background: linear-gradient(135deg, #ff8a00, #ffb347); display: inline-block; padding: 20px 32px; border-radius: 12px; box-shadow: 0 4px 15px rgba(255, 138, 0, 0.3);">
          <p style="color: white; margin: 0 0 8px; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Verification Code</p>
          <div style="color: white; font-size: 32px; font-weight: 700; letter-spacing: 4px; font-family: 'Courier New', monospace;">${values.otp}</div>
        </div>
      </div>
      
      <!-- Info section -->
      <div style="background: #f7fafc; border-left: 4px solid #4299e1; padding: 20px; border-radius: 0 8px 8px 0; margin: 32px 0;">
        <p style="color: #2d3748; margin: 0; font-size: 15px; line-height: 1.5;">
          <strong>⏰ Important:</strong> This code expires in <strong>5 minutes</strong> for your security.
        </p>
      </div>
      
      <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
        If you didn't create an account with us, please ignore this email. Someone may have entered your email address by mistake.
      </p>
      
      <!-- Footer -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 32px; text-align: center;">
        <p style="color: #a0aec0; font-size: 13px; margin: 0;">
          Need help? Contact our support team at support@yourcompany.com
        </p>
      </div>
    </div>
  `;

  return {
    to: values.email,
    subject: '🔐 Verify Your Account - Action Required',
    html: getBaseTemplate(content),
  };
};

/**
 * Password reset email template
 */
const resetPassword = (values: IResetPassword) => {
  const content = `
    <!-- Header with warning colors -->
    <div style="background: linear-gradient(135deg, #ed64a6 0%, #f56565 100%); border-radius: 12px 12px 0 0; padding: 40px 32px; text-align: center;">
      <div style="background: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
        <div style="color: white; font-size: 40px; line-height: 1;">🔒</div>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Password Reset</h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 12px 0 0; font-size: 16px;">Secure your account</p>
    </div>
    
    <!-- Company Name Section (replacing logo) -->
    <div style="background: white; padding: 24px 32px 0; text-align: center;">
      <h3 style="color: #2d3748; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">YourCompany</h3>
      <p style="color: #718096; font-size: 14px; margin: 8px 0 0; text-transform: uppercase; letter-spacing: 2px;">Secure Platform</p>
    </div>
    
    <!-- Main content -->
    <div style="background: white; padding: 24px 32px 40px; border-radius: 0 0 12px 12px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #2d3748; margin: 0 0 24px; font-size: 24px; font-weight: 600;">Password Reset Request</h2>
      
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
        We received a request to reset your password. Use the code below to create a new password for your account.
      </p>
      
      <!-- Reset code box -->
      <div style="text-align: center; margin: 32px 0;">
        <div style="background: linear-gradient(135deg, #ff8a00, #ffb347); display: inline-block; padding: 20px 32px; border-radius: 12px; box-shadow: 0 4px 15px rgba(255, 138, 0, 0.3);">
          <p style="color: white; margin: 0 0 8px; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Reset Code</p>
          <div style="color: white; font-size: 32px; font-weight: 700; letter-spacing: 4px; font-family: 'Courier New', monospace;">${values.otp}</div>
        </div>
      </div>
      
      <!-- Extended validity notice -->
      <div style="background: #fff5f5; border: 1px solid #fed7d7; border-left: 4px solid #f56565; padding: 20px; border-radius: 0 8px 8px 0; margin: 32px 0;">
        <p style="color: #c53030; margin: 0; font-size: 15px; line-height: 1.5;">
          <strong>⏰ Security Notice:</strong> This reset code is valid for <strong>20 minutes</strong>. After that, you'll need to request a new one.
        </p>
      </div>
      
      <!-- Security tips -->
      <div style="background: #f0fff4; border: 1px solid #c6f6d5; border-left: 4px solid #48bb78; padding: 20px; border-radius: 0 8px 8px 0; margin: 24px 0;">
        <p style="color: #2f855a; margin: 0 0 12px; font-size: 14px; font-weight: 600;">💡 Security Tips:</p>
        <div style="color: #276749; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0 0 8px;">• Choose a strong password with at least 8 characters</p>
          <p style="margin: 0 0 8px;">• Include uppercase, lowercase, numbers, and symbols</p>
          <p style="margin: 0;">• Don't reuse passwords from other accounts</p>
        </div>
      </div>
      
      <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
        If you didn't request a password reset, please ignore this email and your password will remain unchanged. Consider reviewing your account security.
      </p>
      
      <!-- Footer -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 32px; text-align: center;">
        <p style="color: #a0aec0; font-size: 13px; margin: 0;">
          Questions? Contact support@yourcompany.com | This is an automated message
        </p>
      </div>
    </div>
  `;

  return {
    to: values.email,
    subject: '🔑 Password Reset Code - Act Now',
    html: getBaseTemplate(content),
  };
};

/**
 * Newsletter subscription welcome email
 */
const newsLetter = (values: INewsletterSubscriber) => {
  const content = `
    <!-- Header with gradient -->
    <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 12px 12px 0 0; padding: 50px 32px; text-align: center; position: relative;">
      <div style="background: rgba(255, 255, 255, 0.15); border-radius: 50%; width: 100px; height: 100px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
        <div style="color: white; font-size: 50px; line-height: 1;">📧</div>
      </div>
      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px;">Welcome Aboard! 🎉</h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 16px 0 0; font-size: 18px;">You're now part of our amazing community</p>
    </div>
    
    <!-- Main content -->
    <div style="background: white; padding: 50px 32px; border-radius: 0 0 12px 12px; box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #2d3748; margin: 0 0 20px; font-size: 26px; font-weight: 700;">Hello ${values.name}! 👋</h2>
      
      <p style="color: #4a5568; font-size: 18px; line-height: 1.7; margin-bottom: 32px;">
        Thank you for subscribing to <strong style="color: #3182ce;">Our Newsletter</strong>! We're thrilled to have you join our community of engaged readers.
      </p>
      
      <!-- Welcome benefits -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 32px; margin: 32px 0; color: white; text-align: center;">
        <h3 style="margin: 0 0 24px; font-size: 22px; font-weight: 600;">What to Expect</h3>
        
        <div style="margin-bottom: 24px;">
          <div style="background: rgba(255, 255, 255, 0.15); padding: 20px; border-radius: 12px; margin-bottom: 16px;">
            <div style="font-size: 24px; margin-bottom: 8px;">📧</div>
            <h4 style="margin: 0 0 8px; font-size: 16px; font-weight: 600;">Weekly Updates</h4>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Curated content delivered every Tuesday</p>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.15); padding: 20px; border-radius: 12px; margin-bottom: 16px;">
            <div style="font-size: 24px; margin-bottom: 8px;">🎯</div>
            <h4 style="margin: 0 0 8px; font-size: 16px; font-weight: 600;">Exclusive Content</h4>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Subscriber-only insights and early access</p>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.15); padding: 20px; border-radius: 12px;">
            <div style="font-size: 24px; margin-bottom: 8px;">💡</div>
            <h4 style="margin: 0 0 8px; font-size: 16px; font-weight: 600;">Expert Tips</h4>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Industry insights from thought leaders</p>
          </div>
        </div>
      </div>
      
      <!-- Subscription details -->
      <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 32px 0;">
        <h4 style="color: #2d3748; margin: 0 0 16px; font-size: 18px; font-weight: 600;">📋 Subscription Details</h4>
        <p style="color: #4a5568; margin: 0 0 12px; font-size: 15px;">
          <strong>Email:</strong> ${values.email}
        </p>
        <p style="color: #4a5568; margin: 0 0 12px; font-size: 15px;">
          <strong>Subscribed on:</strong> ${new Date().toLocaleDateString(
            'en-US',
            {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            },
          )}
        </p>
        <p style="color: #4a5568; margin: 0; font-size: 15px;">
          <strong>Status:</strong> <span style="color: #38a169; font-weight: 600;">✅ Active</span>
        </p>
      </div>
      
      <!-- Next steps -->
      <div style="background: #edf2f7; border-left: 4px solid #4299e1; padding: 24px; border-radius: 0 12px 12px 0; margin: 32px 0;">
        <h4 style="color: #2d3748; margin: 0 0 16px; font-size: 18px; font-weight: 600;">🚀 What's Next?</h4>
        <p style="color: #4a5568; margin: 0; font-size: 15px; line-height: 1.6;">
          Keep an eye on your inbox! Our next newsletter will arrive soon with exciting content tailored just for you. In the meantime, follow us on social media for daily updates and behind-the-scenes content.
        </p>
      </div>
      
      <!-- Social links section -->
      <div style="text-align: center; margin: 40px 0 32px;">
        <p style="color: #4a5568; margin: 0 0 20px; font-size: 16px; font-weight: 600;">Connect With Us</p>
        <div style="margin: 0;">
          <div style="display: inline-block; margin: 0 8px;">
            <a href="#" style="background: #1da1f2; color: white; padding: 12px; border-radius: 50%; text-decoration: none; display: inline-block; width: 20px; height: 20px; text-align: center; line-height: 20px;">T</a>
          </div>
          <div style="display: inline-block; margin: 0 8px;">
            <a href="#" style="background: #1877f2; color: white; padding: 12px; border-radius: 50%; text-decoration: none; display: inline-block; width: 20px; height: 20px; text-align: center; line-height: 20px;">F</a>
          </div>
          <div style="display: inline-block; margin: 0 8px;">
            <a href="#" style="background: #0077b5; color: white; padding: 12px; border-radius: 50%; text-decoration: none; display: inline-block; width: 20px; height: 20px; text-align: center; line-height: 20px;">L</a>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="border-top: 2px solid #e2e8f0; padding-top: 32px; margin-top: 40px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <p style="color: #2d3748; margin: 0 0 8px; font-size: 18px; font-weight: 600;">Thank you for joining us!</p>
          <p style="color: #718096; margin: 0; font-size: 14px;">We're excited to share our journey with you.</p>
        </div>
        
        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="color: #a0aec0; font-size: 13px; margin: 0 0 8px;">
            © ${new Date().getFullYear()} Our Newsletter. All rights reserved.
          </p>
          <p style="color: #a0aec0; font-size: 12px; margin: 0;">
            <a href="#" style="color: #718096; text-decoration: none; margin: 0 8px;">Privacy Policy</a> |
            <a href="#" style="color: #718096; text-decoration: none; margin: 0 8px;">Unsubscribe</a> |
            <a href="#" style="color: #718096; text-decoration: none; margin: 0 8px;">Contact Us</a>
          </p>
        </div>
      </div>
    </div>
  `;

  return {
    to: values.email,
    subject: "🎉 Welcome to Our Newsletter - You're In!",
    html: getBaseTemplate(content),
  };
};

/**
 * Export the email template functions
 */
export const emailTemplate = {
  createAccount,
  resetPassword,
  newsLetter,
};
