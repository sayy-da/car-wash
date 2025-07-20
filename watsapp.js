const { Client } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Session = require('./models/session');

let client;

async function startWhatsApp() {
  try {
    // 1. Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('✅ MongoDB connected for WhatsApp session');
    }

    // 2. Retrieve stored session
    const sessionDoc = await Session.findOne();

    // 3. Initialize WhatsApp client
    client = new Client({
      session: sessionDoc?.session,
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    // 4. Generate and save QR code
    client.on('qr', async qr => {
      try {
        const qrPath = path.join(__dirname, 'public', 'qr.png'); // Save in public/
        await QRCode.toFile(qrPath, qr, { width: 300 });
        console.log(`📸 QR code saved to ${qrPath}`);
      } catch (err) {
        console.error('❌ Error saving QR code:', err);
      }
    });

    // 5. Save session on authentication
    client.on('authenticated', async (session) => {
      await Session.findOneAndUpdate({}, { session }, { upsert: true });
      console.log('🔐 Session saved to MongoDB');
    });

    // 6. WhatsApp is ready
    client.on('ready', () => {
      console.log('✅ WhatsApp is ready!');
    });

    // 7. Authentication failed
    client.on('auth_failure', msg => {
      console.error('❌ Authentication failure:', msg);
    });

    // 8. Disconnection handler
    client.on('disconnected', async reason => {
      console.warn('⚠️ WhatsApp disconnected:', reason);
      await Session.deleteMany({});
      console.log('🗑️ Session cleared from MongoDB');
    });

    // 9. Start the client
    client.initialize();
  } catch (err) {
    console.error('❌ Error starting WhatsApp bot:', err);
  }
}

startWhatsApp();

module.exports = client;
