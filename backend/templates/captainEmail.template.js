export const getCaptainWelcomeEmailHTML = (captain = {}) => {
  const {
    firstname = "Captain",
    vehicle = {}
  } = captain;

  const vehicleInfo = vehicle.type
    ? `${vehicle.color || ''} ${vehicle.make || ''} ${vehicle.model || ''} (${vehicle.year || ''}) — ${vehicle.numberPlate || ''}`
    : "Your registered vehicle";

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome Captain - Sawari.pk</title>
  </head>
  <body style="margin:0; padding:0; background-color:#1A1A1A; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#1A1A1A">
      <tr>
        <td align="center" style="padding: 40px 20px 40px 20px;">
          <table width="100%" style="max-width:640px; background-color:#FFFFFF; border-radius:16px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.15);">
            
            <!-- HERO SECTION -->
            <tr>
              <td style="background: linear-gradient(135deg, #4DA6FF 0%, #EFBFFF 35%, #7CE7E1 70%, #FFD65C 100%); text-align:center; padding:40px 32px 40px 32px;">
                <div style="background-color: rgba(255,255,255,0.15); border-radius: 20px; width: 80px; height: 80px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 36px; color: #FFFFFF;">🚗</span>
                </div>
                <h1 style="color:#FFFFFF; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif; font-size:32px; font-weight:700; margin:0 0 12px; text-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  Welcome Captain ${firstname}!
                </h1>
                <p style="color:#FFFFFF; font-size:18px; margin:0; opacity:0.95; font-weight:400;">
                  You're officially part of the Sawari.pk driver family.
                </p>
              </td>
            </tr>

            <!-- MAIN CONTENT -->
            <tr>
              <td style="padding:40px 40px 40px 40px;">
                <div style="text-align: center; margin-bottom: 32px;">
                  <h2 style="font-family: 'Poppins', sans-serif; font-size:24px; font-weight:600; color:#1A1A1A; margin:0 0 16px;">
                    🎉 Ready to start earning!
                  </h2>
                  <p style="font-size:16px; line-height:1.6; color:#4B5563; margin:0;">
                    Thanks for joining as a <strong style="color:#4DA6FF;">driver partner</strong>. We're excited to help you earn more while providing safe, reliable rides across Pakistan.
                  </p>
                </div>

                <!-- VEHICLE INFO CARD -->
                <div style="background: linear-gradient(135deg, #4DA6FF08 0%, #EFBFFF08 100%); border: 1px solid #E5E7EB; border-radius:16px; padding:32px; margin: 32px 0; text-align:center;">
                  <div style="font-size:28px; margin-bottom:16px;">🚘</div>
                  <h3 style="font-size:18px; font-weight:600; color:#1A1A1A; margin:0 0 12px;">Your Registered Vehicle</h3>
                  <p style="font-size:15px; color:#4B5563; margin:0; font-weight:500;">
                    ${vehicleInfo}
                  </p>
                </div>

                <!-- NEXT STEPS -->
                <div style="margin: 40px 0;">
                  <h3 style="font-size:20px; color:#1A1A1A; margin:0 0 20px; text-align:center;">What happens next?</h3>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="padding: 0 0 16px 0;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%); border-radius: 12px;">
                          <tr>
                            <td style="padding: 20px; width: 60px; vertical-align: top;">
                              <div style="background: linear-gradient(135deg, #4DA6FF 0%, #EFBFFF 100%); color: white; border-radius: 50%; width: 32px; height: 32px; text-align: center; line-height: 32px; font-weight: bold; font-size: 14px;">1</div>
                            </td>
                            <td style="padding: 20px 20px 20px 0; vertical-align: top;">
                              <h4 style="margin: 0 0 4px; color: #1A1A1A; font-size: 16px; font-weight: 600;">Verify your account</h4>
                              <p style="margin: 0; color: #6B7280; font-size: 14px;">Complete OTP verification to activate your captain profile</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 16px 0;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%); border-radius: 12px;">
                          <tr>
                            <td style="padding: 20px; width: 60px; vertical-align: top;">
                              <div style="background: linear-gradient(135deg, #7CE7E1 0%, #FFD65C 100%); color: white; border-radius: 50%; width: 32px; height: 32px; text-align: center; line-height: 32px; font-weight: bold; font-size: 14px;">2</div>
                            </td>
                            <td style="padding: 20px 20px 20px 0; vertical-align: top;">
                              <h4 style="margin: 0 0 4px; color: #1A1A1A; font-size: 16px; font-weight: 600;">Complete your profile</h4>
                              <p style="margin: 0; color: #6B7280; font-size: 14px;">Upload required documents and finish profile setup</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%); border-radius: 12px;">
                          <tr>
                            <td style="padding: 20px; width: 60px; vertical-align: top;">
                              <div style="background: linear-gradient(135deg, #EFBFFF 0%, #4DA6FF 100%); color: white; border-radius: 50%; width: 32px; height: 32px; text-align: center; line-height: 32px; font-weight: bold; font-size: 14px;">3</div>
                            </td>
                            <td style="padding: 20px 20px 20px 0; vertical-align: top;">
                              <h4 style="margin: 0 0 4px; color: #1A1A1A; font-size: 16px; font-weight: 600;">Go online and start earning!</h4>
                              <p style="margin: 0; color: #6B7280; font-size: 14px;">Turn on your availability and accept ride requests</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- CTA BUTTON -->
                <div style="text-align:center; margin:40px 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center">
                        <a href="https://driver.sawari.pk" style="display:inline-block; background: linear-gradient(135deg, #4DA6FF 0%, #EFBFFF 100%); color:#FFFFFF; text-decoration:none; padding:16px 32px; border-radius:50px; font-size:16px; font-weight:600; box-shadow: 0 8px 25px rgba(77, 166, 255, 0.3);">
                          🚗 Open Captain Dashboard
                        </a>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- BRAND MESSAGE -->
                <div style="background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%); border-radius:12px; padding:24px; text-align:center; margin-top:32px;">
                  <p style="font-size:14px; color:#4B5563; margin:0 0 8px; font-style:italic;">
                    "Drive with purpose. Earn with pride."
                  </p>
                  <p style="font-size:12px; color:#9CA3AF; margin:0;">
                    — Sawari.pk Captain Team
                  </p>
                </div>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="background: linear-gradient(135deg, #1A1A1A 0%, #374151 100%); padding:32px 40px 32px 40px; text-align:center;">
                <div style="margin-bottom:16px;">
                  <h3 style="color:#FFFFFF; font-size:18px; font-weight:600; margin:0 0 8px;">Sawari.pk</h3>
                  <p style="color:#9CA3AF; font-size:14px; margin:0;">Pakistan's smarter way to move</p>
                </div>
                
                <div style="border-top:1px solid #4B5563; padding-top:20px; margin-top:20px;">
                  <p style="color:#6B7280; font-size:12px; margin:0 0 12px;">Made with ❤️ by the Sawari.pk team</p>
                  <div>
                    <a href="https://sawari.pk" style="color:#4DA6FF; text-decoration:none; font-size:12px; margin:0 8px;">Website</a>
                    <span style="color:#4B5563;">•</span>
                    <a href="https://github.com/gauravkhatriweb" style="color:#4DA6FF; text-decoration:none; font-size:12px; margin:0 8px;">GitHub</a>
                    <span style="color:#4B5563;">•</span>
                    <a href="mailto:support@sawari.pk" style="color:#4DA6FF; text-decoration:none; font-size:12px; margin:0 8px;">Captain Support</a>
                  </div>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
};

