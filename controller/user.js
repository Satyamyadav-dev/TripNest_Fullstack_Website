const User = require("../models/user.js")

module.exports.renderSignupForm = (req, res) => {
  res.render('./users/signup.ejs')
}

module.exports.signup = async(req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    
    req.flash('success', "Welcome to Wanderlust!");
    return res.redirect("/listings");
    
  } catch (e) {
    req.flash("error", e.message);
    return res.redirect("/signup");
  }
}

module.exports.renderLoginForm = (req, res) => {
  res.render('./users/login.ejs')
}

module.exports.afterLogin = async (req, res) => {
  req.flash('success', "Welcome back to Wanderlust!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  return res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      req.flash("error", "Logout failed");
      return res.redirect("/listings");  // ✅ FIXED: return before redirect
    }
    req.flash("success", "You are logged out!");
    return res.redirect("/listings");  // ✅ FIXED: return before redirect
  });
}