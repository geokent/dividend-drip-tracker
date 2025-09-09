import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsletterSignupRequest {
  email: string;
  source?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, source = 'website' }: NewsletterSignupRequest = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email address is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Store subscriber in database
    const { data, error: dbError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: email.toLowerCase().trim(),
        source,
        subscribed_at: new Date().toISOString(),
        is_active: true
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      
      // Check if it's a duplicate email error
      if (dbError.code === '23505') {
        return new Response(
          JSON.stringify({ message: 'You are already subscribed to our newsletter!' }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to subscribe. Please try again.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Send welcome email using Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    const emailResponse = await resend.emails.send({
      from: 'DividendTracker <newsletter@resend.dev>',
      to: [email],
      subject: '🎉 Welcome to DividendTracker Newsletter!',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Welcome to DividendTracker!</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="font-size: 16px; color: #374151; margin: 0 0 15px 0;">
              Hi there! 👋
            </p>
            <p style="font-size: 16px; color: #374151; margin: 0 0 15px 0;">
              Thank you for subscribing to the DividendTracker newsletter! You're now part of an exclusive community of dividend investors who are serious about building wealth through dividend-paying stocks.
            </p>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 15px;">🎯 What You'll Receive:</h2>
            <ul style="color: #374151; font-size: 14px; line-height: 1.6;">
              <li><strong>Weekly Market Insights:</strong> Analysis of dividend market trends and opportunities</li>
              <li><strong>Stock Spotlights:</strong> Deep dives into high-quality dividend stocks</li>
              <li><strong>Portfolio Strategies:</strong> Tips for building and optimizing your dividend portfolio</li>
              <li><strong>Exclusive Tools:</strong> Early access to new features and calculators</li>
              <li><strong>FIRE Movement Updates:</strong> Strategies for financial independence through dividends</li>
            </ul>
          </div>

          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #1e40af; font-size: 16px; margin: 0 0 10px 0;">🚀 Get Started Today</h3>
            <p style="color: #1e40af; font-size: 14px; margin: 0 0 15px 0;">
              Start tracking your dividend portfolio and building your path to financial independence:
            </p>
            <a href="https://fdvpmommvnakoxggnjvt.supabase.co" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Launch DividendTracker →
            </a>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              You received this email because you subscribed to DividendTracker updates.<br>
              If you no longer wish to receive these emails, you can unsubscribe at any time.
            </p>
          </div>
        </div>
      `,
    });

    console.log('Newsletter signup successful:', { email, source, emailResponse });

    return new Response(
      JSON.stringify({ 
        message: 'Successfully subscribed! Check your email for a welcome message.',
        subscriber: { email: data.email, subscribed_at: data.subscribed_at }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in newsletter signup:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error. Please try again.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);