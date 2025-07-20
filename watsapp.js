const { Client } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const mongoose = require('mongoose');
const path = require('path');
const Session = require('./models/session');

let client;

async function startWhatsApp() {
  try {
    // 1. Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('✅ MongoDB connected for WhatsApp session');
    }

    // 2. Get session from DB
    const sessionDoc = await Session.findOne();

    // 3. Initialize WhatsApp client
    client = new Client({
      session: sessionDoc?.session || null,
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    // 4. QR code generation (only once)
    let qrGenerated = false;
    client.on('qr', async qr => {
      if (qrGenerated) return;
      qrGenerated = true;

      try {
        const qrPath = path.join(__dirname, 'public', 'qr.png');
        await QRCode.toFile(qrPath, qr, { width: 300 });
        console.log(`📸 QR code saved to ${qrPath}`);
      } catch (err) {
        console.error('❌ Error saving QR code:', err);
      }
    });

    // 5. Save session to MongoDB
    client.on('authenticated', async (session) => {
      await Session.findOneAndUpdate({}, { session }, { upsert: true });
      console.log('🔐 Session saved to MongoDB');
    });

    // 6. Ready state
    client.on('ready', () => {
      console.log('✅ WhatsApp is ready!');
    });

    // 7. Auth failure
    client.on('auth_failure', msg => {
      console.error('❌ Authentication failure:', msg);
    });

    // 8. Disconnected
    client.on('disconnected', async reason => {
      console.warn('⚠️ WhatsApp disconnected:', reason);
      await Session.deleteMany({});
      console.log('🗑️ Session cleared from MongoDB');
    });

    // 9. Start client
    client.initialize();
  } catch (err) {
    console.error('❌ Error starting WhatsApp bot:', err);
  }
}

startWhatsApp();

// ✅ Export a function to safely get the initialized client
module.exports = {
  getClient: () => client
};
