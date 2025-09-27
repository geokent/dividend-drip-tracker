import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const hookSecret = Deno.env.get("AUTH_HOOK_SECRET") || "your-webhook-secret-here";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    // Verify webhook signature
    const wh = new Webhook(hookSecret);
    let webhookData;
    
    try {
      webhookData = wh.verify(payload, headers) as any;
    } catch (error) {
      console.error("Webhook verification failed:", error);
      return new Response("Webhook verification failed", { status: 401 });
    }

    const { user, email_data } = webhookData;
    
    if (!user?.email || !email_data) {
      console.error("Missing required data in webhook payload");
      return new Response("Missing required data", { status: 400 });
    }

    console.log(`Processing auth email for: ${user.email}, type: ${email_data.email_action_type}`);

    let subject = "";
    let htmlContent = "";

    // Handle different email types
    switch (email_data.email_action_type) {
      case "signup":
        subject = "Welcome to DivTrkr - Verify Your Email";
        htmlContent = createSignupEmail(email_data, user);
        break;
      case "recovery":
        subject = "Reset Your DivTrkr Password";
        htmlContent = createRecoveryEmail(email_data, user);
        break;
      case "magiclink":
        subject = "Your DivTrkr Magic Link";
        htmlContent = createMagicLinkEmail(email_data, user);
        break;
      case "email_change":
        subject = "Confirm Your Email Change - DivTrkr";
        htmlContent = createEmailChangeEmail(email_data, user);
        break;
      default:
        console.log("Unknown email type:", email_data.email_action_type);
        return new Response("Unknown email type", { status: 400 });
    }

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "DivTrkr <auth@divtrkr.com>", // Using your branded domain
      to: [user.email],
      subject: subject,
      html: htmlContent,
    });

    if (emailResponse.error) {
      console.error("Error sending email:", emailResponse.error);
      return new Response(
        JSON.stringify({ error: emailResponse.error }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Email sent successfully:", emailResponse.data?.id);

    return new Response(
      JSON.stringify({ message: "Email sent successfully", id: emailResponse.data?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in auth-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

// Common email styles using DivTrkr branding
const getEmailStyles = () => `
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
    line-height: 1.6; 
    color: #0f172a; 
    margin: 0; 
    padding: 0; 
    background-color: #f8fafc;
  }
  .container { 
    max-width: 600px; 
    margin: 40px auto; 
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.1);
  }
  .header { 
    background: linear-gradient(135deg, hsl(200, 100%, 40%) 0%, hsl(200, 100%, 35%) 100%); 
    color: white; 
    padding: 48px 32px; 
    text-align: center;
  }
  .header h1 { 
    margin: 0 0 8px 0; 
    font-size: 28px; 
    font-weight: 700; 
    letter-spacing: -0.025em;
  }
  .header p { 
    margin: 0; 
    font-size: 16px; 
    opacity: 0.95;
  }
  .content { 
    padding: 48px 32px; 
  }
  .content h2 { 
    margin: 0 0 24px 0; 
    font-size: 22px; 
    font-weight: 600; 
    color: #0f172a;
  }
  .content p { 
    margin: 0 0 20px 0; 
    color: #374151; 
    font-size: 16px;
  }
  .button { 
    display: inline-block; 
    background: hsl(200, 100%, 40%); 
    color: white !important; 
    padding: 16px 32px; 
    text-decoration: none; 
    border-radius: 8px; 
    margin: 24px 0; 
    font-weight: 600;
    font-size: 16px;
    transition: all 0.2s ease;
  }
  .button:hover { 
    background: hsl(200, 100%, 35%); 
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0, 102, 204, 0.25);
  }
  .button-container {
    text-align: center;
    margin: 32px 0;
  }
  .link-text { 
    word-break: break-all; 
    color: hsl(200, 100%, 40%); 
    font-size: 14px;
    background: #f1f5f9;
    padding: 12px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
  }
  .features {
    background: #f8fafc;
    border-radius: 8px;
    padding: 24px;
    margin: 24px 0;
  }
  .features ul {
    margin: 0;
    padding-left: 20px;
  }
  .features li {
    margin: 8px 0;
    color: #374151;
  }
  .footer { 
    background: #f8fafc;
    text-align: center; 
    padding: 32px; 
    color: #6b7280; 
    font-size: 14px; 
    border-top: 1px solid #e5e7eb;
  }
  .footer p {
    margin: 4px 0;
  }
  .logo {
    font-size: 24px;
    font-weight: 800;
    margin-bottom: 8px;
    color: white;
  }
`;

// Email template functions
function createSignupEmail(emailData: any, user: any): string {
  const confirmUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${emailData.token_hash}&type=${emailData.email_action_type}&redirect_to=${encodeURIComponent(emailData.redirect_to || 'https://divtrkr.com')}`;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Welcome to DivTrkr</title>
        <style>${getEmailStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">📊 DivTrkr</div>
            <h1>Welcome to DivTrkr! 🎉</h1>
            <p>Your dividend tracking journey starts here</p>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Hi there!</p>
            <p>Thanks for signing up for DivTrkr, the smart way to track your dividend investments. To get started, please verify your email address by clicking the button below:</p>
            
            <div class="button-container">
              <a href="${confirmUrl}" class="button">Verify Email Address</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <div class="link-text">${confirmUrl}</div>
            
            <div class="features">
              <p><strong>Once verified, you'll be able to:</strong></p>
              <ul>
                <li>📈 Track your dividend-paying stocks and ETFs</li>
                <li>💰 Monitor dividend payments and yields in real-time</li>
                <li>📊 View comprehensive portfolio analytics</li>
                <li>🎯 Set up dividend tracking goals and milestones</li>
                <li>📱 Connect your brokerage accounts securely</li>
              </ul>
            </div>
            
            <p>If you didn't create an account with DivTrkr, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p><strong>DivTrkr</strong> - Smart Dividend Tracking</p>
            <p>&copy; 2024 DivTrkr. All rights reserved.</p>
            <p>Happy dividend tracking! 📈</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function createRecoveryEmail(emailData: any, user: any): string {
  const resetUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${emailData.token_hash}&type=${emailData.email_action_type}&redirect_to=${encodeURIComponent(emailData.redirect_to || 'https://divtrkr.com')}`;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Reset Your DivTrkr Password</title>
        <style>${getEmailStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">📊 DivTrkr</div>
            <h1>Reset Your Password 🔐</h1>
            <p>Let's get you back into your DivTrkr account</p>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hi there!</p>
            <p>We received a request to reset your DivTrkr password. Click the button below to create a new password and get back to tracking your dividends:</p>
            
            <div class="button-container">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <div class="link-text">${resetUrl}</div>
            
            <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged and your account is secure.</p>
          </div>
          <div class="footer">
            <p><strong>DivTrkr</strong> - Smart Dividend Tracking</p>
            <p>&copy; 2024 DivTrkr. All rights reserved.</p>
            <p>Keep your account secure! 🛡️</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function createMagicLinkEmail(emailData: any, user: any): string {
  const magicUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${emailData.token_hash}&type=${emailData.email_action_type}&redirect_to=${encodeURIComponent(emailData.redirect_to || 'https://divtrkr.com')}`;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Your DivTrkr Magic Link</title>
        <style>${getEmailStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">📊 DivTrkr</div>
            <h1>Your Magic Link ✨</h1>
            <p>Sign in to DivTrkr with one click</p>
          </div>
          <div class="content">
            <h2>Sign In to DivTrkr</h2>
            <p>Hi there!</p>
            <p>Click the button below to sign in to your DivTrkr account instantly and continue tracking your dividend portfolio:</p>
            
            <div class="button-container">
              <a href="${magicUrl}" class="button">Sign In to DivTrkr</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <div class="link-text">${magicUrl}</div>
            
            <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this sign-in link, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p><strong>DivTrkr</strong> - Smart Dividend Tracking</p>
            <p>&copy; 2024 DivTrkr. All rights reserved.</p>
            <p>Happy dividend tracking! 📈</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function createEmailChangeEmail(emailData: any, user: any): string {
  const confirmUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${emailData.token_hash}&type=${emailData.email_action_type}&redirect_to=${encodeURIComponent(emailData.redirect_to || 'https://divtrkr.com')}`;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Confirm Email Change - DivTrkr</title>
        <style>${getEmailStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">📊 DivTrkr</div>
            <h1>Confirm Email Change 📧</h1>
            <p>Verify your new email address</p>
          </div>
          <div class="content">
            <h2>Email Change Request</h2>
            <p>Hi there!</p>
            <p>We received a request to change your email address for your DivTrkr account. To complete this change, please verify your new email address by clicking the button below:</p>
            
            <div class="button-container">
              <a href="${confirmUrl}" class="button">Confirm Email Change</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <div class="link-text">${confirmUrl}</div>
            
            <p><strong>Important:</strong> If you didn't request this email change, please contact our support team immediately to secure your account.</p>
          </div>
          <div class="footer">
            <p><strong>DivTrkr</strong> - Smart Dividend Tracking</p>
            <p>&copy; 2024 DivTrkr. All rights reserved.</p>
            <p>Keep your account secure! 🛡️</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

serve(handler);