import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface HODEmailPayload {
    email: string;
    fullname: string;
    type: "reassignment" | "approval" | "decline";
    area?: string;
    section?: string;
    oldArea?: string;
    oldSection?: string;
    servingNo?: string;
    reason?: string;
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

        const payload = (await req.json()) as HODEmailPayload;
        const { email, fullname, type, area, section, oldArea, oldSection, servingNo, reason } = payload;

        if (!email || !fullname || !type) {
            return response({ error: "Missing required fields: email, fullname, or type" }, 400);
        }

        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        if (!resendApiKey) {
            console.error("RESEND_API_KEY is not configured");
            return response({ error: "Email service not configured" }, 500);
        }

        const subjectMap: Record<string, string> = {
            reassignment: `Sector Reassigned - ${servingNo || "Crew Member"}`,
            approval: `Registration Approved - ${servingNo || "Crew Member"}`,
            decline: `Registration Update - ${servingNo || "Crew Member"}`,
        };

        const bodyMap: Record<string, string> = {
            reassignment: `Dear <strong>${fullname}</strong>, your serving sector has been updated by the HOD. Please review your new assignment below.`,
            approval: `Dear <strong>${fullname}</strong>, your registration has been reviewed and <strong style="color:#22c55e;">approved</strong> by the HOD. You are cleared to serve.`,
            decline: `Dear <strong>${fullname}</strong>, your registration has been reviewed. ${reason ? `<br><br><strong>Reason:</strong> ${reason}` : "Please contact the HOD for further details."}`,
        };

        const titleMap: Record<string, string> = {
            reassignment: "Sector Reassigned",
            approval: "Registration Approved",
            decline: "Registration Update",
        };

        const resendPayload = {
            from: "HIM Media <noreply@heartfeltonline.org>",
            to: [email],
            subject: subjectMap[type] || "HIM Media Crew Notification",
            html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titleMap[type] || "Notification"}</title>
</head>
<body style="margin:0; padding:0; background:#f3f4f6; font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:600px; margin:0 auto; padding:20px;">
  <div style="background:#090d16; border-radius:14px 14px 0 0; padding:40px 30px; text-align:center;">
    <h1 style="margin:0; color:#ffffff; font-size:28px;">${titleMap[type] || "Notification"}</h1>
    <p style="color:#9ca3af; font-size:14px; margin-top:10px;">Catch The Fire Conference 2026</p>
  </div>
  <div style="background:#ffffff; padding:35px 30px;">
    <p style="color:#4b5563; font-size:15px; line-height:1.7;">${bodyMap[type]}</p>
    ${servingNo ? `
    <div style="background:#090d16; border-radius:12px; padding:25px; margin:30px 0; text-align:center;">
      <p style="color:#9ca3af; font-size:12px; text-transform:uppercase; letter-spacing:2px; margin:0 0 10px 0;">Serving Code</p>
      <div style="color:#06b6d4; font-size:32px; font-weight:bold; letter-spacing:4px;">${servingNo}</div>
    </div>
    ` : ""}
    ${(oldArea || oldSection) && type === "reassignment" ? `
    <table style="width:100%; border-collapse:collapse; font-size:14px;">
      <tr><td style="padding:12px 0; color:#6b7280; border-bottom:1px solid #e5e7eb;">Previous Area</td><td style="padding:12px 0; color:#111827; font-weight:bold; text-align:right; border-bottom:1px solid #e5e7eb;">${oldArea || "N/A"}</td></tr>
      <tr><td style="padding:12px 0; color:#6b7280; border-bottom:1px solid #e5e7eb;">Previous Section</td><td style="padding:12px 0; color:#111827; font-weight:bold; text-align:right; border-bottom:1px solid #e5e7eb;">${oldSection || "N/A"}</td></tr>
    </table>
    ` : ""}
    ${(area || section) ? `
    <table style="width:100%; border-collapse:collapse; font-size:14px; margin-top:${(oldArea || oldSection) ? "0" : "0"}px;">
      <tr><td style="padding:12px 0; color:#6b7280; border-bottom:1px solid #e5e7eb;">${type === "reassignment" ? "New Area" : "Area"}</td><td style="padding:12px 0; color:#111827; font-weight:bold; text-align:right; border-bottom:1px solid #e5e7eb;">${area || "N/A"}</td></tr>
      <tr><td style="padding:12px 0; color:#6b7280;">${type === "reassignment" ? "New Section" : "Section"}</td><td style="padding:12px 0; color:#111827; font-weight:bold; text-align:right;">${section || "N/A"}</td></tr>
    </table>
    ` : ""}
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

        return response({ success: true, message: "HOD notification sent successfully", data });

    } catch (error) {
        console.error("send-hod-notification error:", error);
        return response({ error: "Internal server error" }, 500);
    }
});
