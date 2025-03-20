import logging
import asyncio
import os
from aiogram import Bot, Dispatcher, types
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from aiogram.filters import Command
from dotenv import load_dotenv

load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN")

logging.basicConfig(level=logging.INFO)

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

GAME_URL = "https://zhdanov1990.github.io/FlyingWoofbot/"

@dp.message(Command("start"))
async def start_command(message: Message):
    """Отправляет приветственное сообщение с кнопкой 'Играть'."""
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🚀 Играть в Flappy Doge", web_app=WebAppInfo(url=GAME_URL))]
        ]
    )
    await message.answer("Привет! Я Flappy Doge Bot! 🐶 Готов к полёту? Жми кнопку ниже!", reply_markup=keyboard)

@dp.message(Command("help"))
async def help_command(message: Message):
    """Отправляет список доступных команд."""
    await message.answer("🚀 Доступные команды:\n/start - Запустить бота\n/help - Помощь")

async def main():
    """Основной цикл работы бота."""
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
