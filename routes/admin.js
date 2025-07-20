const express = require('express');
const Booking = require('../models/Booking');
const Offer = require('../models/Offer');
const router = express.Router();
const isAuthenticated = require('../Middleware/adminMiddleware')
const admin = {
  username: 'shibil',
  password: 'shibil123'
};

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});


router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === admin.username && password === admin.password) {
    req.session.isLoggedIn = true;
    res.redirect('/admin/customers');
  } else {
    res.render('login', { error: 'Invalid credentials. Please try again.' });
  }
});



router.get('/customers',isAuthenticated, async (req, res) => {
  try {
    const customers = await Booking.find();
    res.render('customers', { customers }); 
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching customers');
  }
});

router.post('/add-customers',isAuthenticated, async (req, res) => {
    console.log('heii')
  const { name, phone, vehicle, date } = req.body;
  try {
    await Booking.create({
      name,
      phone,
      vehicle,
      serviceDate: new Date(date)
    });
    res.redirect('/admin/customers');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to add booking');
  }
});

router.post('/update-customers',isAuthenticated, async (req, res) => {
  const { id, name, phone, vehicle, date } = req.body;
 console.log('heii',id,name)
  try {
    await Booking.findByIdAndUpdate(id, {
      name,
      phone,
      vehicle,
      serviceDate: new Date(date)
    });
    res.redirect('/admin/customers');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update booking');
  }
});

router.post('/delete-customer',isAuthenticated, async (req, res) => {
  const { id } = req.body;

  try {
    if (!id || id.trim() === '') {
      return res.status(400).send('Invalid ID');
    }

    await Booking.findByIdAndDelete(id);
    res.redirect('/admin/customers');
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).send('Failed to delete booking');
  }
});

router.get('/offers',isAuthenticated, async (req, res) => {
  try {
   
    function formatDate(date) {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    }

    const offers = await Offer.find();
    res.render('offers', {
      offers,
      formatDate 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching offers');
  }
});


router.post('/add-offer',isAuthenticated, async (req, res) => {
    console.log('kii')
  const { name, from, upto, description } = req.body;
  console.log(name,from,upto, description,'jjjj')
  try {
    await Offer.create({
      name,
      from,
      upto,
      description
      })
    res.redirect('/admin/offers');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to add booking');
  }
});

router.post('/update-offer',isAuthenticated, async (req, res) => {
  const { id,  name, from, upto, description } = req.body;
 console.log('heii',id,name)
  try {
    await Offer.findByIdAndUpdate(id, {
      name,
      from,
      upto,
      description
    });
    res.redirect('/admin/offers');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update booking');
  }
});

router.post('/delete-offer',isAuthenticated, async (req, res) => {
  const { id } = req.body;

  try {
    if (!id || id.trim() === '') {
      return res.status(400).send('Invalid ID');
    }

    await Offer.findByIdAndDelete(id);
    res.redirect('/admin/offers');
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).send('Failed to delete booking');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log('Error destroying session:', err);
    }
    res.redirect('/admin/login');
  });
});


module.exports = router;