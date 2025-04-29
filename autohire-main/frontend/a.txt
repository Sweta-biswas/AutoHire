const express = require('express');
const router = express.Router();
const { JobPost,JobApplication } = require('../db'); // Import the JobPost model
const { authMiddleware } = require('../middleware');

// Route to get job postings with specific fields
router.get('/alljobs', async (req, res) => {
  try {
    const { title, location } = req.query; // Use req.query for query params in GET request
    const query = {};

    // Handle title search
    if (title) {
      const titleNoSpace = title.replace(/\s+/g, '').toLowerCase(); // Remove spaces and convert to lowercase
      query.jobRole = { $regex: titleNoSpace, $options: 'i' }; // Case-insensitive search with space removal
    }

    // Handle location search
    if (location) {
      const locationParts = location.split(',').map(part => part.trim()); // Split location by comma and trim spaces

      // If location contains a city and country
      if (locationParts.length === 2) {
        const city = locationParts[0];
        const country = locationParts[1];

        // First search in the city
        query.city = { $regex: city, $options: 'i' };

        // Then search in the country
        query.country = { $regex: country, $options: 'i' };
      } else if (location.toLowerCase() === 'remote') {
        // If location is "remote", search in jobLocation field
        query.jobLocation = { $regex: 'remote', $options: 'i' };
      } else {
        // For other cases, search first in city, and then in country if no results are found
        query.$or = [
          { city: { $regex: location, $options: 'i' } },
        ];

        // If no jobs found in city, search in country
        const jobsInCity = await JobPost.find(query, 'position jobRole jobDescription companyName jobLocation minSalary maxSalary city country');

        if (jobsInCity.length === 0) {
          // If no jobs found in city, search in country
          query.$or.push(
            { country: { $regex: location, $options: 'i' } }
          );
        }
      }
    }

    // Query the database with the constructed query
    const jobs = await JobPost.find(query, 'position jobRole jobDescription companyName jobLocation minSalary maxSalary city country');
    
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching job posts:', error);
    res.status(500).json({ error: 'Failed to fetch job posts' });
  }
});


router.get('/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const existingApplication = await JobApplication.findOne({
        jobPost: id,
        jobApplicant: req.user.id
      });

      const job = await JobPost.findById(id)
        .populate('employer') // Populate employer details if required
        .select('-__v'); // Exclude MongoDB's version key
      
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }
      if(existingApplication){
        return res.status(202).json(job )
      }
      res.status(200).json(job);
    } catch (error) {
      console.error('Error fetching job details:', error);
      res.status(500).json({ error: 'Failed to fetch job details' });
    }
  });
  

module.exports = router;
