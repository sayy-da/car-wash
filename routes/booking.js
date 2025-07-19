const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

router.get('/', (req, res) => res.render('index'));
router.get('/services', (req, res) => res.render('services'));
router.get('/book', (req, res) => res.render('book'));

router.post('/book', async (req, res) => {
  const { name, phone, vehicle, date } = req.body;
  await Booking.create({ name, phone, vehicle, serviceDate: new Date(date) });
  res.render('book');
});

module.exports = router;