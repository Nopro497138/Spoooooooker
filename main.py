# main.py
import os
import asyncio
import aiosqlite
import discord
from discord import app_commands
from discord.ext import commands
from datetime import datetime
from dotenv import load_dotenv
import json
import urllib.request

load_dotenv()

DISCORD_BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN")
DISCORD_CLIENT_ID = os.getenv("DISCORD_CLIENT_ID")
WEBSITE_URL = os.getenv("NEXT_PUBLIC_WEBSITE_URL") or os.getenv("WEBSITE_URL") or "https://your-site.vercel.app"
BOT_OWNER_ID = int(os.getenv("BOT_OWNER_ID")) if os.getenv("BOT_OWNER_ID") else None

# SYNC: Where to POST updates and which token to use
WEBSITE_SYNC_URL = os.getenv("WEBSITE_SYNC_URL")  # e.g. https://<deploy>/api/sync
WEBSITE_SYNC_TOKEN = os.getenv("WEBSITE_SYNC_TOKEN")

intents = discord.Intents.default()
intents.message_content = True
intents.guilds = True
intents.messages = True

bot = commands.Bot(command_prefix="!", intents=intents)
tree = bot.tree
db: aiosqlite.Connection | None = None

EMBED_COLOR = discord.Color.from_rgb(255, 95, 95)

CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS users (
  discord_id INTEGER PRIMARY KEY,
  candy INTEGER NOT NULL DEFAULT 0,
  messages INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
"""

async def http_post(url, data, headers=None):
    """Simple async POST using urllib in a thread to avoid extra dependencies."""
    def _do():
        req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers or {}, method='POST')
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.read().decode('utf-8')
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, _do)

async def sync_to_website(discord_id, candy):
    if not WEBSITE_SYNC_URL or not WEBSITE_SYNC_TOKEN:
        return
    try:
        headers = { 'Content-Type': 'application/json', 'x-sync-token': WEBSITE_SYNC_TOKEN }
        data = { 'discord_id': str(discord_id), 'candy': int(candy) }
        await http_post(WEBSITE_SYNC_URL, data, headers)
    except Exception as e:
        print("Warning: sync failed", e)

async def ensure_user(conn, discord_id: int):
    await conn.execute("INSERT OR IGNORE INTO users (discord_id, candy, messages) VALUES (?, ?, ?)", (discord_id, 50, 0))
    await conn.commit()
    # push initial candy to website
    cur = await conn.execute("SELECT candy FROM users WHERE discord_id = ?", (discord_id,))
    rec = await cur.fetchone()
    if rec:
        await sync_to_website(discord_id, int(rec["candy"]))

@bot.event
async def on_ready():
    global db
    print(f"Bot ready. Logged in as {bot.user} ({bot.user.id})")
    db = await aiosqlite.connect("data.db")
    db.row_factory = aiosqlite.Row
    await db.execute(CREATE_TABLE)
    await db.commit()
    await tree.sync()
    print("Ready and DB initialized.")

@bot.event
async def on_message(message: discord.Message):
    if message.author.bot: return
    if not db: return

    await ensure_user(db, message.author.id)
    cur = await db.execute("SELECT messages, candy FROM users WHERE discord_id = ?", (message.author.id,))
    rec = await cur.fetchone()
    if not rec:
        await ensure_user(db, message.author.id)
        cur = await db.execute("SELECT messages, candy FROM users WHERE discord_id = ?", (message.author.id,))
        rec = await cur.fetchone()

    messages = int(rec["messages"] or 0) + 1
    candy = int(rec["candy"] or 0)
    await db.execute("UPDATE users SET messages = ? WHERE discord_id = ?", (messages, message.author.id))
    await db.commit()

    if messages % 50 == 0:
        candy += 1
        await db.execute("UPDATE users SET candy = ? WHERE discord_id = ?", (candy, message.author.id))
        await db.commit()
        # sync to website
        await sync_to_website(message.author.id, candy)
        halloween_emoji = "<:halloween_candy:1424808785985409125>"
        embed = discord.Embed(title=f"{halloween_emoji} Halloween Candy Awarded!", description=f"Congrats {message.author.mention}, you reached **{messages} messages** and earned **1 Halloween Candy**!", color=EMBED_COLOR, timestamp=datetime.utcnow())
        embed.add_field(name="Total Halloween Candy", value=str(candy))
        await message.channel.send(embed=embed)

    await bot.process_commands(message)

@tree.command(name="mystatus", description="Show your Halloween Candy & message count")
async def mystatus(interaction: discord.Interaction):
    if not db:
        await interaction.response.send_message("Database not ready.", ephemeral=True)
        return
    await ensure_user(db, interaction.user.id)
    cur = await db.execute("SELECT candy, messages FROM users WHERE discord_id = ?", (interaction.user.id,))
    rec = await cur.fetchone()
    candy = int(rec["candy"]) if rec and rec["candy"] is not None else 0
    messages = int(rec["messages"]) if rec and rec["messages"] is not None else 0
    embed = discord.Embed(title=f"Status for {interaction.user.display_name}", color=EMBED_COLOR, timestamp=datetime.utcnow())
    embed.add_field(name="Halloween Candy", value=str(candy), inline=True)
    embed.add_field(name="Messages tracked", value=str(messages), inline=True)
    await interaction.response.send_message(embed=embed, ephemeral=True)

if __name__ == "__main__":
    if not DISCORD_BOT_TOKEN:
        print("Missing DISCORD_BOT_TOKEN")
        exit(1)
    bot.run(DISCORD_BOT_TOKEN)
