type BotVerificationResult = { ok: true } | { ok: false; error: string };

export async function verifyTurnstileToken(token: string): Promise<BotVerificationResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    console.warn("Turnstile is not configured; skipping bot verification.");
    return { ok: true };
  }

  if (!token) {
    return { ok: false, error: "Bot verification required." };
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret,
      response: token,
    }),
  });

  if (!response.ok) {
    return { ok: false, error: "Bot verification failed. Please try again." };
  }

  const result = (await response.json()) as { success?: boolean };
  if (!result.success) {
    return { ok: false, error: "Bot verification failed. Please try again." };
  }

  return { ok: true };
}
