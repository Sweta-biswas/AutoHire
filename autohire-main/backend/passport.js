const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const { JobApplicant,Employer } = require('./db'); 
const bcrypt = require('bcryptjs');

const GOOGLE_CLIENT_ID = process.env.CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.CLIENT_SECRET;

passport.use(
  'google-signup-jobapplicant',
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/v1/jobapplicant/google-signup/callback",
      scope: ['profile', 'email'],
    },
    async function (accessToken, refreshToken, profile, done) {
      const { emails, displayName, id: googleId, photos } = profile;
      const email = emails[0].value;
      const profilePicture = photos[0].value;

      try {
       
        // Check if the user already exists in the JobApplicant collection
        let existingApplicant = await JobApplicant.findOne({ email });

        // If the user doesn't exist in JobApplicant collection, check in Employer collection
        if (!existingApplicant) {
          existingApplicant = await Employer.findOne({ email });
        }

        if (existingApplicant) {
          // If user exists, return a message
          return done(null, false, { message: 'Email already exists' });
        }

        // Hash the Google ID before storing it
        const hashedGoogleId = await bcrypt.hash(googleId, 10);

        // Proceed with signup if the user doesn't exist
        const newApplicant = new JobApplicant({
          fullName: displayName,
          email: email,
          password: null,
          googleId: hashedGoogleId,
          signUpMethod: 'google',
          profilePicture: profilePicture,
        });

        const savedApplicant = await newApplicant.save();
        return done(null, done, { message: 'You registered successfully' });
      } catch (err) {
        done(err, null);
      }
    }
  )
);


  passport.use(
    'google-signin-jobapplicant',
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/v1/jobapplicant/google-signin/callback",
        scope: ['profile', 'email'],
      },
      async function (accessToken, refreshToken, profile, done) {
        const { emails, id: googleId } = profile;
        const email = emails[0].value;
  
        try {
          // Check if the user exists in the database
          let existingApplicant = await JobApplicant.findOne({ email });
  
          if (!existingApplicant) {
            // If user doesn't exist, return a message
            return done(null, false, { message: 'User not found' });
          }
  
          // Check if the user signed up with Google
          if (existingApplicant.signUpMethod !== 'google') {
            return done(null, false, { message: 'Please sign in with the method you used to sign up' });
          }
  
          // Verify the Google ID
          const isValidGoogleId = await bcrypt.compare(googleId, existingApplicant.googleId);
  
          if (!isValidGoogleId) {
            return done(null, false, { message: 'Invalid Google ID' });
          }
  
          // Proceed with sign-in if the user exists and the Google ID is valid
          return done(null, existingApplicant, { message: 'You signed in successfully' });
        } catch (err) {
          done(err, null);
        }
      }
    )
  );


  passport.use(
    'google-signup-employer',
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/v1/employer/google-signup/callback",
        scope: ['profile', 'email'],
      },
      async function (accessToken, refreshToken, profile, done) {
        const { emails, displayName, id: googleId, photos } = profile;
        const email = emails[0].value;
        const profilePicture = photos[0].value;
  
        try {
          // Check if the user already exists in the JobApplicant collection
          let existingApplicant = await Employer.findOne({ email });
  
          // If the user doesn't exist in JobApplicant collection, check in Employer collection
          if (!existingApplicant) {
            existingApplicant = await JobApplicant.findOne({ email });
          }
  
          if (existingApplicant) {
            // If user exists, return a message
            return done(null, false, { message: 'Email already exists' });
          }
  
          // Hash the Google ID before storing it
          const hashedGoogleId = await bcrypt.hash(googleId, 10);
  
          // Proceed with signup if the user doesn't exist
          const newApplicant = new Employer({
            fullName: displayName,
            email: email,
            password: null,
            googleId: hashedGoogleId,
            signUpMethod: 'google',
            profilePicture: profilePicture,
          });
  
          const savedApplicant = await newApplicant.save();
          return done(null, done, { message: 'You registered successfully' });
        } catch (err) {
          done(err, null);
        }
      }
    )
  );

  passport.use(
    'google-signin-employer',
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/v1/employer/google-signin/callback",
        scope: ['profile', 'email'],
      },
      async function (accessToken, refreshToken, profile, done) {
        const { emails, id: googleId } = profile;
        const email = emails[0].value;
  
        try {
         
          // Check if the user exists in the database
          let existingApplicant = await Employer.findOne({ email });
  
          if (!existingApplicant) {
            // If user doesn't exist, return a message
            return done(null, false, { message: 'User not found' });
          }
  
          // Check if the user signed up with Google
          if (existingApplicant.signUpMethod !== 'google') {
            return done(null, false, { message: 'Please sign in with the method you used to sign up' });
          }
  
          // Verify the Google ID
          const isValidGoogleId = await bcrypt.compare(googleId, existingApplicant.googleId);
  
          if (!isValidGoogleId) {
            return done(null, false, { message: 'Invalid Google ID' });
          }
  
          // Proceed with sign-in if the user exists and the Google ID is valid
          return done(null, existingApplicant, { message: 'You signed in successfully' });
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
  
  

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
