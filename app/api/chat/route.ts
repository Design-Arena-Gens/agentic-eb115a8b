import { NextResponse } from "next/server";

type IncomingMessage = {
  message?: string;
  history?: { role: "user" | "assistant"; text: string }[];
};

const fallbackReplies = [
  "I'm all ears—tell me more!",
  "That sounds interesting. What else is happening?",
  "I hear you. Want to go a little deeper?",
  "I'm here with you. What's on your mind next?"
];

const pick = <T,>(items: T[]): T => {
  if (!items.length) {
    throw new Error("Expected a non-empty array");
  }
  const index = Math.floor(Math.random() * items.length);
  return items[index];
};

const deriveReply = (prompt: string, historySize: number): string => {
  const lower = prompt.toLowerCase();

  if (/\b(hi|hey|hello|sup)\b/.test(lower)) {
    return "Hey! 👋 How's your day shaping up so far?";
  }

  if (/\b(how are you|how's it going)\b/.test(lower)) {
    return "I'm feeling chatty and focused—ready for whatever you want to talk about. How are you doing?";
  }

  if (lower.includes("bye") || lower.includes("goodnight") || lower.includes("see you")) {
    return "I'll be right here whenever you want to pick things up again. Sleep well or enjoy the rest of your day!";
  }

  if (lower.includes("thank")) {
    return "Anytime. Happy to hang out and keep the conversation going.";
  }

  if (historySize <= 1) {
    return "Tell me what's been on your mind lately.";
  }

  if (lower.includes("tired") || lower.includes("exhausted")) {
    return "Sounds like you've been pushing hard. Want to unpack what's wearing you out or brainstorm ways to recharge?";
  }

  if (lower.includes("excited") || lower.includes("happy")) {
    return "I love that energy. What sparked the excitement?";
  }

  return pick(fallbackReplies);
};

export async function POST(request: Request) {
  const payload: IncomingMessage = await request.json().catch(() => ({}));
  const prompt = payload.message?.trim();

  if (!prompt) {
    return NextResponse.json(
      { reply: "I didn't quite catch that. Could you say it again?" },
      { status: 400 }
    );
  }

  const historySize = payload.history?.length ?? 0;
  const reply = deriveReply(prompt, historySize);

  return NextResponse.json({ reply });
}
