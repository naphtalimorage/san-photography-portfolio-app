// Supabase Edge Function: send-contact-inquiry
// Deploy via Supabase CLI and pass secrets:
// - RESEND_API_KEY
// - RESEND_FROM (optional)

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Promise<Response> | Response): void;
};

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

const RECIPIENT = "Sanarerarin@gmail.com";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function sendEmailViaResend(options: {
  to: string;
  from: string;
  subject: string;
  text: string;
}) {
  const apiKey = Deno.env.get("RESEND_API_KEY");

  if (!apiKey) throw new Error("Missing RESEND_API_KEY environment variable");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: options.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Email send failed: ${res.status} ${txt}`);
  }

  return res.json();
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    const payload = (await req.json().catch(() => ({}))) as ContactPayload;

    const name = (payload.name ?? "").trim();
    const email = (payload.email ?? "").trim();
    const phone = (payload.phone ?? "").trim();
    const message = (payload.message ?? "").trim();

    if (!name || !email || !message) {
      return json({ error: "Missing required fields: name, email, message" }, 400);
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      return json({ error: "Invalid email address" }, 400);
    }

    const subject = `New inquiry from ${name}`;
    const text = [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : "Phone: (not provided)",
      `Message: ${message}`,
    ].join("\n");

    // FROM must be a verified sender on Resend
    const from = Deno.env.get("RESEND_FROM") || email;

    await sendEmailViaResend({
      to: RECIPIENT,
      from,
      subject,
      text,
    });

    return json({ ok: true });
  } catch (err) {
    return json({ error: (err as Error).message ?? "Unknown error" }, 500);
  }
});

