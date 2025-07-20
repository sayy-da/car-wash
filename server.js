// server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const cron = require('node-cron');
const mongoose = require('mongoose');
const cors = require('cors');

const bookingRoutes = require('./routes/booking');
const adminRoutes = require('./routes/admin');
const Booking = require('./models/Booking');
const Offer = require('./models/Offer');
const sendReminder = require('./utils/sendReminder');

// Initialize WhatsApp connection
require('./watsapp');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Connect to MongoDB once here for all routes
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/', bookingRoutes);
app.use('/admin', adminRoutes);

// CRON Job: Runs every minute (adjust to `0 10 * * *` for 10 AM daily)
cron.schedule('0 10 * * *', async () => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const dueBookings = await Booking.find({
    serviceDate: { $lte: oneMonthAgo }
  });

  const today = new Date();
  const activeOffer = await Offer.findOne({
    from: { $lte: today },
    upto: { $gte: today }
  }).sort({ from: -1 });

  for (const booking of dueBookings) {
    await sendReminder(booking, activeOffer);
    booking.serviceDate = today;
    await booking.save();
  }

  console.log(`🕐 Cron ran at ${today.toISOString()} - ${dueBookings.length} reminders sent`);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
