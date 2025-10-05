# bot.py
import os
import asyncio
import aiosqlite
import discord
from discord import app_commands
from discord.ext import commands
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# DATABASE_URL removed — using local SQLite file 'data.db'
DISCORD_BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN")
DISCORD_CLIENT_ID = os.getenv("DISCORD_CLIENT_ID")
WEBSITE_URL = os.getenv("NEXT_PUBLIC_WEBSITE_URL") or os.getenv("WEBSITE_URL") or "https://spoooooooker.vercel.app/"
BOT_OWNER_ID = int(os.getenv("BOT_OWNER_ID")) if os.getenv("BOT_OWNER_ID") else None

intents = discord.Intents.default()
intents.message_content = True
intents.guilds = True
intents.messages = True

bot = commands.Bot(command_prefix="!", intents=intents)
tree = bot.tree
db: aiosqlite.Connection | None = None

EMBED_COLOR = discord.Color.from_rgb(255, 95, 95)  # Halloween-ish coral

CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS users (
  discord_id INTEGER PRIMARY KEY,
  points INTEGER NOT NULL DEFAULT 0,
  messages INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
"""

async def ensure_user(conn: aiosqlite.Connection, discord_id: int):
    await conn.execute("""
        INSERT OR IGNORE INTO users (discord_id, points, messages)
        VALUES (?, 0, 0);
    """, (discord_id,))
    await conn.commit()

@bot.event
async def on_ready():
    global db
    print(f"Bot ready. Logged in as {bot.user} ({bot.user.id})")

    # open local sqlite db
    db = await aiosqlite.connect("data.db")
    db.row_factory = aiosqlite.Row
    await db.execute(CREATE_TABLE)
    await db.commit()

    # sync guild commands if you want global remove .sync()
    await tree.sync()
    print("Slash commands synced. Local SQLite DB ready.")

@bot.event
async def on_message(message: discord.Message):
    if message.author.bot:
        return
    if not db:
        return

    await ensure_user(db, message.author.id)
    # increment messages
    cur = await db.execute("SELECT messages, points FROM users WHERE discord_id = ?", (message.author.id,))
    rec = await cur.fetchone()
    if rec is None:
        # fallback ensure and fetch again
        await ensure_user(db, message.author.id)
        cur = await db.execute("SELECT messages, points FROM users WHERE discord_id = ?", (message.author.id,))
        rec = await cur.fetchone()

    messages = int(rec["messages"]) + 1
    points = int(rec["points"])
    await db.execute("UPDATE users SET messages = ? WHERE discord_id = ?", (messages, message.author.id))
    await db.commit()

    # award 1 Halloween point every 50 messages
    if messages % 50 == 0:
        points += 1
        await db.execute("UPDATE users SET points = ? WHERE discord_id = ?", (points, message.author.id))
        await db.commit()
        embed = discord.Embed(
            title="🎃 Halloween Point Awarded!",
            description=f"Congrats {message.author.mention}, you reached **{messages} messages** and earned **1 Halloween Point**!",
            color=EMBED_COLOR,
            timestamp=datetime.utcnow()
        )
        embed.add_field(name="Total Points", value=str(points))
        embed.set_footer(text="Keep chatting to earn more!")
        await message.channel.send(embed=embed)

    # allow other commands to process
    await bot.process_commands(message)

@tree.command(name="info", description="Show bot & site info and how to use it")
async def info(interaction: discord.Interaction):
    embed = discord.Embed(
        title="👻 Halloween-Planko — Info",
        description="Welcome! This bot tracks your messages and awards Halloween Points. Use them on the website to play Planko.",
        color=EMBED_COLOR,
        timestamp=datetime.utcnow()
    )
    embed.add_field(name="Website", value=f"[Open Halloween Galaxy]({WEBSITE_URL})", inline=False)
    embed.add_field(name="How to earn points", value="Send messages in any server where the bot has access. Every 50 messages = 1 Halloween Point.", inline=False)
    embed.add_field(name="How to use points", value="Log into the website using Discord OAuth, your Discord account will be linked and your points synced. Play Planko by placing bets with points.", inline=False)
    embed.set_footer(text="Bot by your team — All bot messages use embeds for a professional look.")
    await interaction.response.send_message(embed=embed)

# Admin helper: show user status
@tree.command(name="mystatus", description="Show your point & message count (private)")
async def mystatus(interaction: discord.Interaction):
    if not db:
        await interaction.response.send_message("Database not ready.", ephemeral=True)
        return

    await ensure_user(db, interaction.user.id)
    cur = await db.execute("SELECT points, messages FROM users WHERE discord_id = ?", (interaction.user.id,))
    rec = await cur.fetchone()
    points = int(rec["points"]) if rec and rec["points"] is not None else 0
    messages = int(rec["messages"]) if rec and rec["messages"] is not None else 0

    embed = discord.Embed(
        title=f"Status for {interaction.user.display_name}",
        color=EMBED_COLOR,
        timestamp=datetime.utcnow()
    )
    embed.add_field(name="Halloween Points", value=str(points), inline=True)
    embed.add_field(name="Messages tracked", value=str(messages), inline=True)
    await interaction.response.send_message(embed=embed, ephemeral=True)

if __name__ == "__main__":
    if not DISCORD_BOT_TOKEN:
        print("Missing DISCORD_BOT_TOKEN in environment.")
        exit(1)
    bot.run(DISCORD_BOT_TOKEN)
