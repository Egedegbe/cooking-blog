const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const fileUpload = require("express-fileupload");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const passport = require('passport')
const connectEnsure = require('connect-ensure-login');
const { roles } = require("./server/routes/constants");
const app = express();
const port = process.env.PORT || 27017;

require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(expressLayouts);

app.use(cookieParser("CookingBlogSecure"));
app.use(
  session({
    secret: "CookingBlogSecretSession",
    saveUninitialized: false,
    resave: false,
  })
);
app.use(passport.initialize())
app.use(passport.session())
require('./utils/passport.auth')
app.use((req, res, next)=>{
  res.locals.user = req.user
  next()
})

app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
  
});

app.use(fileUpload());

app.set("layout", "./layouts/main");
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

// const routes = require('./server/routes/index.route.js')

app.use("/", require("./server/routes/index.route"));
app.use("/auth", require("./server/routes/authroutes"));
app.use("/user",connectEnsure.ensureLoggedIn({redirectTo:'/auth/login'}), require("./server/routes/userroutes"));
app.use('/admin',connectEnsure.ensureLoggedIn({redirectTo:'/auth/login'}),ensureAdmin,require('./server/routes/admin_routes'))

// app.listen(port, '192.168.0.178', ()=> console.log(`Listening to port http://192.168.0.178:${port}`));
app.listen(port, () => console.log(`Listening to port ${port}`));

// function ensureAuthenticated(req,res,next){
//   if(req.isAuthenticated()){
//     next()
//   }else{
//     res.redirect('/auth/login')
//   }
// }


function ensureAdmin(req,res,next){
  if(req.user.role === roles.admin){
    next()
  }else{
    req.flash('warning', 'You are not authorized to view this route')
    res.redirect('/')
  }
}