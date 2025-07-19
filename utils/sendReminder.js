
const client = require('../watsapp');

module.exports = async function sendReminder(booking, offer = null) {
  let phone = booking.phone.replace(/\D/g, '');
  if (!phone.startsWith('91')) {
    phone = '91' + phone;
  }
  const chatId = `${phone}@c.us`;

  let message = `Hi! Just a quick reminder — it's time to give your car some shine again! If you'd like to schedule your next wash, feel free to let us know. We’re here to help keep your car looking its best! 🚗✨`;

  // Append offer message if available
  if (offer) {
    const offerMessage = `\n\n🎉 Special Offer Alert!\nOur '${offer.name}' was active from ${new Date(offer.from).toDateString()} to ${new Date(offer.upto).toDateString()}.\n Details: ${offer.description}`;
    message += offerMessage;
  }

  // ✅ Ensure WhatsApp client is ready
  if (client.info === undefined) {
    console.log("⚠️ WhatsApp client not ready yet. Waiting...");
    await new Promise(resolve => client.once('ready', resolve));
  }

  try {
    await client.sendMessage(chatId, message);
    console.log(`📨 Reminder sent to ${phone}`);
  } catch (err) {
    console.error(`❌ Failed to send to ${phone}:`, err);
  }
};
