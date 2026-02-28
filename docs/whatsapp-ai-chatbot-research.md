# WhatsApp AI Chatbot for Personal Use — Research

## Goal
A free WhatsApp AI chatbot that family members can interact with by messaging a personal WhatsApp number. The AI (Claude/GPT) responds automatically.

## How It Works
```
Parent sends WhatsApp message
  -> Your WhatsApp number (linked via QR code)
  -> WAHA / Evolution API (self-hosted Docker container)
  -> Webhook forwards message to your script
  -> Script calls Claude/GPT API
  -> AI response sent back via WAHA
  -> Parent receives reply on WhatsApp
```

Parents don't need to install anything new — they just text your number.

---

## Free Options Compared

| Option | Cost | Server Needed? | Difficulty | Personal Account? |
|--------|------|---------------|------------|-------------------|
| **WAHA** | Free, no limits | Yes (Docker) | Medium | Yes |
| **Evolution API** | Free, open-source | Yes (Docker) | Medium | Yes |
| **Baileys** (library) | Free | Yes (Node.js) | Higher | Yes |
| **GREEN-API** | Free tier (limited) | No (cloud) | Easy | Yes |
| **Botpress** | 2K msgs/month free | No (cloud) | Easy | No (needs business) |

---

## Option 1: WAHA (WhatsApp HTTP API) — Recommended

- **Cost:** Free (Core version), no message limits, no time limits
- **How:** Self-hosted Docker container that connects to personal WhatsApp via QR code
- **AI Integration:** Webhooks -> your script -> Claude/GPT API
- **GitHub:** https://github.com/devlikeapro/waha (6,000+ stars)
- **Docs:** https://waha.devlike.pro/

### Quick Start
```bash
docker run -it -p 3000:3000/tcp devlikeapro/waha
```
Then open `http://localhost:3000/dashboard` to scan QR code.

### Hosting Options (Free)
- Oracle Cloud Free Tier (always-free ARM VM)
- Old laptop / Raspberry Pi at home
- Railway.app free tier

---

## Option 2: Evolution API

- **Cost:** Free, open-source
- **How:** Built on Baileys, self-hosted via Docker
- **AI Integration:** Built-in support for OpenAI, Dify; supports audio-to-text
- **GitHub:** https://github.com/EvolutionAPI/evolution-api
- **Docs:** https://doc.evolution-api.com/

---

## Option 3: Baileys (Direct Library)

- **Cost:** Free, open-source TypeScript/Node.js library
- **How:** Direct WebSocket to WhatsApp servers (same protocol as WhatsApp Web)
- **GitHub:** https://github.com/WhiskeySockets/Baileys
- **Docs:** https://baileys.wiki/

Best for maximum control but requires more custom code.

---

## Option 4: GREEN-API

- **Cost:** Free tier available (limited messages), paid from ~$12/month
- **How:** Cloud-hosted — no server needed. Sign up, scan QR, use API
- **Website:** https://green-api.com/en

Easiest setup but free tier has restrictions.

---

## Important Notes

- All personal-account options use unofficial WhatsApp Web protocols
- This technically violates WhatsApp ToS but is widely used for personal projects
- Risk of ban is very low for small-scale personal/family use
- Do NOT use for spam or bulk messaging
- For business-critical use, consider the official WhatsApp Business Cloud API (not free)

---

## Implementation Sketch (WAHA + Claude)

### docker-compose.yml
```yaml
version: '3'
services:
  waha:
    image: devlikeapro/waha
    ports:
      - "3000:3000"
    environment:
      - WHATSAPP_HOOK_URL=http://bot:8080/webhook
      - WHATSAPP_HOOK_EVENTS=message
    restart: unless-stopped

  bot:
    build: ./bot
    ports:
      - "8080:8080"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - WAHA_URL=http://waha:3000
    restart: unless-stopped
```

### Minimal webhook handler (Node.js)
```typescript
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
app.use(express.json());

const anthropic = new Anthropic();
const WAHA_URL = process.env.WAHA_URL || 'http://localhost:3000';

app.post('/webhook', async (req, res) => {
  const { body: { from, text } } = req.body?.payload || {};
  if (!from || !text) return res.sendStatus(200);

  // Call Claude API
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: text }],
  });

  const reply = response.content[0]?.type === 'text'
    ? response.content[0].text
    : 'Sorry, I could not process that.';

  // Send reply via WAHA
  await fetch(`${WAHA_URL}/api/sendText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session: 'default',
      chatId: from,
      text: reply,
    }),
  });

  res.sendStatus(200);
});

app.listen(8080, () => console.log('Bot listening on :8080'));
```

---

## References
- https://waha.devlike.pro/
- https://github.com/devlikeapro/waha
- https://github.com/EvolutionAPI/evolution-api
- https://github.com/WhiskeySockets/Baileys
- https://baileys.wiki/docs/intro/
- https://green-api.com/en
- https://www.freecodecamp.org/news/how-to-build-and-deploy-a-production-ready-whatsapp-bot/
