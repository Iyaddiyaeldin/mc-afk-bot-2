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
const version = '1.19.2';

const settings = {
  jumpInterval: 15000,
  chatInterval: 30000,
  reconnectDelay: 30000,
  chatMessages: [
    "Hello! I'm an AFK bot",
    "Nice server today!",
    "What's new?",
    "Hope you're all doing well",
    "This bot runs 24/7"
  ],
  bedSearchRadius: 3, // البحث عن سرير في دائرة نصف قطرها 3 بلوكات
  sleepTime: [13000, 23000] // وقت النوم بين 13000 و 23000 (وقت ماينكرافت)
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

    // متغيرات التحكم بالنوم
    let isSleeping = false;
    let jumpInterval;
    let chatInterval;
    let sleepCheckInterval;

    // إعادة الاتصال التلقائي
    bot.on('end', () => {
      console.log(`[${new Date().toLocaleString()}] Disconnected. Reconnecting in ${settings.reconnectDelay/1000} seconds...`);
      clearInterval(sleepCheckInterval);
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
      jumpInterval = setInterval(() => {
        if(bot.entity && !isSleeping) {
          bot.setControlState('jump', true);
          setTimeout(() => bot.setControlState('jump', false), 500);
        }
      }, settings.jumpInterval);

      // الكتابة في الشات
      chatInterval = setInterval(() => {
        if(bot.entity && !isSleeping) {
          const randomMsg = settings.chatMessages[Math.floor(Math.random() * settings.chatMessages.length)];
          bot.chat(randomMsg);
        }
      }, settings.chatInterval);

      // التحقق من وقت النوم كل 10 ثواني
      sleepCheckInterval = setInterval(() => {
        checkSleepConditions();
      }, 10000);

      // تنظيف المؤقتات عند الخروج
      bot.on('end', () => {
        clearInterval(jumpInterval);
        clearInterval(chatInterval);
        clearInterval(sleepCheckInterval);
      });
    });

    // إدارة الأخطاء
    bot.on('error', (err) => {
      console.error(`[${new Date().toLocaleString()}] ERROR: ${err}`);
    });
    
    // دالة التحقق من شروط النوم
    function checkSleepConditions() {
      // التحقق من أن البوت ليس نائماً بالفعل
      if (isSleeping) return;
      
      // الحصول على وقت العالم
      const time = bot.time.timeOfDay;
      
      // التحقق إذا كان الوقت ليلاً
      const isNightTime = time >= settings.sleepTime[0] && time < settings.sleepTime[1];
      
      if (isNightTime) {
        // البحث عن سرير قريب
        const bedBlock = bot.findBlock({
          matching: block => bot.isBed(block),
          maxDistance: settings.bedSearchRadius
        });
        
        if (bedBlock) {
          console.log(`[${new Date().toLocaleString()}] Found bed at ${bedBlock.position}. Trying to sleep...`);
          
          // التوجه إلى السرير
          bot.lookAt(bedBlock.position, true, () => {
            // محاولة النوم
            bot.sleep(bedBlock, (err) => {
              if (err) {
                console.log(`[${new Date().toLocaleString()}] Could not sleep: ${err.message}`);
              } else {
                console.log(`[${new Date().toLocaleString()}] Sleeping peacefully!`);
                isSleeping = true;
                
                // الاستيقاظ التلقائي عند الصباح
                bot.on('wake', () => {
                  console.log(`[${new Date().toLocaleString()}] Woke up!`);
                  isSleeping = false;
                });
              }
            });
          });
        }
      }
    }
    
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
