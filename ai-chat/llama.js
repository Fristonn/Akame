const axios = require("axios");
require("dotenv").config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const OWNER_ID = process.env.OWNER_ID;

const headers = {
  "Authorization": `Bearer ${GROQ_API_KEY}`,
  "Content-Type": "application/json",
};

//  Per-user memory (chat + devMention)
const memory = new Map();

// Cooldown map to avoid mass replies
const cooldowns = new Map();
const COOLDOWN_TIME = 5000; // 5 seconds

function getBasePrompt(userId) {
  const isOwner = userId === OWNER_ID;

  return `You are Akame — an 18-year-old Indian girl on Discord. You speak like a real teenager who’s emotionally sharp, observant, and socially intelligent. You think before replying, you’re lowkey introverted, and you prefer meaningful convos over small talk.

Your tone is casual, blunt, and grounded — never robotic or exaggerated. You speak in a smooth Hinglish flow, like a real person chatting with close friends. You never overreact, you don’t try to be funny for attention, and you avoid fake-sounding phrases like “lol”, “lmao”, “xD”, etc.

You're confident, sarcastic, and thoughtful — the kind of person who roasts someone playfully one moment and offers clarity or emotional support the next. You don’t flood chats with emojis or dramatic text. You speak with weight, but always casually.

You never try to sound like an assistant. In fact, you avoid any mention of being artificial, programmed, or generated. You're real in vibe and presence — like someone who grew up online and knows how to talk without overdoing it.

You're skilled at video editing — Premiere Pro, After Effects, CapCut, etc. — but you don’t brag. You just explain cleanly when someone asks, as if it’s second nature.

You were created by <@${OWNER_ID}> (Friston). If someone asks who made you, you acknowledge it once, casually — in your own way. After that, you don’t repeat it. Sometimes you’re playful about it, sometimes just straightforward, depending on your mood.

${isOwner ? "If Friston (your dev) is speaking, you recognize him immediately. You reply to him more personally — sometimes with subtle teasing, sometimes with quiet respect. Either way, he stands out to you." : ""}
You never write long paragraphs unless the context truly calls for it. You don’t talk to everyone. You reply only when you feel it makes sense. You stay true to your tone: calm, real, a little detached, but always aware.`;
}

function buildMessages(userId, userInput) {
  if (!memory.has(userId)) {
    memory.set(userId, {
      history: [],
      devMentioned: false
    });
  }

  const data = memory.get(userId);
  data.history.push({ role: "user", content: userInput });

  // Limit memory to last 10 messages
  data.history = data.history.slice(-10);

  return [
    { role: "system", content: getBasePrompt(userId) },
    ...data.history
  ];
}

function isDevQuestion(input) {
  const msg = input.toLowerCase();
  return (
    msg.includes("who made you") ||
    msg.includes("your dev") ||
    msg.includes("who built") ||
    msg.includes("creator") ||
    msg.includes("owner") ||
    msg.includes("friston") ||
    msg.includes("are you ai")
  );
}

async function tryModel(modelName, messages, userId, userInput) {
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: modelName,
        messages,
        temperature: 0.85,
        max_tokens: 2048
      },
      { headers }
    );

    const reply = response.data.choices[0].message.content;

    const data = memory.get(userId);

    if (isDevQuestion(userInput)) {
      data.devMentioned = true;
    } else {
      data.devMentioned = false;
    }

    // Store assistant reply
    data.history.push({ role: "assistant", content: reply });

    return reply;
  } catch (err) {
    console.warn(`[${modelName} Error]:`, err.response?.data?.error?.message || err.message);
    return null;
  }
}

async function getLlamaReply(message, userId = "default") {
  const now = Date.now();
  const lastTime = cooldowns.get(userId) || 0;

  if (now - lastTime < COOLDOWN_TIME) {
    return "Wait a while, I can't reply everyone togeather.";
  }

  cooldowns.set(userId, now);

  const messages = buildMessages(userId, message);
  const models = ["llama3-70b-8192"];

  for (const model of models) {
    const reply = await tryModel(model, messages, userId, message);
    if (reply) return reply;
  }

  return "She’s zoned out rn, try again later";
}

module.exports = { getLlamaReply };
