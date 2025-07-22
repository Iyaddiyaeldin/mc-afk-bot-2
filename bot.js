const mineflayer = require('mineflayer');
const generateUsername = require('random-username-generator');
const express = require('express');

// 1. إعداد خادم ويب لتفادي إيقاف Render للتطبيق
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Minecraft AFK Bot is running!');
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
  reconnectDelay: 10000,
  chatMessages: [
    "مرحباً! أنا هنا لأجنب AFK",
    "السيرفر ممتاز اليوم",
    "ما الجديد؟",
    "أتمنى أن تكونوا بخير",
    "هذا بوت يعمل 24/7"
  ]
};

function createBot() {
  try {
    // توليد اسم عشوائي (بديل في حالة وجود مشاكل)
    const username = generateUsername.generate() || 
                    `Bot${Math.floor(Math.random() * 10000)}`;
    
    console.log(`[${new Date().toLocaleString()}] Connecting as: ${username}`);
    
    const bot = mineflayer.createBot({
      host: serverIP,
      port: serverPort,
      username: username,
      version: version,
      auth: 'offline'
    });

    bot.on('end', () => {
      console.log(`[${new Date().toLocaleString()}] Disconnected. Reconnecting in ${settings.reconnectDelay/1000}s...`);
      setTimeout(createBot, settings.reconnectDelay);
    });

    bot.on('kicked', (reason) => {
      console.log(`[${new Date().toLocaleString()}] Kicked: ${reason}`);
      bot.end();
    });

    bot.on('spawn', () => {
      console.log(`[${new Date().toLocaleString()}] Successfully connected!`);
      
      // مؤقت القفز
      const jumpInterval = setInterval(() => {
        if(bot.entity) {
          bot.setControlState('jump', true);
          setTimeout(() => bot.setControlState('jump', false), 500);
        }
      }, settings.jumpInterval);

      // مؤقت الشات
      const chatInterval = setInterval(() => {
        if(bot.entity) {
          const msg = settings.chatMessages[Math.floor(Math.random() * settings.chatMessages.length)];
          bot.chat(msg);
        }
      }, settings.chatInterval);

      // تنظيف المؤقتات عند الخروج
      bot.on('end', () => {
        clearInterval(jumpInterval);
        clearInterval(chatInterval);
      });
    });

    bot.on('error', (err) => {
      console.error(`[${new Date().toLocaleString()}] ERROR: ${err}`);
    });
    
  } catch (err) {
    console.error(`[${new Date().toLocaleString()}] FATAL ERROR: ${err}`);
    setTimeout(createBot, settings.reconnectDelay);
  }
}

// بدء تشغيل البوت بعد 5 ثواني
setTimeout(createBot, 5000);
