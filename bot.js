const mineflayer = require('mineflayer');
const generateUsername = require('random-username-generator');

const serverIP = 'blenny.aternos.host';
const serverPort = 41445;
const version = '1.21.7';

// إعدادات البوت
const settings = {
  jumpInterval: 15000, // القفز كل 15 ثانية
  chatInterval: 30000, // الكتابة في الشات كل 30 ثانية
  reconnectDelay: 5000, // إعادة الاتصال بعد 5 ثواني
  chatMessages: [
    "مرحباً!",
    "ما الجديد؟",
    "الطقس جميل اليوم",
    "أنا هنا لأجنب AFK",
    "كيف الحال؟"
  ]
};

function createBot() {
  const username = generateUsername.generate();
  
  const bot = mineflayer.createBot({
    host: serverIP,
    port: serverPort,
    username: username,
    version: version,
    auth: 'offline'
  });

  // إدارة إعادة الاتصال يدوياً
  bot.on('end', () => {
    console.log(`[${username}] انقطع الاتصال. إعادة المحاولة بعد ${settings.reconnectDelay/1000} ثواني...`);
    setTimeout(createBot, settings.reconnectDelay);
  });

  // تغيير الاسم عند الطرد
  bot.on('kicked', (reason) => {
    console.log(`[${username}] طرد من السيرفر! السبب: ${reason}`);
    bot.end(); // سيؤدي هذا إلى تشغيل حدث 'end' لإعادة الاتصال
  });

  // القفز لتجنب AFK
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
}

// بدء تشغيل البوت
createBot();
