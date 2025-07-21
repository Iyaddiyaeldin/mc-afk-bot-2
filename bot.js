const mineflayer = require('mineflayer');
const generateUsername = require('random-username-generator');

const serverIP = 'MCZonee.aternos.me';
const serverPort = 41445;
const version = '1.21.7';

// إعدادات البوت
const settings = {
  jumpInterval: 15000,
  chatInterval: 30000,
  reconnectDelay: 10000, // زيادة وقت إعادة المحاولة
  maxReconnectAttempts: Infinity, // محاولات لا نهائية
  chatMessages: [
    "مرحباً الجميع!",
    "ما الجديد في السيرفر؟",
    "أنا هنا لأجنب AFK",
    "اللعبة ممتعة اليوم",
    "كيف حالكم؟"
  ]
};

let reconnectAttempts = 0;

function createBot() {
  try {
    const username = generateUsername.generate();
    console.log(`[${new Date().toLocaleString()}] محاولة الاتصال باسم: ${username}`);
    
    const bot = mineflayer.createBot({
      host: serverIP,
      port: serverPort,
      username: username,
      version: version,
      auth: 'offline'
    });

    // إدارة إعادة الاتصال
    bot.on('end', (reason) => {
      reconnectAttempts++;
      console.log(`[${new Date().toLocaleString()}] [${username}] انقطع الاتصال (المحاولة ${reconnectAttempts}). السبب: ${reason}`);
      console.log(`إعادة المحاولة بعد ${settings.reconnectDelay/30000} ثواني...`);
      setTimeout(createBot, settings.reconnectDelay);
    });

    // تغيير الاسم عند الطرد
    bot.on('kicked', (reason) => {
      console.log(`[${new Date().toLocaleString()}] [${username}] طرد من السيرفر! السبب: ${reason}`);
      bot.end();
    });

    // عند الاتصال الناجح
    bot.on('spawn', () => {
      reconnectAttempts = 0; // إعادة تعيين العدادات
      console.log(`[${new Date().toLocaleString()}] [${username}] دخل السيرفر بنجاح!`);
      
      // القفز لتجنب AFK
      const jumpInterval = setInterval(() => {
        if(bot.entity) {
          bot.setControlState('jump', true);
          setTimeout(() => bot.setControlState('jump', false), 500);
        }
      }, settings.jumpInterval);

      // الكتابة في الشات
      const chatInterval = setInterval(() => {
        if(bot.entity) {
          const randomMsg = settings.chatMessages[Math.floor(Math.random() * settings.chatMessages.length)];
          bot.chat(randomMsg);
        }
      }, settings.chatInterval);

      // تنظيف المؤقتات عند الخروج
      bot.on('end', () => {
        clearInterval(jumpInterval);
        clearInterval(chatInterval);
      });
    });

    // إدارة الأخطاء
    bot.on('error', (err) => {
      console.log(`[${new Date().toLocaleString()}] [${username}] خطأ: ${err}`);
    });
    
  } catch (err) {
    console.error(`[${new Date().toLocaleString()}] خطأ جسيم: ${err}`);
    console.log(`إعادة المحاولة بعد ${settings.reconnectDelay/1000} ثواني...`);
    setTimeout(createBot, settings.reconnectDelay);
  }
}

// بدء تشغيل البوت
createBot();
