function isAuthenticated(req, res, next) {
    console.log('heiii');
    
  if (req.session && req.session.isLoggedIn) {
    console.log(req.session.isLoggedIn,'jjjj');
    
    return next(); // ✅ Allow access
  } else {
    return res.redirect('/admin/login'); // ❌ Block & redirect
  }
}

module.exports = isAuthenticated;
