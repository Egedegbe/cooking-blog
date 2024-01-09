const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("../server/models/user.model");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, {
            message: "Username/email not registered",
          });
        }
        const isMatch = await user.isValidpassword(password);
        // if (isMatch) {
        //   return done(null, user);
        // } else {
        //     return done(null,false,{message:'Incorrect Password'})
        // }
        return isMatch
          ? done(null, user)
          : done(null, false, { message: "Incorrect Password" });
      } catch (error) {
       done(error);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