export const getCaptainVerifyOtpEmailHTML = (otp, expiryMinutes) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Your Captain Account - Sawari.pk</title>
  </head>
  <body style="margin:0; padding:0; background-color:#1A1A1A; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#1A1A1A">
      <tr>
        <td align="center" style="padding: 40px 20px 40px 20px;">
          <table width="100%" style="max-width:640px; background-color:#FFFFFF; border-radius:16px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.15);">
            
            <!-- HERO SECTION -->
            <tr>
              <td style="background: linear-gradient(135deg, #4DA6FF 0%, #EFBFFF 35%, #7CE7E1 70%, #FFD65C 100%); text-align:center; padding:40px 32px 40px 32px;">
                <div style="background-color: rgba(255,255,255,0.15); border-radius: 20px; width: 80px; height: 80px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 36px; color: #FFFFFF;">👨‍✈️</span>
                </div>
                <h1 style="color:#FFFFFF; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif; font-size:28px; font-weight:700; margin:0 0 12px; text-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  Verify Captain Account
                </h1>
                <p style="color:#FFFFFF; font-size:16px; margin:0; opacity:0.95; font-weight:400;">
                  Complete your captain verification to start driving with Sawari.pk.
                </p>
              </td>
            </tr>

            <!-- MAIN CONTENT -->
            <tr>
              <td style="padding:40px 40px 40px 40px;">
                <div style="text-align: center; margin-bottom: 32px;">
                  <h2 style="font-family: 'Poppins', sans-serif; font-size:22px; font-weight:600; color:#1A1A1A; margin:0 0 16px;">
                    🚗 Captain Verification Required
                  </h2>
                  <p style="font-size:16px; line-height:1.6; color:#4B5563; margin:0;">
                    You're one step away from joining Pakistan's premier ride-sharing platform. Enter the verification code below to activate your captain account.
                  </p>
                </div>

                <!-- OTP CODE SECTION -->
                <div style="text-align:center; background: linear-gradient(135deg, #4DA6FF08 0%, #EFBFFF08 50%, #7CE7E108 100%); border: 2px dashed #4DA6FF40; border-radius:16px; padding:32px; margin: 32px 0;">
                  <div style="color:#6B7280; font-size:14px; margin-bottom:12px; font-weight:500;">Captain Verification Code</div>
                  <div style="font-weight:700; font-family: 'Inter', 'SFMono-Regular', Menlo, Monaco, Consolas, monospace; color:#4DA6FF; letter-spacing:8px; font-size:32px; margin:16px 0;">
                    ${otp}
                  </div>
                  <div style="color:#9CA3AF; font-size:13px; margin-top:12px;">
                    ⏰ Code expires in <strong style="color:#1A1A1A;">${expiryMinutes} minutes</strong>
                  </div>
                </div>

                <!-- CTA BUTTON -->
                <div style="text-align:center; margin:32px 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center">
                        <a href="https://driver.sawari.pk" style="display:inline-block; background: linear-gradient(135deg, #4DA6FF 0%, #EFBFFF 100%); color:#FFFFFF; text-decoration:none; padding:14px 28px; border-radius:50px; font-size:15px; font-weight:600; box-shadow: 0 8px 25px rgba(77, 166, 255, 0.3);">
                          🚗 Open Captain Dashboard
                        </a>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- HELP SECTION -->
                <div style="background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%); border-radius:12px; padding:24px; text-align:center; margin-top:32px;">
                  <p style="font-size:14px; color:#4B5563; margin:0 0 8px;">
                    Didn't request this verification? You can safely ignore this email.
                  </p>
                  <p style="font-size:13px; color:#6B7280; margin:0;">
                    Need help? Contact our captain support at <a href="mailto:captain-support@sawari.pk" style="color:#4DA6FF; text-decoration:none; font-weight:500;">captain-support@sawari.pk</a>
                  </p>
                </div>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="background: linear-gradient(135deg, #1A1A1A 0%, #374151 100%); padding:32px 40px; text-align:center;">
                <div style="margin-bottom:16px;">
                  <h3 style="color:#FFFFFF; font-size:18px; font-weight:600; margin:0 0 8px;">Sawari.pk</h3>
                  <p style="color:#9CA3AF; font-size:14px; margin:0;">"Drive with purpose. Earn with pride."</p>
                </div>
                
                <div style="border-top:1px solid #4B5563; padding-top:20px; margin-top:20px;">
                  <p style="color:#6B7280; font-size:12px; margin:0 0 12px;">Made with ❤️ by the Sawari.pk team</p>
                  <div>
                    <a href="https://sawari.pk" style="color:#4DA6FF; text-decoration:none; font-size:12px; margin:0 8px;">Website</a>
                    <span style="color:#4B5563;">•</span>
                    <a href="https://github.com/gauravkhatriweb" style="color:#4DA6FF; text-decoration:none; font-size:12px; margin:0 8px;">GitHub</a>
                    <span style="color:#4B5563;">•</span>
                    <a href="mailto:captain-support@sawari.pk" style="color:#4DA6FF; text-decoration:none; font-size:12px; margin:0 8px;">Captain Support</a>
                  </div>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

