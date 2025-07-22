const mineflayer = require('mineflayer');
const generateUsername = require('random-username-generator');
const express = require('express');

// 1. إعداد خادم ويب بدون متغيرات بيئة
const app = express();
const PORT = process.env.PORT || 3000; // يستخدم PORT إذا وجد أو 3000 افتراضياً

app.get('/', (req, res) => {
  res.send('Minecraft AFK Bot is running!');
});

// إضافة نقطة نهاية للحفاظ على التطبيق نشطاً
app.get('/keepalive', (req, res) => {
  res.send('Bot is alive!');
});

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});

// 2. إعداد بوت ماينكرافت
const serverIP = 'MCZonee.aternos.me';
const serverPort = 41445;
const version = '1.21.7';

const settings = {
  jumpInterval: 15000,
  chatInterval: 30000,
  reconnectDelay: 30000, // زيادة وقت إعادة المحاولة
  chatMessages: [
    "مرحباً! أنا هنا لأجنب AFK",
    "السيرفر ممتاز اليوم",
    "ما الجديد؟",
    "أتمنى أن تكونوا بخير",
    "هذا بوت يعمل 24/7"
  ]
};

// دالة بديلة لتوليد الأسماء
function generateRandomName() {
  const prefixes = ['سريع', 'قوي', 'ذكي', 'هادئ', 'مبدع'];
  const suffixes = ['أسد', 'نسر', 'فهد', 'ذئب', 'دب'];
  const num = Math.floor(Math.random() * 1000);
  return `${prefixes[Math.floor(Math.random()*prefixes.length)]}${
          suffixes[Math.floor(Math.random()*suffixes.length)]}${num}`;
}

function createBot() {
  try {
    const username = generateRandomName();
    
    console.log(`[${new Date().toLocaleString()}] محاولة الاتصال باسم: ${username}`);
    
    const bot = mineflayer.createBot({
      host: serverIP,
      port: serverPort,
      username: username,
      version: version,
      auth: 'offline'
    });

    // إعادة الاتصال التلقائي
    bot.on('end', () => {
      console.log(`[${new Date().toLocaleString()}] انقطع الاتصال. إعادة المحاولة بعد ${settings.reconnectDelay/1000} ثواني...`);
      setTimeout(createBot, settings.reconnectDelay);
    });

    // تغيير الاسم عند الطرد
    bot.on('kicked', (reason) => {
      console.log(`[${new Date().toLocaleString()}] طرد من السيرفر! السبب: ${reason}`);
      bot.end();
    });

    // عند الاتصال الناجح
    bot.on('spawn', () => {
      console.log(`[${new Date().toLocaleString()}] دخل السيرفر بنجاح!`);
      
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
      console.error(`[${new Date().toLocaleString()}] خطأ: ${err}`);
    });
    
  } catch (err) {
    console.error(`[${new Date().toLocaleString()}] خطأ جسيم: ${err}`);
    setTimeout(createBot, settings.reconnectDelay);
  }
}

// بدء تشغيل البوت بعد 5 ثواني
setTimeout(createBot, 5000);
