// watsapp.js
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const mongoose = require('mongoose');
const Session = require('./models/session')
const QRCode = require('qrcode');

let client;

async function startWhatsApp() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected for WhatsApp session');

    const sessionDoc = await Session.findOne();

    client = new Client({
      session: sessionDoc ? sessionDoc.session : undefined,
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

   client.on('qr', async qr => {
  console.log('📱 Scan this QR code with your WhatsApp:');
  const smallQR = await QRCode.toString(qr, { type: 'terminal', small: true });
  console.log(smallQR);
});
    client.on('authenticated', async (session) => {
      await Session.findOneAndUpdate({}, { session }, { upsert: true });
      console.log('🔐 Session saved to MongoDB');
    });

    client.on('ready', () => {
      console.log('✅ WhatsApp is ready!');
    });

    client.on('auth_failure', msg => {
      console.error('❌ Authentication failure:', msg);
    });

    client.on('disconnected', async reason => {
      console.warn('⚠️ WhatsApp disconnected:', reason);
      await Session.deleteMany({});
      console.log('🗑️ Session cleared from MongoDB');
    });

    client.initialize();
  } catch (err) {
    console.error('❌ Error starting WhatsApp bot:', err);
  }
}

startWhatsApp();

module.exports = client;
