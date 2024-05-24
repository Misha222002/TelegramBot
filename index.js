const Telegram = require("node-telegram-bot-api");
const { gameOptions, againOptions } = require("./options");
const token = "6932230561:AAHCkEj-qunV4bDoNlPVuq2CH2NKi5Flb1A";

const bot = new Telegram(token, { polling: true });

const chats = {};

const startGame = async (chatId) => {
  await bot.sendMessage(
    chatId,
    `Сейчас я загадаю цифру от 0 до 9, а ты должен ее угадать!`
  );
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, "Отгадывай", gameOptions);
};

const start = () => {
  bot.setMyCommands([
    { command: "/start", description: "Начальное приветствие" },
    { command: "/info", description: "Получить информацию о пользователе" },
    { command: "/game", description: "Игра угадай цифру" },
  ]);

  bot.on("message", async (msg) => {
    console.log(msg);
    const text = msg.text;
    const chatId = msg.chat.id;
    if (text === "/start") {
      await bot.sendSticker(
        chatId,
        "https://cdn.tlgrm.ru/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/96/7.webp"
      );
      return bot.sendMessage(
        chatId,
        `Добро пожаловать в телеграм бот Миши Иванова`
      );
    }
    if (text === "/info") {
      return bot.sendMessage(
        chatId,
        `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}`
      );
    }
    if (text == "/game") {
      startGame(chatId);
    }
    return bot.sendMessage(chatId, "Я тебя не понимаю, попробуй еще раз");
  });
};

bot.on("callback_query", async (msg) => {
  const data = msg.data;
  const chatId = msg.message.chat.id;
  if (data === "/again") {
    return startGame(chatId);
  }
  if (data == chats[chatId]) {
    return await bot.sendMessage(
      chatId,
      `Поздравляю ты отгадал цифру ${data}`,
      againOptions
    );
  } else {
    return await bot.sendMessage(
      chatId,
      `К созалению ты не угадал, бот загадал цифру - ${chats[chatId]}`,
      againOptions
    );
  }
});

start();
