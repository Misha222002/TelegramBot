const Telegram = require("node-telegram-bot-api");
const { gameOptions, againOptions } = require("./options");
const token = "6932230561:AAHCkEj-qunV4bDoNlPVuq2CH2NKi5Flb1A";
const sequelize = require("./db");
const UserModel = require("./model");
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

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
  } catch (e) {
    console.log(e);
  }
  bot.setMyCommands([
    { command: "/start", description: "Начальное приветствие" },
    { command: "/info", description: "Получить информацию о пользователе" },
    { command: "/game", description: "Игра угадай цифру" },
  ]);

  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    try {
      if (text === "/start") {
        await UserModel.create({ chatId });
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
        const user = await UserModel.findOne({ chatId });
        return bot.sendMessage(
          chatId,
          `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}, в игру у тебя правильных ответов ${user.right} и неправильных - ${user.wrong}`
        );
      }
      if (text == "/game") {
        startGame(chatId);
      }
      return bot.sendMessage(chatId, "Я тебя не понимаю, попробуй еще раз");
    } catch (e) {
      console.log(e);
      return bot.sendMessage(chatId, "Произошла какая то ошибка");
    }
  });
};

bot.on("callback_query", async (msg) => {
  const data = msg.data;
  const chatId = msg.message.chat.id;

  if (data === "/again") {
    return startGame(chatId);
  }
  const user = await UserModel.findOne({ chatId });
  if (data == chats[chatId]) {
    user.right++;
    await bot.sendMessage(
      chatId,
      `Поздравляю ты отгадал цифру ${data}`,
      againOptions
    );
  } else {
    user.wrong++;
    await bot.sendMessage(
      chatId,
      `К созалению ты не угадал, бот загадал цифру - ${chats[chatId]}`,
      againOptions
    );
  }
  await user.save();
});

start();
