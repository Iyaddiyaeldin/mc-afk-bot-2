const mineflayer = require('mineflayer');
const autoReconnect = require('mineflayer-auto-reconnect');
const generateUsername = require('random-username-generator');

const serverIP = 'blenny.aternos.host'; // لا تغيير هنا
const serverPort = 41445; // لا تغيير هنا
const version = '1.21.7'; // إصدار ماين كرافت

// إعدادات البوت
const settings = {
  jumpInterval: 15000, // القفز كل 15 ثانية
  chatInterval: 30000, // الكتابة في الشات كل 30 ثانية
  chatMessages: [ // رسائل عشوائية
    "مرحباً!",
    "ما الجديد؟",
    "الطقس جميل اليوم",
    "أنا هنا لأجنب AFK",
    "كيف الحال؟"
  ]
};

function createBot() {
  const username = generateUsername.generate(); // توليد اسم عشوائي
  
  const bot = mineflayer.createBot({
    host: serverIP,
    port: serverPort,
    username: username,
    version: version,
    auth: 'offline'
  });

  autoReconnect(bot, { // إعادة الاتصال تلقائياً
    delay: 5000, // 5 ثواني بين المحاولات
    maxRetries: Infinity // عدد لا نهائي من المحاولات
  });

  // تغيير الاسم عند الطرد
  bot.on('kicked', (reason) => {
    console.log(`[${username}] طرد من السيرفر! السبب: ${reason}`);
    setTimeout(createBot, 5000); // إنشاء بوت جديد بعد 5 ثواني
  });

  // القفز كل فترة لتجنب AFK
  bot.on('spawn', () => {
    setInterval(() => {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 500);
    }, settings.jumpInterval);
  });

  // الكتابة في الشات
  bot.on('spawn', () => {
    setInterval(() => {
      const randomMsg = settings.chatMessages[Math.floor(Math.random() * settings.chatMessages.length)];
      bot.chat(randomMsg);
    }, settings.chatInterval);
  });

  // إدارة الأخطاء
  bot.on('error', (err) => console.log(`[${username}] خطأ: ${err}`));
  bot.on('end', () => console.log(`[${username}] انقطع الاتصال`));
}

// بدء تشغيل البوت
createBot();