export const getCaptainResetPasswordEmailHTML = (otp, expiryMinutes) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Captain Password - Sawari.pk</title>
  </head>
  <body style="margin:0; padding:0; background-color:#1A1A1A; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#1A1A1A">
      <tr>
        <td align="center" style="padding: 40px 20px 40px 20px;">
          <table width="100%" style="max-width:640px; background-color:#FFFFFF; border-radius:16px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.15);">
            
            <!-- HERO SECTION -->
            <tr>
              <td style="background: linear-gradient(135deg, #4DA6FF 0%, #EFBFFF 35%, #7CE7E1 70%, #FFD65C 100%); text-align:center; padding:40px 32px 40px 32px;">
                <div style="background-color: rgba(255,255,255,0.15); border-radius: 20px; width: 80px; height: 80px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 36px; color: #FFFFFF;">🔒</span>
                </div>
                <h1 style="color:#FFFFFF; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif; font-size:28px; font-weight:700; margin:0 0 12px; text-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  Captain Password Reset
                </h1>
                <p style="color:#FFFFFF; font-size:16px; margin:0; opacity:0.95; font-weight:400;">
                  We received a request to reset your captain account password.
                </p>
              </td>
            </tr>

            <!-- MAIN CONTENT -->
            <tr>
              <td style="padding:40px 40px 40px 40px;">
                <div style="text-align: center; margin-bottom: 32px;">
                  <h2 style="font-family: 'Poppins', sans-serif; font-size:22px; font-weight:600; color:#1A1A1A; margin:0 0 16px;">
                    🔐 Reset Your Captain Password
                  </h2>
                  <p style="font-size:16px; line-height:1.6; color:#4B5563; margin:0;">
                    Use the verification code below to reset your password and regain access to your captain account.
                  </p>
                </div>

                <!-- OTP CODE SECTION -->
                <div style="text-align:center; background: linear-gradient(135deg, #4DA6FF08 0%, #EFBFFF08 50%, #7CE7E108 100%); border: 2px dashed #4DA6FF40; border-radius:16px; padding:32px; margin: 32px 0;">
                  <div style="color:#6B7280; font-size:14px; margin-bottom:12px; font-weight:500;">Captain Password Reset Code</div>
                  <div style="font-weight:700; font-family: 'Inter', 'SFMono-Regular', Menlo, Monaco, Consolas, monospace; color:#4DA6FF; letter-spacing:8px; font-size:32px; margin:16px 0;">
                    ${otp}
                  </div>
                  <div style="color:#9CA3AF; font-size:13px; margin-top:12px;">
                    ⏰ Code expires in <strong style="color:#1A1A1A;">${expiryMinutes} minutes</strong>
                  </div>
                </div>

                <!-- CTA BUTTON -->
                <div style="text-align:center; margin:32px 0;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="https://driver.sawari.pk" style="display:inline-block; background: linear-gradient(135deg, #4DA6FF 0%, #EFBFFF 100%); color:#FFFFFF; text-decoration:none; padding:14px 28px; border-radius:50px; font-size:15px; font-weight:600; box-shadow: 0 8px 25px rgba(77, 166, 255, 0.3);">
                          🔑 Reset Captain Password
                        </a>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- SECURITY NOTICE -->
                <div style="background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%); border-left: 4px solid #EF4444; border-radius:12px; padding:20px; margin:32px 0;">
                  <h3 style="color:#DC2626; font-size:16px; font-weight:600; margin:0 0 8px;">🛡️ Security Notice</h3>
                  <p style="color:#7F1D1D; font-size:14px; margin:0; line-height:1.5;">
                    If you didn't request this password reset, please ignore this email or contact our captain support team immediately.
                  </p>
                </div>

                <!-- HELP SECTION -->
                <div style="background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%); border-radius:12px; padding:24px; text-align:center; margin-top:32px;">
                  <p style="font-size:13px; color:#6B7280; margin:0;">
                    Need help? Contact our captain support at <a href="mailto:captain-support@sawari.pk" style="color:#4DA6FF; text-decoration:none; font-weight:500;">captain-support@sawari.pk</a>
                  </p>
                </div>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="background: linear-gradient(135deg, #1A1A1A 0%, #374151 100%); padding:32px 40px; text-align:center;">
                <div style="margin-bottom:16px;">
                  <h3 style="color:#FFFFFF; font-size:18px; font-weight:600; margin:0 0 8px;">Sawari.pk</h3>
                  <p style="color:#9CA3AF; font-size:14px; margin:0;">"Drive with purpose. Earn with pride."</p>
                </div>
                
                <div style="border-top:1px solid #4B5563; padding-top:20px; margin-top:20px;">
                  <p style="color:#6B7280; font-size:12px; margin:0 0 12px;">Made with ❤️ by the Sawari.pk team</p>
                  <div>
                    <a href="https://sawari.pk" style="color:#4DA6FF; text-decoration:none; font-size:12px; margin:0 8px;">Website</a>
                    <span style="color:#4B5563;">•</span>
                    <a href="https://github.com/gauravkhatriweb" style="color:#4DA6FF; text-decoration:none; font-size:12px; margin:0 8px;">GitHub</a>
                    <span style="color:#4B5563;">•</span>
                    <a href="mailto:captain-support@sawari.pk" style="color:#4DA6FF; text-decoration:none; font-size:12px; margin:0 8px;">Captain Support</a>
                  </div>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;