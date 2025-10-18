# main.py
# Discord bot for Spoooooooker
# - Handles message counting (local JSON persistence)
# - Awards 1 Halloween candy (emoji <:halloween_candy:1424808785985409125>) every 50 messages
# - /link <TOKEN> command: sends token to website to link account (calls /api/link/complete)
# - /give command (owner only) to give candy via website dev endpoint
# Requires: DISCORD_BOT_TOKEN, BOT_OWNER_ID, WEBSITE_URL, WEBSITE_SYNC_TOKEN
# Run on Railway (or any server). Persisting message counts in local file 'message_counts.json'.

import os
import json
import asyncio
import aiohttp
from datetime import datetime
from dotenv import load_dotenv

import discord
from discord.ext import commands

load_dotenv()

DISCORD_BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN")
BOT_OWNER_ID = int(os.getenv("BOT_OWNER_ID")) if os.getenv("BOT_OWNER_ID") else None
WEBSITE_URL = os.getenv("WEBSITE_URL") or os.getenv("NEXT_PUBLIC_WEBSITE_URL") or "http://localhost:3000"
WEBSITE_SYNC_TOKEN = os.getenv("WEBSITE_SYNC_TOKEN") or os.getenv("SITE_SYNC_TOKEN") or None

if not DISCORD_BOT_TOKEN:
    print("Missing DISCORD_BOT_TOKEN")
    exit(1)

intents = discord.Intents.default()
intents.messages = True
intents.guilds = True
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents)
EMOJI = "<:halloween_candy:1424808785985409125>"

DATA_FILE = "message_counts.json"
LOCK = asyncio.Lock()


def load_counts():
    try:
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return {}


def save_counts(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f)


async def give_candy_via_website(discord_id: int, amount: int, reason: str = ""):
    if not WEBSITE_URL:
        return False, "No WEBSITE_URL configured"
    url = WEBSITE_URL.rstrip("/") + "/api/dev/give_points"
    headers = {
        "Content-Type": "application/json",
    }
    if WEBSITE_SYNC_TOKEN:
        headers["x-website-sync-token"] = WEBSITE_SYNC_TOKEN
    payload = {"discord_id": str(discord_id), "amount": int(amount)}
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=headers, timeout=15) as resp:
                j = await resp.json()
                return resp.status == 200 or resp.status == 201, j
    except Exception as e:
        return False, {"error": str(e)}


