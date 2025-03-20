import logging
import asyncio
import os
from aiogram import Bot, Dispatcher, types
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.filters import Command
from dotenv import load_dotenv

# Загружаем токен
load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN")

logging.basicConfig(level=logging.INFO)

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def start_command(message: Message):
    """Отправляет приветственное сообщение с кнопкой 'Играть'."""
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🚀 Играть в Flappy Doge", callback_data="play_game")]
        ]
    )
    await message.answer("Привет! Я Flappy Doge Bot! 🐶 Готов к полёту? Жми кнопку ниже!", reply_markup=keyboard)

@dp.callback_query(lambda c: c.data == "play_game")
async def play_game(callback_query: types.CallbackQuery):
    """Открывает игру по нажатию кнопки."""
    await bot.answer_callback_query(callback_query.id)
    await bot.send_game(callback_query.from_user.id, game_short_name="FlyingWoofbot")

@dp.message(Command("play"))
async def play_command(message: Message):
    """Позволяет запустить игру через команду /play."""
    await message.answer_game(game_short_name="FlyingWoofbot")

@dp.message(Command("help"))
async def help_command(message: Message):
    """Отправляет список доступных команд."""
    await message.answer("🚀 Доступные команды:\n/start - Запустить бота\n/play - Играть в Flappy Doge\n/help - Помощь")

async def main():
    """Основной цикл работы бота."""
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
