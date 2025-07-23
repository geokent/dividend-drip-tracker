import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@2.0.0";

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
      from: "DivTrkr <noreply@resend.dev>", // Update this to your verified domain
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

// Email template functions
function createSignupEmail(emailData: any, user: any): string {
  const confirmUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${emailData.token_hash}&type=${emailData.email_action_type}&redirect_to=${encodeURIComponent(emailData.redirect_to || 'https://your-app.com')}`;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Welcome to DivTrkr</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to DivTrkr! 🎉</h1>
            <p>Your dividend tracking journey starts here</p>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Hi there!</p>
            <p>Thanks for signing up for DivTrkr. To get started, please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
              <a href="${confirmUrl}" class="button">Verify Email Address</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${confirmUrl}</p>
            <p>Once verified, you'll be able to:</p>
            <ul>
              <li>Track your dividend-paying stocks</li>
              <li>Monitor dividend payments and yields</li>
              <li>View comprehensive portfolio analytics</li>
              <li>Set up dividend tracking goals</li>
            </ul>
            <p>If you didn't create an account with DivTrkr, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 DivTrkr. All rights reserved.</p>
            <p>Happy dividend tracking! 📈</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function createRecoveryEmail(emailData: any, user: any): string {
  const resetUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${emailData.token_hash}&type=${emailData.email_action_type}&redirect_to=${encodeURIComponent(emailData.redirect_to || 'https://your-app.com')}`;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Reset Your DivTrkr Password</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password 🔐</h1>
            <p>Let's get you back into your DivTrkr account</p>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hi there!</p>
            <p>We received a request to reset your DivTrkr password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 DivTrkr. All rights reserved.</p>
            <p>Keep your account secure! 🛡️</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function createMagicLinkEmail(emailData: any, user: any): string {
  const magicUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${emailData.token_hash}&type=${emailData.email_action_type}&redirect_to=${encodeURIComponent(emailData.redirect_to || 'https://your-app.com')}`;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Your DivTrkr Magic Link</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Magic Link ✨</h1>
            <p>Sign in to DivTrkr with one click</p>
          </div>
          <div class="content">
            <h2>Sign In to DivTrkr</h2>
            <p>Hi there!</p>
            <p>Click the button below to sign in to your DivTrkr account instantly:</p>
            <p style="text-align: center;">
              <a href="${magicUrl}" class="button">Sign In to DivTrkr</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${magicUrl}</p>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this sign-in link, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 DivTrkr. All rights reserved.</p>
            <p>Happy dividend tracking! 📈</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function createEmailChangeEmail(emailData: any, user: any): string {
  const confirmUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${emailData.token_hash}&type=${emailData.email_action_type}&redirect_to=${encodeURIComponent(emailData.redirect_to || 'https://your-app.com')}`;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Confirm Email Change - DivTrkr</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Confirm Email Change 📧</h1>
            <p>Verify your new email address</p>
          </div>
          <div class="content">
            <h2>Email Change Request</h2>
            <p>Hi there!</p>
            <p>We received a request to change your email address for your DivTrkr account. To complete this change, please verify your new email address by clicking the button below:</p>
            <p style="text-align: center;">
              <a href="${confirmUrl}" class="button">Confirm Email Change</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${confirmUrl}</p>
            <p>If you didn't request this email change, please contact our support team immediately.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 DivTrkr. All rights reserved.</p>
            <p>Keep your account secure! 🛡️</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

serve(handler);