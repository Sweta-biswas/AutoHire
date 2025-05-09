const express = require("express");
const cors = require("cors");
const passport = require("passport");
const mainRouter = require("./routes/index");
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require("./passport");  // Your passport configuration file
require('dotenv').config();

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

// Add a route to check authentication status
app.get('/api/v1/check-auth', (req, res) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(200).json({ authenticated: false });
    }
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Return authentication status and user info
    return res.status(200).json({ 
      authenticated: true, 
      user: {
        id: decoded.id,
        email: decoded.email,
        fullName: decoded.fullName,
        role: decoded.role || null,
        profilePicture: decoded.profilePicture || null
      } 
    });
  } catch (error) {
    console.error('Error checking auth status:', error);
    return res.status(200).json({ authenticated: false });
  }
});

// Logout route
app.post('/api/v1/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
});

app.use("/api/v1", mainRouter);

// Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
