module.exports = function requireLogin(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    if (req.flash) req.flash("error", "You must be logged in.");
    return res.redirect("/auth/login");
  }
};
