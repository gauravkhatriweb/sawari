// Passenger email templates

export const getPassengerWelcomeEmailHTML = (firstname) => {
    const safeName = firstname || "Passenger";
    return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Sawari.pk</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#0B0B0B; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0B0B0B">
      <tr>
        <td align="center" style="padding: 40px 20px 40px 20px;">
          <!-- Ambient Background Elements -->
          <div style="position: relative; max-width: 640px; margin: 0 auto;">
            <div style="position: absolute; top: -100px; left: -100px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(77, 166, 255, 0.15) 0%, rgba(239, 191, 255, 0.1) 35%, rgba(124, 231, 225, 0.08) 70%, rgba(255, 214, 92, 0.05) 100%); border-radius: 50%; filter: blur(60px); pointer-events: none;"></div>
            <div style="position: absolute; bottom: -120px; right: -120px; width: 240px; height: 240px; background: radial-gradient(circle, rgba(124, 231, 225, 0.12) 0%, rgba(77, 166, 255, 0.08) 35%, rgba(239, 191, 255, 0.06) 70%, rgba(255, 214, 92, 0.04) 100%); border-radius: 50%; filter: blur(80px); pointer-events: none;"></div>
            
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px; background: linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%); border-radius:24px; overflow:hidden; box-shadow: 0 25px 80px rgba(0,0,0,0.25), 0 0 1px rgba(255,255,255,0.1); position: relative; z-index: 1;">
              
              <!-- HERO SECTION -->
              <tr>
                <td style="background: linear-gradient(135deg, #4DA6FF 0%, #EFBFFF 25%, #7CE7E1 50%, #FFD65C 75%, #4DA6FF 100%); text-align:center; padding:50px 40px 50px 40px; position: relative;">
                  <!-- Glassmorphism Logo Container -->
                  <div style="background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); border-radius: 28px; width: 100px; height: 100px; margin: 0 auto 32px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                    <div style="background: rgba(255,255,255,0.9); border-radius: 20px; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2px 8px rgba(0,0,0,0.1);">
                      <span style="font-size: 40px; line-height: 1;">🚖</span>
                    </div>
                  </div>
                  
                  <h1 style="color:#FFFFFF; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif; font-size:36px; font-weight:700; margin:0 0 16px; text-shadow: 0 4px 20px rgba(0,0,0,0.2); letter-spacing: -0.5px;">
                    Welcome to Sawari, ${safeName}!
                  </h1>
                  <p style="color:#FFFFFF; font-size:20px; margin:0; opacity:0.95; font-weight:400; text-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    Your journey with Pakistan's smartest ride platform begins now.
                  </p>
                  
                  <!-- Decorative Elements -->
                  <div style="position: absolute; top: 20px; right: 30px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%; backdrop-filter: blur(10px);"></div>
                  <div style="position: absolute; bottom: 30px; left: 40px; width: 40px; height: 40px; background: rgba(255,255,255,0.08); border-radius: 50%; backdrop-filter: blur(10px);"></div>
                </td>
              </tr>

              <!-- MAIN CONTENT -->
              <tr>
                <td style="padding:60px 50px;">
                  <div style="text-align: center; margin-bottom: 40px;">
                    <h2 style="font-family: 'Poppins', sans-serif; font-size:28px; font-weight:600; color:#1A1A1A; margin:0 0 20px; letter-spacing: -0.3px;">
                      🎉 You're all set to ride!
                    </h2>
                    <p style="font-size:18px; line-height:1.7; color:#4B5563; margin:0; max-width: 500px; margin: 0 auto;">
                      Experience <strong style="color:#4DA6FF; font-weight: 600;">affordable, safe, and reliable</strong> rides across Pakistan. We're here to make every journey comfortable and extraordinary.
                    </p>
                  </div>

                  <!-- ENHANCED FEATURES GRID -->
                  <div style="margin: 40px 0 40px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:50%; padding-right:20px; vertical-align:top;">
                          <div style="background: linear-gradient(135deg, rgba(77, 166, 255, 0.08) 0%, rgba(239, 191, 255, 0.06) 100%); border-radius:20px; padding:28px 24px 28px 24px; text-align:center; border: 1px solid rgba(77, 166, 255, 0.1); position: relative; overflow: hidden;">
                            <div style="position: absolute; top: 0; right: 0; width: 100px; height: 100px; background: radial-gradient(circle, rgba(77, 166, 255, 0.05) 0%, transparent 70%); border-radius: 50%;"></div>
                            <div style="font-size:40px; margin-bottom:16px; position: relative; z-index: 1;">⚡</div>
                            <h3 style="font-size:20px; font-weight:600; color:#1A1A1A; margin:0 0 12px; font-family: 'Poppins', sans-serif;">Quick Booking</h3>
                            <p style="font-size:16px; color:#6B7280; margin:0; line-height:1.5;">Book your ride in seconds with our intuitive interface</p>
                          </div>
                        </td>
                        <td style="width:50%; padding-left:20px; vertical-align:top;">
                          <div style="background: linear-gradient(135deg, rgba(124, 231, 225, 0.08) 0%, rgba(255, 214, 92, 0.06) 100%); border-radius:20px; padding:28px 24px 28px 24px; text-align:center; border: 1px solid rgba(124, 231, 225, 0.1); position: relative; overflow: hidden;">
                            <div style="position: absolute; top: 0; left: 0; width: 100px; height: 100px; background: radial-gradient(circle, rgba(124, 231, 225, 0.05) 0%, transparent 70%); border-radius: 50%;"></div>
                            <div style="font-size:40px; margin-bottom:16px; position: relative; z-index: 1;">💰</div>
                            <h3 style="font-size:20px; font-weight:600; color:#1A1A1A; margin:0 0 12px; font-family: 'Poppins', sans-serif;">Smart Pricing</h3>
                            <p style="font-size:16px; color:#6B7280; margin:0; line-height:1.5;">Transparent, fair rates with no hidden charges</p>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- PREMIUM CTA BUTTON -->
                  <div style="text-align:center; margin:40px 0 40px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <a href="https://sawari.pk" style="display:inline-block; background: linear-gradient(135deg, #4DA6FF 0%, #EFBFFF 100%); color:#FFFFFF; text-decoration:none; padding:20px 40px; border-radius:50px; font-size:18px; font-weight:600; box-shadow: 0 12px 40px rgba(77, 166, 255, 0.4), 0 4px 20px rgba(0,0,0,0.1); transition: all 0.3s ease; position: relative; overflow: hidden; font-family: 'Poppins', sans-serif;">
                            <span style="position: relative; z-index: 1; display: flex; align-items: center; justify-content: center;">
                              🚀 Start Your First Ride
                            </span>
                          </a>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- ENHANCED BRAND MESSAGE -->
                  <div style="background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%); border-radius:20px; padding:30px 32px 30px 32px; text-align:center; margin-top:40px; border: 1px solid #E2E8F0; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: radial-gradient(circle, rgba(77, 166, 255, 0.03) 0%, transparent 70%); border-radius: 50%;"></div>
                    <div style="position: relative; z-index: 1;">
                      <p style="font-size:18px; color:#4B5563; margin:0 0 12px; font-style:italic; font-weight: 500;">
                        "Ride Better. Pay Smarter."
                      </p>
                      <p style="font-size:14px; color:#9CA3AF; margin:0; font-weight: 500;">
                        — The Sawari.pk Team
                      </p>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- PREMIUM FOOTER -->
              <tr>
                <td style="background: linear-gradient(135deg, #1A1A1A 0%, #2D3748 100%); padding:40px 50px; text-align:center; position: relative;">
                  <!-- Subtle decorative elements -->
                  <div style="position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(77, 166, 255, 0.3) 20%, rgba(239, 191, 255, 0.3) 40%, rgba(124, 231, 225, 0.3) 60%, rgba(255, 214, 92, 0.3) 80%, transparent 100%);"></div>
                  
                  <div style="margin-bottom:24px;">
                    <h3 style="color:#FFFFFF; font-size:24px; font-weight:700; margin:0 0 8px; font-family: 'Poppins', sans-serif; letter-spacing: -0.3px;">Sawari.pk</h3>
                    <p style="color:#A0AEC0; font-size:16px; margin:0; font-weight: 500;">Pakistan's smartest way to move</p>
                  </div>
                  
                  <div style="border-top:1px solid #4A5568; padding-top:24px; margin-top:24px;">
                    <p style="color:#718096; font-size:14px; margin:0 0 16px; font-weight: 500;">Made with ❤️ by the Sawari.pk team</p>
                    <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
                      <a href="https://sawari.pk" style="color:#4DA6FF; text-decoration:none; font-size:14px; font-weight: 500; padding: 8px 16px; border-radius: 20px; background: rgba(77, 166, 255, 0.1); transition: all 0.3s ease;">Website</a>
                      <span style="color:#4A5568; font-size:14px;">•</span>
                      <a href="https://github.com/gauravkhatriweb" style="color:#4DA6FF; text-decoration:none; font-size:14px; font-weight: 500; padding: 8px 16px; border-radius: 20px; background: rgba(77, 166, 255, 0.1); transition: all 0.3s ease;">GitHub</a>
                      <span style="color:#4A5568; font-size:14px;">•</span>
                      <a href="mailto:support@sawari.pk" style="color:#4DA6FF; text-decoration:none; font-size:14px; font-weight: 500; padding: 8px 16px; border-radius: 20px; background: rgba(77, 166, 255, 0.1); transition: all 0.3s ease;">Support</a>
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
    `;
};

export const getPassengerVerifyOtpEmailHTML = (otp, expiryMinutes) => {
    return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Your Sawari.pk Account</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#0B0B0B; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6;">
    <span style="display:none!important; color:transparent; height:0; width:0; overflow:hidden; opacity:0;">Your Sawari.pk verification code is ${otp}. It expires in ${expiryMinutes} minutes.</span>
    <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0B0B0B">
      <tr>
        <td align="center" style="padding: 40px 20px;">
          <!-- Ambient Background Elements -->
          <div style="position: relative; max-width: 640px; margin: 0 auto;">
            <div style="position: absolute; top: -80px; left: -80px; width: 160px; height: 160px; background: radial-gradient(circle, rgba(77, 166, 255, 0.2) 0%, rgba(239, 191, 255, 0.12) 35%, rgba(124, 231, 225, 0.08) 70%, transparent 100%); border-radius: 50%; filter: blur(40px); pointer-events: none;"></div>
            <div style="position: absolute; bottom: -100px; right: -100px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(124, 231, 225, 0.15) 0%, rgba(77, 166, 255, 0.1) 35%, rgba(239, 191, 255, 0.08) 70%, transparent 100%); border-radius: 50%; filter: blur(60px); pointer-events: none;"></div>
            
            <table width="100%" style="max-width:640px; background: linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%); border-radius:24px; overflow:hidden; box-shadow: 0 25px 80px rgba(0,0,0,0.3), 0 0 1px rgba(255,255,255,0.1); position: relative; z-index: 1;">
              
              <!-- HERO SECTION -->
              <tr>
                <td style="background: linear-gradient(135deg, #4DA6FF 0%, #EFBFFF 25%, #7CE7E1 50%, #FFD65C 75%, #4DA6FF 100%); text-align:center; padding:60px 40px 50px; position: relative;">
                  <!-- Security Icon with Glassmorphism -->
                  <div style="background: rgba(255,255,255,0.25); backdrop-filter: blur(15px); border-radius: 28px; width: 100px; height: 100px; margin: 0 auto 32px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 12px 40px rgba(0,0,0,0.15);">
                    <div style="background: rgba(255,255,255,0.9); border-radius: 20px; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2px 8px rgba(0,0,0,0.1);">
                      <span style="font-size: 40px; line-height: 1;">🔐</span>
                    </div>
                  </div>
                  
                  <h1 style="color:#FFFFFF; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif; font-size:32px; font-weight:700; margin:0 0 16px; text-shadow: 0 4px 20px rgba(0,0,0,0.2); letter-spacing: -0.3px;">
                    Verify Your Account
                  </h1>
                  <p style="color:#FFFFFF; font-size:18px; margin:0; opacity:0.95; font-weight:400; text-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    Enter the code below to complete your Sawari.pk registration.
                  </p>
                  
                  <!-- Floating Security Elements -->
                  <div style="position: absolute; top: 25px; right: 35px; width: 50px; height: 50px; background: rgba(255,255,255,0.1); border-radius: 50%; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);"></div>
                  <div style="position: absolute; bottom: 35px; left: 45px; width: 35px; height: 35px; background: rgba(255,255,255,0.08); border-radius: 50%; backdrop-filter: blur(8px);"></div>
                </td>
              </tr>

              <!-- MAIN CONTENT -->
              <tr>
                <td style="padding:60px 50px;">
                  <div style="text-align: center; margin-bottom: 40px;">
                    <h2 style="font-family: 'Poppins', sans-serif; font-size:26px; font-weight:600; color:#1A1A1A; margin:0 0 20px; letter-spacing: -0.2px;">
                      🚖 Welcome to Sawari.pk!
                    </h2>
                    <p style="font-size:18px; line-height:1.7; color:#4B5563; margin:0; max-width: 480px; margin: 0 auto;">
                      Thanks for joining Pakistan's smartest way to move. Use the verification code below to activate your account.
                    </p>
                  </div>

                  <!-- PREMIUM OTP CODE SECTION -->
                  <div style="text-align:center; background: linear-gradient(135deg, rgba(77, 166, 255, 0.06) 0%, rgba(239, 191, 255, 0.04) 30%, rgba(124, 231, 225, 0.06) 70%, rgba(255, 214, 92, 0.04) 100%); border: 2px dashed rgba(77, 166, 255, 0.2); border-radius:24px; padding:40px; margin: 40px 0; position: relative; overflow: hidden;">
                    <!-- Background Pattern -->
                    <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: radial-gradient(circle, rgba(77, 166, 255, 0.04) 0%, transparent 70%); border-radius: 50%;"></div>
                    <div style="position: absolute; bottom: -20px; left: -20px; width: 80px; height: 80px; background: radial-gradient(circle, rgba(124, 231, 225, 0.04) 0%, transparent 70%); border-radius: 50%;"></div>
                    
                    <div style="position: relative; z-index: 1;">
                      <div style="color:#6B7280; font-size:16px; margin-bottom:20px; font-weight:500; font-family: 'Poppins', sans-serif;">Your Verification Code</div>
                      
                      <!-- Premium OTP Display -->
                      <div style="background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%); border-radius: 20px; padding: 24px; margin: 20px 0; box-shadow: 0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.7); border: 1px solid rgba(77, 166, 255, 0.1);">
                        <div style="font-weight:700; font-family: 'Inter', 'SF Mono', Monaco, Consolas, monospace; color:#4DA6FF; letter-spacing:12px; font-size:36px; margin:8px 0; text-shadow: 0 2px 4px rgba(77, 166, 255, 0.1);">
                          ${otp}
                        </div>
                      </div>
                      
                      <div style="color:#9CA3AF; font-size:15px; margin-top:20px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <span style="font-size: 16px;">⏰</span>
                        <span>Code expires in <strong style="color:#1A1A1A; font-weight: 600;">${expiryMinutes} minutes</strong></span>
                      </div>
                    </div>
                  </div>

                  <!-- ENHANCED CTA BUTTON -->
                  <div style="text-align:center; margin:50px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="https://sawari.pk" style="display:inline-block; background: linear-gradient(135deg, #4DA6FF 0%, #EFBFFF 100%); color:#FFFFFF; text-decoration:none; padding:18px 36px; border-radius:50px; font-size:16px; font-weight:600; box-shadow: 0 12px 40px rgba(77, 166, 255, 0.35), 0 4px 20px rgba(0,0,0,0.1); transition: all 0.3s ease; font-family: 'Poppins', sans-serif; letter-spacing: 0.3px;">
                            🚀 Open Sawari.pk App
                          </a>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- HELP SECTION -->
                  <div style="background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%); border-radius:20px; padding:32px; text-align:center; margin-top:40px; border: 1px solid #E2E8F0; position: relative;">
                    <div style="position: absolute; top: -15px; right: -15px; width: 80px; height: 80px; background: radial-gradient(circle, rgba(77, 166, 255, 0.03) 0%, transparent 70%); border-radius: 50%;"></div>
                    <div style="position: relative; z-index: 1;">
                      <h3 style="font-size: 18px; font-weight: 600; color: #1A1A1A; margin: 0 0 12px; font-family: 'Poppins', sans-serif;">Need Help?</h3>
                      <p style="font-size:16px; color:#4B5563; margin:0 0 12px; line-height: 1.6;">
                        Didn't request this verification? You can safely ignore this email.
                      </p>
                      <p style="font-size:15px; color:#6B7280; margin:0;">
                        Questions? Contact us at <a href="mailto:support@sawari.pk" style="color:#4DA6FF; text-decoration:none; font-weight:600;">support@sawari.pk</a>
                      </p>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- PREMIUM FOOTER -->
              <tr>
                <td style="background: linear-gradient(135deg, #1A1A1A 0%, #2D3748 100%); padding:40px 50px; text-align:center; position: relative;">
                  <!-- Brand gradient line -->
                  <div style="position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(77, 166, 255, 0.4) 20%, rgba(239, 191, 255, 0.4) 40%, rgba(124, 231, 225, 0.4) 60%, rgba(255, 214, 92, 0.4) 80%, transparent 100%);"></div>
                  
                  <div style="margin-bottom:24px;">
                    <h3 style="color:#FFFFFF; font-size:24px; font-weight:700; margin:0 0 8px; font-family: 'Poppins', sans-serif; letter-spacing: -0.3px;">Sawari.pk</h3>
                    <p style="color:#A0AEC0; font-size:16px; margin:0; font-weight: 500;">"Ride Better. Pay Smarter."</p>
                  </div>
                  
                  <div style="border-top:1px solid #4A5568; padding-top:24px; margin-top:24px;">
                    <p style="color:#718096; font-size:14px; margin:0 0 16px; font-weight: 500;">Made with ❤️ by the Sawari.pk team</p>
                    <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
                      <a href="https://sawari.pk" style="color:#4DA6FF; text-decoration:none; font-size:14px; font-weight: 500; padding: 8px 16px; border-radius: 20px; background: rgba(77, 166, 255, 0.1); transition: all 0.3s ease;">Website</a>
                      <span style="color:#4A5568; font-size:14px;">•</span>
                      <a href="https://github.com/gauravkhatriweb" style="color:#4DA6FF; text-decoration:none; font-size:14px; font-weight: 500; padding: 8px 16px; border-radius: 20px; background: rgba(77, 166, 255, 0.1); transition: all 0.3s ease;">GitHub</a>
                      <span style="color:#4A5568; font-size:14px;">•</span>
                      <a href="mailto:support@sawari.pk" style="color:#4DA6FF; text-decoration:none; font-size:14px; font-weight: 500; padding: 8px 16px; border-radius: 20px; background: rgba(77, 166, 255, 0.1); transition: all 0.3s ease;">Support</a>
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
    `;
};

