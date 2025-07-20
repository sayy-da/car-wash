const { getClient } = require('../watsapp');

module.exports = async function sendReminder(booking, offer = null) {
  const client = getClient();

  if (!client || !client.info) {
    console.log("⚠️ WhatsApp client not ready yet. Waiting...");
    await new Promise(resolve => client?.once('ready', resolve));
  }

  let phone = booking.phone.replace(/\D/g, '');
  if (!phone.startsWith('91')) phone = '91' + phone;

  const chatId = `${phone}@c.us`;
  let message = `Hi! Just a quick reminder — it's time to give your car some shine again! 🚗✨`;

  if (offer) {
    message += `\n\n🎉 Offer: ${offer.name}\n🗓️ ${new Date(offer.from).toDateString()} to ${new Date(offer.upto).toDateString()}\n📣 ${offer.description}`;
  }

  try {
    await client.sendMessage(chatId, message);
    console.log(`📨 Reminder sent to ${phone}`);
  } catch (err) {
    console.error(`❌ Failed to send to ${phone}:`, err.message);
  }
};
