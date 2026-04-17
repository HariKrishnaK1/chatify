export function createWelcomeEmailTemplate(name, clientURL) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Chatify</title>
  </head>
  <body style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f1f5f9;">
    <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 40px 20px; text-align: center; border-radius: 16px 16px 0 0;">
      <div style="width: 80px; height: 80px; margin: 0 auto 20px; background-color: white; border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
        <img src="https://img.freepik.com/free-vector/hand-drawn-message-element-vector-cute-sticker_53876-118344.jpg" alt="Chatify Logo" style="width: 50px; height: 50px;">
      </div>
      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.025em;">Welcome to Chatify!</h1>
    </div>
    <div style="background-color: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <p style="font-size: 18px; color: #3b82f6; margin-bottom: 24px;"><strong>Hey ${name},</strong></p>
      <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">We're absolutely thrilled to have you! Chatify is designed to bring you closer to the people who matter most. Get ready for a seamless, beautiful, and lightning-fast messaging experience.</p>
      
      <div style="background-color: #f8fafc; padding: 24px; border-radius: 12px; margin: 32px 0; border-left: 4px solid #06b6d4;">
        <p style="font-size: 16px; margin: 0 0 16px 0; color: #1e293b;"><strong>Ready to get started?</strong></p>
        <ul style="padding-left: 20px; margin: 0; color: #475569;">
          <li style="margin-bottom: 12px;"><strong>Personalize:</strong> Set up your profile and bio!</li>
          <li style="margin-bottom: 12px;"><strong>Connect:</strong> Find your friends in the contacts tab.</li>
          <li style="margin-bottom: 12px;"><strong>Communicate:</strong> Send your first message and explore replies.</li>
          <li style="margin-bottom: 0;"><strong>Engage:</strong> Share images and see live read receipts!</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${clientURL}" style="background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.5);">Open Chatify Now</a>
      </div>
      
      <p style="color: #64748b; font-size: 14px;">If you have any questions, our support team is always just a message away. We're constantly working to make Chatify even better for you.</p>
      
      <p style="margin-top: 32px; color: #1e293b; font-weight: 600; margin-bottom: 0;">Happy Chatting,<br>The Chatify Team</p>
    </div>
    
    <div style="text-align: center; padding: 32px 20px; color: #94a3b8; font-size: 12px;">
      <p style="margin-bottom: 8px;">© 2026 Chatify App. All rights reserved.</p>
      <p>
        <a href="#" style="color: #3b82f6; text-decoration: none; margin: 0 8px;">Privacy Policy</a> • 
        <a href="#" style="color: #3b82f6; text-decoration: none; margin: 0 8px;">Terms of Service</a> • 
        <a href="#" style="color: #3b82f6; text-decoration: none; margin: 0 8px;">Unsubscribe</a>
      </p>
    </div>
  </body>
  </html>
  `;
}

export function createOTPEmailTemplate(code) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
  </head>
  <body style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f1f5f9;">
    <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 40px 20px; text-align: center; border-radius: 16px 16px 0 0;">
      <div style="width: 80px; height: 80px; margin: 0 auto 20px; background-color: white; border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
         <img src="https://img.freepik.com/free-vector/hand-drawn-message-element-vector-cute-sticker_53876-118344.jpg" alt="Chatify Logo" style="width: 50px; height: 50px;">
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.025em;">Verify Your Email</h1>
    </div>
    <div style="background-color: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); text-align: center;">
      <p style="font-size: 16px; color: #475569; margin-bottom: 32px;">To complete your Chatify registration, please use the following verification code. This code will expire in 15 minutes.</p>
      
      <div style="background-color: #f8fafc; padding: 24px; border-radius: 12px; margin: 32px 0; border: 2px dashed #cbd5e1;">
        <span style="font-size: 42px; font-weight: 800; color: #3b82f6; letter-spacing: 0.25em;">${code}</span>
      </div>
      
      <p style="color: #64748b; font-size: 14px; margin-top: 32px;">If you didn't request this code, you can safely ignore this email.</p>
      
      <p style="margin-top: 32px; color: #1e293b; font-weight: 600; margin-bottom: 0;">Warmly,<br>The Chatify Team</p>
    </div>
    
    <div style="text-align: center; padding: 32px 20px; color: #94a3b8; font-size: 12px;">
      <p style="margin-bottom: 8px;">© 2026 Chatify App. All rights reserved.</p>
    </div>
  </body>
  </html>
  `;
}
