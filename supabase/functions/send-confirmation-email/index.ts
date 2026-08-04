import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface EmailPayload {
  email: string;
  fullname: string;
  servingNo: string;
  area?: string;
  section?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });
}

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return response({ error: "Method not allowed" }, 405);
    }

    const payload = (await req.json()) as EmailPayload;
    const { email, fullname, servingNo, area, section } = payload;

    if (!email || !fullname || !servingNo) {
      return response({ error: "Missing required fields: email, fullname, or servingNo" }, 400);
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      return response({ error: "Email service not configured" }, 500);
    }

    const resendPayload = {
     from: "HIM Media <noreply@heartfeltonline.org>",
      to: [email],
      subject: `CTF 2026 Crew Registration Confirmed - ${servingNo}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Crew Registration Confirmed</title>
</head>
<body style="margin:0; padding:0; background:#f3f4f6; font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:600px; margin:0 auto; padding:20px;">
  <div style="background:#090d16; border-radius:14px 14px 0 0; padding:40px 30px; text-align:center;">
    <h1 style="margin:0; color:#ffffff; font-size:28px;">Crew Registration Confirmed</h1>
    <p style="color:#9ca3af; font-size:14px; margin-top:10px;">Catch The Fire Conference 2026</p>
  </div>
  <div style="background:#ffffff; padding:35px 30px;">
    <p style="color:#1f2937; font-size:16px; line-height:1.6;">Dear <strong>${fullname}</strong>,</p>
    <p style="color:#4b5563; font-size:15px; line-height:1.7;">Your crew registration for Catch The Fire Conference 2026 has been successfully received.</p>
    <p style="color:#4b5563; font-size:15px; line-height:1.7;">Please keep your serving code safe. You may be required to present it during the media deployment process.</p>
    <div style="background:#090d16; border-radius:12px; padding:25px; margin:30px 0; text-align:center;">
      <p style="color:#9ca3af; font-size:12px; text-transform:uppercase; letter-spacing:2px; margin:0 0 10px 0;">Your Serving Code</p>
      <div style="color:#06b6d4; font-size:32px; font-weight:bold; letter-spacing:4px;">${servingNo}</div>
    </div>
    <table style="width:100%; border-collapse:collapse; font-size:14px;">
      <tr><td style="padding:12px 0; color:#6b7280; border-bottom:1px solid #e5e7eb;">Area</td><td style="padding:12px 0; color:#111827; font-weight:bold; text-align:right; border-bottom:1px solid #e5e7eb;">${area || "To be assigned"}</td></tr>
      <tr><td style="padding:12px 0; color:#6b7280;">Section</td><td style="padding:12px 0; color:#111827; font-weight:bold; text-align:right;">${section || "To be assigned"}</td></tr>
    </table>
  </div>
  <div style="background:#090d16; border-radius:0 0 14px 14px; padding:25px; text-align:center;">
    <p style="color:#9ca3af; font-size:12px; margin:0;">HIM Media Department</p>
    <p style="color:#6b7280; font-size:12px; margin:8px 0 0 0;">Catch The Fire Conference 2026</p>
  </div>
</div>
</body>
</html>
      `,
    };

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendPayload),
    });

    const data = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API error:", resendResponse.status, data);
      return response({ error: "Email dispatch failed", details: data }, 502);
    }

    return response({ success: true, message: "Confirmation email sent successfully", data });

  } catch (error) {
    console.error("send-confirmation-email error:", error);
    return response({ error: "Internal server error" }, 500);
  }
});
