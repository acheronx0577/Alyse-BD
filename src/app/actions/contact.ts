"use server";

type ContactResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitContact(formData: FormData): Promise<ContactResult> {
  const name = formData.get("name")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  const message = formData.get("message")?.toString().trim() ?? "";

  if (!name || !email || !message) {
    return { ok: false, error: "Please fill in all fields." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  // Placeholder until a persistence layer is wired up.
  console.info("Contact submission received", { name, email, messageLength: message.length });

  return { ok: true };
}
