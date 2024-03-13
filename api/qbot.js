const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Load questions from JSON file
const questions = require('../questions.json');
let currentQuestionIndex = 0;
let correctAnswerCount = 0;

bot.start((ctx) => {
  showQuestion(ctx);
});

bot.command('refresh', (ctx) => {
  currentQuestionIndex = 0;
  correctAnswerCount = 0;
  showQuestion(ctx);
});

bot.action('next', (ctx) => {
  currentQuestionIndex++;
  if (currentQuestionIndex >= questions.length) {
    currentQuestionIndex = 0; // Start from the first question if reached the end
  }
  showQuestion(ctx);
});

bot.action('previous', (ctx) => {
  currentQuestionIndex--;
  if (currentQuestionIndex < 0) {
    currentQuestionIndex = questions.length - 1; // Go to the last question if reached the beginning
  }
  showQuestion(ctx);
});

bot.action('A', (ctx) => {
  checkAnswer(ctx, 'A');
});

bot.action('B', (ctx) => {
  checkAnswer(ctx, 'B');
});

bot.action('C', (ctx) => {
  checkAnswer(ctx, 'C');
});

bot.action('D', (ctx) => {
  checkAnswer(ctx, 'D');
});

function showQuestion(ctx) {
  const question = questions[currentQuestionIndex];
  const message = `Question ${questions.length}\n${question.question}\n\nA. ${question.A}\nB. ${question.B}\nC. ${question.C}\nD. ${question.D}\n\nQuestion ${currentQuestionIndex + 1} of ${questions.length}`;

  const buttons = Markup.inlineKeyboard([
    [Markup.button.callback('A', 'A'), Markup.button.callback('B', 'B')],
    [Markup.button.callback('C', 'C'), Markup.button.callback('D', 'D')],
    [Markup.button.callback('Previous', 'previous'), Markup.button.callback('Next', 'next')],
  ]);

  ctx.reply(message, buttons);

  // Remove previous questions from the history
  ctx.deleteMessage();

  // Mark current question as answered
  questions[currentQuestionIndex].answered = true;
}

function checkAnswer(ctx, selectedOption) {
  const question = questions[currentQuestionIndex];
  const isCorrect = selectedOption === question.answer;
  let resultMessage = '';

  if (isCorrect) {
    resultMessage = 'Correct!';
    correctAnswerCount++;
  } else {
    resultMessage = 'Incorrect!';
  }

  const message = `${question.question}\n\nA. ${question.A}\nB. ${question.B}\nC. ${question.C}\nD. ${question.D}\n\n${resultMessage}\n\nQuestion ${currentQuestionIndex + 1} of ${questions.length}\n\nCorrect Answers: ${correctAnswerCount}`;

  const buttons = Markup.inlineKeyboard([
    [Markup.button.callback('A', isCorrect ? '✅ A' : '❌ A'), Markup.button.callback('B', isCorrect ? '✅ B' : '❌ B')],
    [Markup.button.callback('C', isCorrect ? '✅ C' : '❌ C'), Markup.button.callback('D', isCorrect ? '✅ D' : '❌ D')],
    [Markup.button.callback('Previous', 'previous'), Markup.button.callback('Next', 'next')],
  ]);

  ctx.editMessageText(message, buttons);
}

bot.launch();
console.log('Bot is running...');