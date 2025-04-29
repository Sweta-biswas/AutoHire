const express = require("express");
const cors = require("cors");
const passport = require("passport");
const mainRouter = require("./routes/index");
const cookieParser = require('cookie-parser');
require("./passport");  // Your passport configuration file

const app = express();
app.use(cookieParser());

// Use express-session instead of cookie-session

// Passport middleware
app.use(passport.initialize());


// CORS middleware
app.use(
  cors({
    origin: "http://localhost:3000",  // Adjust for your frontend
    methods: "GET,POST,PUT,DELETE",
    credentials: true,  // Allow credentials (cookies)
  })
);

// Body parser
app.use(express.json());


app.use("/api/v1", mainRouter);

// Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