export const getPassengerResetPasswordEmailHTML = (otp, expiryMinutes) => {
    return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Sawari.pk Password</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#0B0B0B; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6;">
    <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0B0B0B">
      <tr>
        <td align="center" style="padding: 40px 20px;">
          <!-- Ambient Background Elements -->
          <div style="position: relative; max-width: 640px; margin: 0 auto;">
            <div style="position: absolute; top: -60px; left: -60px; width: 140px; height: 140px; background: radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, rgba(239, 191, 255, 0.1) 50%, transparent 100%); border-radius: 50%; filter: blur(40px); pointer-events: none;"></div>
            <div style="position: absolute; bottom: -80px; right: -80px; width: 160px; height: 160px; background: radial-gradient(circle, rgba(77, 166, 255, 0.12) 0%, rgba(124, 231, 225, 0.08) 50%, transparent 100%); border-radius: 50%; filter: blur(50px); pointer-events: none;"></div>
            
            <table width="100%" style="max-width:640px; background: linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%); border-radius:24px; overflow:hidden; box-shadow: 0 25px 80px rgba(0,0,0,0.3), 0 0 1px rgba(255,255,255,0.1); position: relative; z-index: 1;">
              
              <!-- HERO SECTION -->
              <tr>
                <td style="background: linear-gradient(135deg, #EF4444 0%, #F97316 25%, #EAB308 50%, #84CC16 75%, #10B981 100%); text-align:center; padding:60px 40px 50px; position: relative;">
                  <!-- Security Lock Icon -->
                  <div style="background: rgba(255,255,255,0.25); backdrop-filter: blur(15px); border-radius: 28px; width: 100px; height: 100px; margin: 0 auto 32px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 12px 40px rgba(0,0,0,0.15);">
                    <div style="background: rgba(255,255,255,0.9); border-radius: 20px; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2px 8px rgba(0,0,0,0.1);">
                      <span style="font-size: 40px; line-height: 1;">🔒</span>
                    </div>
                  </div>
                  
                  <h1 style="color:#FFFFFF; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif; font-size:32px; font-weight:700; margin:0 0 16px; text-shadow: 0 4px 20px rgba(0,0,0,0.25); letter-spacing: -0.3px;">
                    Password Reset Request
                  </h1>
                  <p style="color:#FFFFFF; font-size:18px; margin:0; opacity:0.95; font-weight:400; text-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    We received a request to reset your Sawari.pk account password.
                  </p>
                  
                  <!-- Security Alert Elements -->
                  <div style="position: absolute; top: 30px; right: 40px; width: 45px; height: 45px; background: rgba(255,255,255,0.12); border-radius: 50%; backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2);"></div>
                  <div style="position: absolute; bottom: 40px; left: 50px; width: 30px; height: 30px; background: rgba(255,255,255,0.1); border-radius: 50%; backdrop-filter: blur(6px);"></div>
                </td>
              </tr>

              <!-- MAIN CONTENT -->
              <tr>
                <td style="padding:60px 50px;">
                  <div style="text-align: center; margin-bottom: 40px;">
                    <h2 style="font-family: 'Poppins', sans-serif; font-size:26px; font-weight:600; color:#1A1A1A; margin:0 0 20px; letter-spacing: -0.2px;">
                      🔐 Reset Your Password
                    </h2>
                    <p style="font-size:18px; line-height:1.7; color:#4B5563; margin:0; max-width: 480px; margin: 0 auto;">
                      Use the verification code below to reset your password and regain access to your account.
                    </p>
                  </div>

                  <!-- PREMIUM OTP CODE SECTION -->
                  <div style="text-align:center; background: linear-gradient(135deg, rgba(239, 68, 68, 0.06) 0%, rgba(249, 115, 22, 0.04) 25%, rgba(234, 179, 8, 0.06) 50%, rgba(132, 204, 22, 0.04) 75%, rgba(16, 185, 129, 0.06) 100%); border: 2px dashed rgba(239, 68, 68, 0.2); border-radius:24px; padding:40px; margin: 40px 0; position: relative; overflow: hidden;">
                    <!-- Warning Pattern -->
                    <div style="position: absolute; top: -15px; right: -15px; width: 80px; height: 80px; background: radial-gradient(circle, rgba(239, 68, 68, 0.05) 0%, transparent 70%); border-radius: 50%;"></div>
                    <div style="position: absolute; bottom: -15px; left: -15px; width: 60px; height: 60px; background: radial-gradient(circle, rgba(249, 115, 22, 0.05) 0%, transparent 70%); border-radius: 50%;"></div>
                    
                    <div style="position: relative; z-index: 1;">
                      <div style="color:#6B7280; font-size:16px; margin-bottom:20px; font-weight:500; font-family: 'Poppins', sans-serif;">Your Password Reset Code</div>
                      
                      <!-- Premium OTP Display -->
                      <div style="background: linear-gradient(135deg, #FFFFFF 0%, #FEF7F7 100%); border-radius: 20px; padding: 24px; margin: 20px 0; box-shadow: 0 8px 32px rgba(239, 68, 68, 0.1), inset 0 1px 0 rgba(255,255,255,0.7); border: 1px solid rgba(239, 68, 68, 0.1);">
                        <div style="font-weight:700; font-family: 'Inter', 'SF Mono', Monaco, Consolas, monospace; color:#EF4444; letter-spacing:12px; font-size:36px; margin:8px 0; text-shadow: 0 2px 4px rgba(239, 68, 68, 0.1);">
                          ${otp}
                        </div>
                      </div>
                      
                      <div style="color:#9CA3AF; font-size:15px; margin-top:20px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <span style="font-size: 16px;">⏰</span>
                        <span>Code expires in <strong style="color:#1A1A1A; font-weight: 600;">${expiryMinutes} minutes</strong></span>
                      </div>
                    </div>
                  </div>

                  <!-- ENHANCED CTA BUTTON -->
                  <div style="text-align:center; margin:50px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="https://sawari.pk" style="display:inline-block; background: linear-gradient(135deg, #EF4444 0%, #F97316 100%); color:#FFFFFF; text-decoration:none; padding:18px 36px; border-radius:50px; font-size:16px; font-weight:600; box-shadow: 0 12px 40px rgba(239, 68, 68, 0.35), 0 4px 20px rgba(0,0,0,0.1); transition: all 0.3s ease; font-family: 'Poppins', sans-serif; letter-spacing: 0.3px;">
                            🔑 Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- SECURITY NOTICE -->
                  <div style="background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%); border-left: 4px solid #EF4444; border-radius:20px; padding:24px; margin:40px 0; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -10px; right: -10px; width: 60px; height: 60px; background: radial-gradient(circle, rgba(239, 68, 68, 0.05) 0%, transparent 70%); border-radius: 50%;"></div>
                    <div style="position: relative; z-index: 1;">
                      <h3 style="color:#DC2626; font-size:18px; font-weight:600; margin:0 0 12px; font-family: 'Poppins', sans-serif; display: flex; align-items: center; gap: 8px;">
                        🛡️ Security Notice
                      </h3>
                      <p style="color:#7F1D1D; font-size:16px; margin:0; line-height:1.6; font-weight: 500;">
                        If you didn't request this password reset, please ignore this email or contact our support team immediately.
                      </p>
                    </div>
                  </div>

                  <!-- HELP SECTION -->
                  <div style="background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%); border-radius:20px; padding:32px; text-align:center; margin-top:40px; border: 1px solid #E2E8F0; position: relative;">
                    <div style="position: absolute; top: -15px; left: -15px; width: 80px; height: 80px; background: radial-gradient(circle, rgba(77, 166, 255, 0.03) 0%, transparent 70%); border-radius: 50%;"></div>
                    <div style="position: relative; z-index: 1;">
                      <h3 style="font-size: 18px; font-weight: 600; color: #1A1A1A; margin: 0 0 12px; font-family: 'Poppins', sans-serif;">Need Help?</h3>
                      <p style="font-size:15px; color:#6B7280; margin:0;">
                        Contact us at <a href="mailto:support@sawari.pk" style="color:#4DA6FF; text-decoration:none; font-weight:600;">support@sawari.pk</a>
                      </p>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- PREMIUM FOOTER -->
              <tr>
                <td style="background: linear-gradient(135deg, #1A1A1A 0%, #2D3748 100%); padding:40px 50px; text-align:center; position: relative;">
                  <!-- Brand gradient line -->
                  <div style="position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(239, 68, 68, 0.3) 20%, rgba(249, 115, 22, 0.3) 40%, rgba(77, 166, 255, 0.3) 60%, rgba(16, 185, 129, 0.3) 80%, transparent 100%);"></div>
                  
                  <div style="margin-bottom:24px;">
                    <h3 style="color:#FFFFFF; font-size:24px; font-weight:700; margin:0 0 8px; font-family: 'Poppins', sans-serif; letter-spacing: -0.3px;">Sawari.pk</h3>
                    <p style="color:#A0AEC0; font-size:16px; margin:0; font-weight: 500;">"Ride Better. Pay Smarter."</p>
                  </div>
                  
                  <div style="border-top:1px solid #4A5568; padding-top:24px; margin-top:24px;">
                    <p style="color:#718096; font-size:14px; margin:0 0 16px; font-weight: 500;">Made with ❤️ by the Sawari.pk team</p>
                    <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
                      <a href="https://sawari.pk" style="color:#4DA6FF; text-decoration:none; font-size:14px; font-weight: 500; padding: 8px 16px; border-radius: 20px; background: rgba(77, 166, 255, 0.1); transition: all 0.3s ease;">Website</a>
                      <span style="color:#4A5568; font-size:14px;">•</span>
                      <a href="https://github.com/gauravkhatriweb" style="color:#4DA6FF; text-decoration:none; font-size:14px; font-weight: 500; padding: 8px 16px; border-radius: 20px; background: rgba(77, 166, 255, 0.1); transition: all 0.3s ease;">GitHub</a>
                      <span style="color:#4A5568; font-size:14px;">•</span>
                      <a href="mailto:support@sawari.pk" style="color:#4DA6FF; text-decoration:none; font-size:14px; font-weight: 500; padding: 8px 16px; border-radius: 20px; background: rgba(77, 166, 255, 0.1); transition: all 0.3s ease;">Support</a>
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
    `;
};

export default {
    getPassengerWelcomeEmailHTML,
    getPassengerVerifyOtpEmailHTML,
    getPassengerResetPasswordEmailHTML,
};


