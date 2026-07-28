import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface EmailPayload {
    email: string;
    fullname: string;
    servingNo: string;
    area: string;
    section: string;
}

serve(async (req) => {
    try {
        if (req.method !== "POST") {
            return new Response(JSON.stringify({ error: "Method not allowed" }), {
                status: 405,
                headers: { "Content-Type": "application/json" }
            });
        }

        const payload = (await req.json()) as EmailPayload;
        const { email, fullname, servingNo, area, section } = payload;

        if (!email || !fullname || !servingNo) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        if (!resendApiKey) {
            return new Response(JSON.stringify({ error: "Email service not configured" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        const emailPayload = {
            from: "HIM Media <noreply@heartfelt.org>",
            to: [email],
            subject: `CTF 2026 Crew Registration Confirmed - ${servingNo}`,
            html: `
                <div style="font-family: 'Inter', sans-serif; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 12px; background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);">
                    <div style="background: #090d16; border-radius: 12px; padding: 40px; text-align: center;">
                        <h1 style="color: #ffffff; font-size: 28px; margin-bottom: 8px;">Crew Registration Confirmed</h1>
                        <p style="color: #9ca3af; font-size: 14px;">Catch The Fire Conference 2026</p>
                    </div>
                    <div style="background: #0e1726; border-radius: 12px; padding: 30px; margin-top: 20px;">
                        <p style="color: #e5e7eb; font-size: 16px; line-height: 1.6;">
                            Dear <strong style="color: #06b6d4;">${fullname}</strong>,
                        </p>
                        <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin-top: 16px;">
                            Your serving details have been registered successfully. Please present your unique serving code at the media deployment checkpoint.
                        </p>
                        <div style="background: #090d16; border: 2px dashed #6366f1; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                            <p style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Serving Code</p>
                            <p style="color: #06b6d4; font-size: 32px; font-weight: bold; letter-spacing: 0.2em; margin: 0;">${servingNo}</p>
                        </div>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
                            <tr>
                                <td style="color: #9ca3af; padding: 8px 0; width: 40%;">Area</td>
                                <td style="color: #e5e7eb; padding: 8px 0; font-weight: 600;">${area}</td>
                            </tr>
                            <tr style="border-top: 1px solid #1f2937;">
                                <td style="color: #9ca3af; padding: 8px 0;">Section</td>
                                <td style="color: #e5e7eb; padding: 8px 0; font-weight: 600;">${section}</td>
                            </tr>
                        </table>
                    </div>
                    <div style="text-align: center; margin-top: 24px; color: #6b7280; font-size: 12px;">
                        HIM Media Department • Catch The Fire 2026
                    </div>
                </div>
            `
        };

        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${resendApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(emailPayload)
        });

        if (!res.ok) {
            const errBody = await res.text();
            console.error("Resend API error:", res.status, errBody);
            return new Response(JSON.stringify({ error: "Email dispatch failed" }), {
                status: 502,
                headers: { "Content-Type": "application/json" }
            });
        }

        const data = await res.json();
        return new Response(JSON.stringify({ success: true, data }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        console.error("Edge function error:", err);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
});
