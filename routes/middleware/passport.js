// var passport = require("passport");
// var LocalStrategy = require("passport-local").Strategy;
// var mongoose = require("mongoose");
// var Account = mongoose.model("Account");

// passport.use(
//   new LocalStrategy(
//     {
//       usernameField: "account[email]",
//       passwordField: "account[password]"
//     },
//     function(email, password, done) {
//       Account.findOne({ email: email })
//         .populate(["documents", "shareRequests"])
//         .then(function(account) {
//           if (!account || !account.validPassword(password)) {
//             return done(null, false, {
//               errors: { "email or password": "is invalid" }
//             });
//           }

//           return done(null, account);
//         })
//         .catch(done);
//     }
//   )
// );
