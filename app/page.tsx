"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: number;
};

type ChatResponse = {
  reply: string;
};

const createMessage = (role: Message["role"], text: string): Message => ({
  id: crypto.randomUUID(),
  role,
  text,
  createdAt: Date.now()
});

const greeting = createMessage(
  "assistant",
  "Hey there! I'm here and ready to chat whenever you are."
);

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([greeting]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, isThinking]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;

    const userMessage = createMessage("user", trimmed);
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    try {
      const result = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history: messages })
      });

      if (!result.ok) {
        throw new Error("Request failed");
      }

      const data: ChatResponse = await result.json();
      const assistantMessage = createMessage("assistant", data.reply);
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = createMessage(
        "assistant",
        "I hit a snag replying just now. Mind trying again?"
      );
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <main className="wrapper">
      <section className="chat">
        <header className="header">
          <h1>Talk To Me</h1>
          <p>Casual conversation, always on.</p>
        </header>
        <div className="messages" ref={scrollRef}>
          {messages.map(message => (
            <article
              key={message.id}
              className={`message ${message.role === "assistant" ? "assistant" : "user"}`}
            >
              <span className="role">{message.role === "assistant" ? "Agent" : "You"}</span>
              <p>{message.text}</p>
            </article>
          ))}
          {isThinking ? (
            <article className="message assistant thinking">
              <span className="role">Agent</span>
              <p>
                <span className="dot dot-one" />
                <span className="dot dot-two" />
                <span className="dot dot-three" />
              </p>
            </article>
          ) : null}
        </div>
        <form className="composer" onSubmit={handleSubmit}>
          <input
            aria-label="Type your message"
            autoComplete="off"
            maxLength={480}
            value={input}
            onChange={event => setInput(event.target.value)}
            placeholder="Tell me what's on your mind…"
          />
          <button type="submit" disabled={!input.trim() || isThinking}>
            Send
          </button>
        </form>
      </section>
    </main>
  );
}
