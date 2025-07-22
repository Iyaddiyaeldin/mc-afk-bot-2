const mineflayer = require('mineflayer');
const express = require('express');

// 1. إعداد خادم ويب
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Minecraft AFK Bot is running!');
});

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
  reconnectDelay: 30000, // 30 ثانية
  chatMessages: [
    "Hello! I'm an AFK bot",
    "Nice server today!",
    "What's new?",
    "Hope you're all doing well",
    "This bot runs 24/7"
  ]
};

// دالة لتوليد أسماء لاتينية عشوائية
function generateRandomName() {
  const prefixes = ['Cool', 'Mystic', 'Epic', 'Shadow', 'Golden', 'Fast', 'Smart', 'Brave', 'Wise'];
  const suffixes = ['Wolf', 'Dragon', 'Phoenix', 'Tiger', 'Eagle', 'Lion', 'Fox', 'Bear', 'Hawk'];
  const num = Math.floor(Math.random() * 1000);
  return `${prefixes[Math.floor(Math.random()*prefixes.length)]}${
          suffixes[Math.floor(Math.random()*suffixes.length)]}${num}`;
}

function createBot() {
  try {
    const username = generateRandomName();
    
    console.log(`[${new Date().toLocaleString()}] Trying to connect as: ${username}`);
    
    const bot = mineflayer.createBot({
      host: serverIP,
      port: serverPort,
      username: username,
      version: version,
      auth: 'offline'
    });

    // إعادة الاتصال التلقائي
    bot.on('end', () => {
      console.log(`[${new Date().toLocaleString()}] Disconnected. Reconnecting in ${settings.reconnectDelay/1000} seconds...`);
      setTimeout(createBot, settings.reconnectDelay);
    });

    // تغيير الاسم عند الطرد
    bot.on('kicked', (reason) => {
      console.log(`[${new Date().toLocaleString()}] Kicked: ${reason}`);
      bot.end();
    });

    // عند الاتصال الناجح
    bot.on('spawn', () => {
      console.log(`[${new Date().toLocaleString()}] Successfully connected!`);
      
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
      console.error(`[${new Date().toLocaleString()}] ERROR: ${err}`);
    });
    
  } catch (err) {
    console.error(`[${new Date().toLocaleString()}] FATAL ERROR: ${err}`);
    setTimeout(createBot, settings.reconnectDelay);
  }
}

// بدء تشغيل البوت بعد 5 ثواني
setTimeout(createBot, 5000);

// الحفاظ على التطبيق نشطاً
setInterval(() => {
  const https = require('https');
  const url = `https://${process.env.RENDER_EXTERNAL_URL}/keepalive` || 
              `https://mc-afk-bot-2.onrender.com/keepalive`;
  
  https.get(url, (res) => {
    console.log(`[${new Date().toLocaleString()}] Keep-alive ping sent`);
  }).on('error', (err) => {
    console.error(`[${new Date().toLocaleString()}] Keep-alive error: ${err.message}`);
  });
}, 5 * 60 * 1000); // كل 5 دقائق
