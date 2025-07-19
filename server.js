require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const cron = require('node-cron');
const bookingRoutes = require('./routes/booking');
const adminRoutes = require('./routes/admin')
const Booking = require('./models/Booking');
const Offer = require('./models/Offer')
const sendReminder = require('./utils/sendReminder');
const cors = require('cors');
require('./watsapp'); 
const app = express();

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));
  
  app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
  }));


app.use('/', bookingRoutes);
app.use('/admin',adminRoutes)


cron.schedule('* * * * *', async () => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth()-1 ); 

  const dueBookings = await Booking.find({
    serviceDate: { $lte: oneMonthAgo }
  });

  const today = new Date();
  const activeOffer = await Offer.findOne({
    from: { $lte: today },
    upto: { $gte: today }
  }).sort({ from: -1 });

  for (const booking of dueBookings) {
    // Send reminder
    sendReminder(booking, activeOffer);

    // Update the serviceDate to today's date
    booking.serviceDate = today;
    await booking.save(); // save the change
  }

  console.log(`Cron job ran at ${today.toISOString()} - ${dueBookings.length} reminders sent`);
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));