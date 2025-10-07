import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ExitIntentRequest {
  email: string;
  userAgent?: string;
  ipAddress?: string;
  honeypot?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract IP address for rate limiting
    const requestIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                      req.headers.get('x-real-ip') || 
                      'unknown';
    
    const { email, userAgent, ipAddress, honeypot }: ExitIntentRequest = await req.json();

    // Honeypot check - if filled, silently reject (bot detected)
    if (honeypot && honeypot.trim() !== '') {
      console.log(`Bot detected via honeypot from IP ${requestIp}`);
      // Return fake success to not tip off bots
      return new Response(
        JSON.stringify({ success: true, message: 'Guide sent successfully!' }),
        {
          status: 200,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          },
        }
      );
    }

    // Enhanced email validation with regex and normalization
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const normalizedEmail = email?.trim().toLowerCase();
    
    if (!normalizedEmail || !emailRegex.test(normalizedEmail) || normalizedEmail.length > 255) {
      console.log(`Invalid email format attempted: ${email} from IP ${requestIp}`);
      return new Response(
        JSON.stringify({ error: 'Valid email address is required' }),
        {
          status: 400,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          },
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Check rate limit (3 requests per hour for exit intent)
    const { data: rateLimitResult, error: rateLimitError } = await supabase
      .rpc('check_rate_limit', {
        p_ip_address: requestIp,
        p_endpoint: 'exit-intent-capture',
        p_max_requests: 3,
        p_window_minutes: 60
      });
    
    if (rateLimitError) {
      console.error('Rate limit check failed:', rateLimitError);
    } else if (rateLimitResult && !rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for IP ${requestIp}`);
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests. Please try again later.',
          retry_after_minutes: rateLimitResult.retry_after_minutes 
        }),
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          },
        }
      );
    }

    // Check if email already exists
    const { data: existingLead, error: checkError } = await supabase
      .from("exit_intent_leads")
      .select("id, email, guide_sent")
      .eq("email", normalizedEmail)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing lead:", checkError);
      throw new Error("Database error");
    }

    let leadId: string;

    if (existingLead) {
      leadId = existingLead.id;
      console.log(`Exit intent lead already exists for email: ${normalizedEmail}`);
      
      // If guide was already sent, inform user
      if (existingLead.guide_sent) {
        console.log(`Guide already sent to: ${normalizedEmail}`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'You have already received the guide. Please check your email inbox or spam folder.' 
          }),
          {
            status: 200,
            headers: { 
              "Content-Type": "application/json",
              ...corsHeaders 
            },
          }
        );
      }
    } else {
      // Insert new lead with normalized email
      const { data: newLead, error: insertError } = await supabase
        .from("exit_intent_leads")
        .insert({
          email: normalizedEmail,
          ip_address: requestIp || ipAddress,
          user_agent: userAgent,
          guide_sent: false,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Error inserting lead:", insertError);
        
        // Check if it's a duplicate email error (race condition)
        if (insertError.code === '23505') {
          console.log(`Duplicate email detected (race condition): ${normalizedEmail}`);
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'You have already received the guide. Please check your email inbox or spam folder.' 
            }),
            {
              status: 200,
              headers: { 
                "Content-Type": "application/json",
                ...corsHeaders 
              },
            }
          );
        }
        
        throw new Error("Failed to save lead");
      }

      leadId = newLead.id;
      console.log(`New exit intent lead captured: ${normalizedEmail}`);
    }

    // Send the dividend investing guide email
    try {
      const emailResponse = await resend.emails.send({
        from: "DividendTracker <guides@resend.dev>",
        to: [normalizedEmail],
        subject: "Your FREE Dividend Investing Guide",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb; margin-bottom: 20px;">Your FREE Dividend Investing Guide</h1>
            
            <p>Thank you for your interest in dividend investing! Here's your complete guide to building a $100k dividend portfolio.</p>
            
            <div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0;">
              <h2 style="color: #1e293b; margin-top: 0;">What's Inside Your Guide:</h2>
              <ul style="color: #475569;">
                <li><strong>Top 10 Dividend Stocks for Beginners</strong> - Hand-picked by experts</li>
                <li><strong>Dividend Safety Analysis</strong> - How to spot sustainable dividends</li>
                <li><strong>Portfolio Allocation Strategies</strong> - Build a balanced dividend portfolio</li>
                <li><strong>Tax-Efficient Investing</strong> - Keep more of what you earn</li>
                <li><strong>Income Growth Timeline</strong> - Your path to $100k portfolio</li>
              </ul>
            </div>
            
            <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <h3 style="color: #dc2626; margin-top: 0;">🎯 Bonus Resources Included:</h3>
              <p style="color: #7f1d1d; margin: 0;">
                • Dividend tracking spreadsheet template<br>
                • Monthly dividend calendar<br>
                • Risk assessment checklist
              </p>
            </div>
            
            <p><strong>Download your guide:</strong> <a href="#" style="color: #2563eb;">Click here to access your guide</a></p>
            
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              Happy investing!<br>
              The DividendTracker Team
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="color: #94a3b8; font-size: 12px;">
              You received this email because you requested our dividend investing guide. 
              <a href="#" style="color: #94a3b8;">Unsubscribe</a>
            </p>
          </div>
        `,
      });

      console.log("Guide email sent successfully:", emailResponse);

      // Update lead as guide sent
      await supabase
        .from("exit_intent_leads")
        .update({ guide_sent: true })
        .eq("id", leadId);

    } catch (emailError) {
      console.error("Error sending guide email:", emailError);
      // Don't throw error here - lead was captured successfully
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Guide sent successfully to your email!" 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in exit-intent-capture function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Something went wrong" 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);