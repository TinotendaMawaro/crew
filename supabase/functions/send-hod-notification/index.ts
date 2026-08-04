import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

serve(async (req) => {
    try {
        if (req.method !== "POST") {
            return new Response(JSON.stringify({ error: "Method not allowed" }), {
                status: 405,
                headers: { "Content-Type": "application/json" }
            });
        }

        const payload = (await req.json()) as HODEmailPayload;
        const { email, fullname, type, area, section, oldArea, oldSection, servingNo, reason } = payload;

        if (!email || !fullname || !type) {
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

        const getSubject = () => {
            switch (type) {
                case "reassignment": return `Sector Reassigned - ${servingNo || "Crew Member"}`;
                case "approval": return `Registration Approved - ${servingNo || "Crew Member"}`;
                case "decline": return `Registration Update - ${servingNo || "Crew Member"}`;
                default: return "HIM Media Crew Notification";
            }
        };

        const getHtml = () => {
            const titleMap = {
                reassignment: "Sector Reassigned",
                approval: "Registration Approved",
                decline: "Registration Update"
            };
            const title = titleMap[type];
            const messageMap = {
                reassignment: `Dear <strong style="color: #06b6d4;">${fullname}</strong>, your serving sector has been updated by the HOD. Please review your new assignment below.`,
                approval: `Dear <strong style="color: #06b6d4;">${fullname}</strong>, your registration has been reviewed and <strong style="color: #22c55e;">approved</strong> by the HOD. You are cleared to serve.`,
                decline: `Dear <strong style="color: #06b6d4;">${fullname}</strong>, your registration has been reviewed. ${reason ? `<br><br><strong>Reason:</strong> ${reason}` : "Please contact the HOD for further details."}`
            };
            const body = messageMap[type];

            return `
                <div style="font-family: 'Inter', sans-serif; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 12px; background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);">
                    <div style="background: #090d16; border-radius: 12px; padding: 40px; text-align: center;">
                        <h1 style="color: #ffffff; font-size: 28px; margin-bottom: 8px;">${title}</h1>
                        <p style="color: #9ca3af; font-size: 14px;">Catch The Fire Conference 2026</p>
                    </div>
                    <div style="background: #0e1726; border-radius: 12px; padding: 30px; margin-top: 20px;">
                        <p style="color: #e5e7eb; font-size: 16px; line-height: 1.6;">${body}</p>
                        ${servingNo ? `
                        <div style="background: #090d16; border: 2px dashed #6366f1; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                            <p style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Serving Code</p>
                            <p style="color: #06b6d4; font-size: 32px; font-weight: bold; letter-spacing: 0.2em; margin: 0;">${servingNo}</p>
                        </div>
                        ` : ""}
                        ${(oldArea || oldSection) && type === "reassignment" ? `
                        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
                            <tr style="border-top: 1px solid #1f2937;">
                                <td style="color: #9ca3af; padding: 8px 0; width: 40%;">Previous Area</td>
                                <td style="color: #e5e7eb; padding: 8px 0; font-weight: 600;">${oldArea || "N/A"}</td>
                            </tr>
                            <tr style="border-top: 1px solid #1f2937;">
                                <td style="color: #9ca3af; padding: 8px 0;">Previous Section</td>
                                <td style="color: #e5e7eb; padding: 8px 0; font-weight: 600;">${oldSection || "N/A"}</td>
                            </tr>
                        </table>
                        ` : ""}
                        ${(area || section) ? `
                        <table style="width: 100%; border-collapse: collapse; margin-top: ${(oldArea || oldSection) ? "0" : "20px"}; font-size: 14px;">
                            <tr style="border-top: 1px solid #1f2937;">
                                <td style="color: #9ca3af; padding: 8px 0; width: 40%;">${type === "reassignment" ? "New Area" : "Area"}</td>
                                <td style="color: #e5e7eb; padding: 8px 0; font-weight: 600;">${area || "N/A"}</td>
                            </tr>
                            <tr style="border-top: 1px solid #1f2937;">
                                <td style="color: #9ca3af; padding: 8px 0;">${type === "reassignment" ? "New Section" : "Section"}</td>
                                <td style="color: #e5e7eb; padding: 8px 0; font-weight: 600;">${section || "N/A"}</td>
                            </tr>
                        </table>
                        ` : ""}
                    </div>
                    <div style="text-align: center; margin-top: 24px; color: #6b7280; font-size: 12px;">
                        HIM Media Department • Catch The Fire 2026
                    </div>
                </div>
            `;
        };

        const emailPayload = {
            from: "HIM Media <noreply@heartfelt.org>",
            to: [email],
            subject: getSubject(),
            html: getHtml()
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
