export function classifyBounce(error) {
  const code = error?.responseCode;
  const message = error?.message?.toLowerCase() || "";

  // HARD BOUNCES (never retry)
  if (
    code === 550 ||
    code === 551 ||
    code === 553 ||
    message.includes("user unknown") ||
    message.includes("mailbox not found") ||
    message.includes("no such user")
  ) {
    return "hard";
  }

  // SOFT BOUNCES (retry)
  if (
    code === 421 ||
    code === 450 ||
    code === 451 ||
    code === 452 ||
    message.includes("timeout") ||
    message.includes("temporarily unavailable") ||
    message.includes("rate limit")
  ) {
    return "soft";
  }

  // Default → FAILED
  return "failed";
}