@bot.event
async def on_ready():
    print(f"Bot ready. Logged in as {bot.user} ({bot.user.id})")
    # ensure local counts file exists
    data = load_counts()
    save_counts(data)
    # register slash commands (application commands)
    try:
        # create tree commands
        tree = bot.tree

        @tree.command(name="info", description="Show bot & site info and how to use it")
        async def info(interaction: discord.Interaction):
            embed = discord.Embed(
                title="SPOOOOOOKER — Info & Games",
                description="Play spooky games and earn Halloween Candy. Link your Discord account to the website to manage candy and play online.",
                color=discord.Color.from_rgb(160, 64, 255),
                timestamp=datetime.utcnow()
            )
            embed.add_field(name="How to link", value="Use `/link <TOKEN>` to link your website account (get token via website).", inline=False)
            embed.add_field(name="Earning candy", value="Send messages — every 50 messages you earn 1 Halloween Candy. Use it in Shop / Packs / Games.", inline=False)
            embed.add_field(name="Support", value="Contact the developer if anything breaks.", inline=False)
            await interaction.response.send_message(embed=embed, ephemeral=True)

        @tree.command(name="mystatus", description="Show your candy & message count (private)")
        async def mystatus(interaction: discord.Interaction):
            discord_id = interaction.user.id
            # read local counts
            counts = load_counts()
            rec = counts.get(str(discord_id), {"messages": 0, "awarded": 0})
            # attempt to query website user for authoritative candy
            candy_str = "N/A"
            try:
                async with aiohttp.ClientSession() as session:
                    # website user retrieval by discord not provided, so we show local awarded plus note
                    pass
            except:
                pass
            embed = discord.Embed(title=f"Status for {interaction.user.display_name}", color=discord.Color.from_rgb(160, 64, 255), timestamp=datetime.utcnow())
            embed.add_field(name="Halloween Candy (local)", value=str(rec.get("candy_snapshot", "unknown")), inline=True)
            embed.add_field(name="Messages tracked (local)", value=str(rec.get("messages", 0)), inline=True)
            await interaction.response.send_message(embed=embed, ephemeral=True)

        @tree.command(name="link", description="Link your website account with a token (use token from website)")
        @discord.app_commands.describe(token="Token generated on the website (Settings -> Link)")
        async def link(interaction: discord.Interaction, token: str):
            await interaction.response.defer(ephemeral=True)
            discord_id = str(interaction.user.id)
            url = WEBSITE_URL.rstrip("/") + "/api/link/complete"
            headers = {"Content-Type": "application/json"}
            if WEBSITE_SYNC_TOKEN:
                headers["x-website-sync-token"] = WEBSITE_SYNC_TOKEN
            payload = {"token": token, "discord_id": discord_id}
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.post(url, json=payload, headers=headers, timeout=10) as resp:
                        data = await resp.json()
                        if resp.status == 200:
                            await interaction.followup.send(f"✅ Link successful! Website user linked to your Discord. Candy: {data.get('user', {}).get('candy', 'N/A')}", ephemeral=True)
                        else:
                            await interaction.followup.send(f"⚠️ Link failed: {data.get('error', 'Unknown')}", ephemeral=True)
            except Exception as e:
                await interaction.followup.send(f"❌ Error contacting website: {e}", ephemeral=True)

        @tree.command(name="give", description="Owner: give candy to a Discord user (owner only)")
        @discord.app_commands.describe(target="Discord user or ID", amount="Amount of candy to give")
        async def give(interaction: discord.Interaction, target: str, amount: int):
            if BOT_OWNER_ID is None or interaction.user.id != BOT_OWNER_ID:
                await interaction.response.send_message("You are not allowed to use this command.", ephemeral=True)
                return
            await interaction.response.defer(ephemeral=True)
            discord_id = target
            if discord_id.startswith("<@") and discord_id.endswith(">"):
                discord_id = discord_id.strip("<@!>")
            ok, resp = await give_candy_via_website(discord_id, amount, reason=f"owner:{interaction.user.id}")
            if ok:
                await interaction.followup.send(f"✅ Given {amount} candy to {discord_id}.", ephemeral=True)
            else:
                await interaction.followup.send(f"⚠️ Failed: {resp}", ephemeral=True)

        await bot.tree.sync()
        print("Slash commands synced.")
    except Exception as e:
        print("Failed to register slash commands:", e)


@bot.event
async def on_message(message: discord.Message):
    if message.author.bot:
        return
    author_id = str(message.author.id)
    async with LOCK:
        data = load_counts()
        rec = data.get(author_id, {"messages": 0, "awarded": 0, "candy_snapshot": None})
        rec["messages"] = rec.get("messages", 0) + 1
        # award every 50 messages
        if rec["messages"] % 50 == 0:
            # award 1 candy via website
            ok, resp = await give_candy_via_website(author_id, 1, reason="messages-50")
            if ok:
                rec["awarded"] = rec.get("awarded", 0) + 1
                # update candy snapshot if website returned value
                try:
                    if isinstance(resp, dict) and resp.get("user"):
                        rec["candy_snapshot"] = resp["user"].get("candy")
                except:
                    pass
                try:
                    await message.channel.send(f"🎉 {EMOJI} Congrats {message.author.mention}, you've reached {rec['messages']} messages and were awarded **1 Halloween Candy**!")
                except:
                    pass
            else:
                try:
                    await message.channel.send(f"⚠️ Could not award candy right now (website error).")
                except:
                    pass
        data[author_id] = rec
        save_counts(data)

    await bot.process_commands(message)


if __name__ == "__main__":
    bot.run(DISCORD_BOT_TOKEN)
