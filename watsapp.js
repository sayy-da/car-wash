const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
console.log('hello')
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true }
});
console.log('hello',client)


client.on('qr', qr => {
  console.log('📱 Scan this QR code with your WhatsApp:');
  qrcode.generate(qr, { small: true });
});
console.log('hello')

client.on('ready', () => {
  console.log('✅ WhatsApp is ready!');
});


client.initialize();

module.exports = client;
