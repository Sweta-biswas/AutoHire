const express = require('express');
const Employer = require('./Employer'); 
const JobApplicant = require('./JobApplicant');   
const JobList = require('./JobList')
const router = express.Router();
const { authMiddleware } = require('../middleware');


router.get('/check-auth',authMiddleware, (req, res) => {
  
    try {
      res.status(200).json({ authenticated: true, user: req.user });
    } catch (error) {
      res.status(400).json({ authenticated: false, message: 'Error' });
    }
  });

  router.post('/logout', authMiddleware, (req, res) => {
    try {
      res.clearCookie('token');
      res.status(200).json({ success: true, message: 'Logout successful' });
    } catch (error) {
      console.error(error)
      res.status(400).json({ success: false, message: 'Logout failed' });
    }
  });

router.use('/employer', Employer);
router.use('/jobapplicant', JobApplicant);
router.use('/joblist', JobList);

module.exports = router;