**Akame Bot** is a versatile and feature-rich Discord bot built with JavaScript. Designed to enhance your server with moderation, fun commands, and more — all in one package.

## Features

- 🎯 **Hybrid Command System** — Supports both Slash and traditional Prefix commands
- 🔨 **Robust Moderation Tools** — Ban, Kick, Timeout, Purge, Role Manager, and more
- 🧠 **AI-Powered Conversations** — Natural replies using custom AI system based on llama
- 📊 **Insightful Info Commands** — Server stats, user data, role analysis, dev/owner info
- 🧰 **Utility Suite** — AFK system, slowmode, avatar fetcher, emoji/sticker steal, ping, eval
- 🎨 **Embed & Announcement Builder** — Beautiful custom embeds on the fly
- 💬 **Action & Reaction System** — Hug, kiss, slap and other expressive commands
- 📁 **Clean Code Structure** — Fully modular and beginner-friendly

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- A Discord bot token (from [Discord Developer Portal](https://discord.com/developers/applications))
- MongoDB URI (optional, if your bot uses a database)
- API keys for third-party services (YouTube, Remove BG, Groq, etc.)

### Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/Fristonn/Akame.git
   cd Akame
## Install dependencies:
npm install
Create a .env file in the root directory with the following variables:

DISCORD_TOKEN=your-discord-bot-token
MongoDb=your-mongodb-uri
OWNER_ID=your-discord-user-id
CLIENT_ID=your-bot-client-id
YOUTUBE_API_KEY=your-youtube-api-key
REMOVE_BG_API_KEY=your-removebg-api-key
GROQ_API_KEY=your-groq-api-key

## Start the bot:

**You can easily start the bot by _node index.js in terminal_**
## Usage
Invite the bot to your server using the OAuth2 URL with required permissions. Use the prefix ! (or your configured prefix) followed by commands.

## Example commands:

!help – Display the help menu

!ban @user – Ban a user from the server

## License
This project is licensed under the MIT License. See the [LICENSE](https://github.com/Fristonn/Akame?tab=MIT-1-ov-file) file for details.

## Contact
Created by Friston!
For support or questions, open an issue or contact me directly on discord (friston_ae)
