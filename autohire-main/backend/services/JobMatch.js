const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;
const {JobApplicant, JobPost, JobApplication} = require('../db') // Replace with actual path to Applicant model

// Helper function to calculate text similarity using TF-IDF
function calculateTextSimilarity(text1, text2) {
  // Improved tokenizer with hyphen handling and text normalization
  const tokenize = (text) => {
    return text
      .toLowerCase()
      .replace(/-/g, ' ') // Handle hyphens by replacing with space
      .split(/[^a-z0-9']+/) // Split on non-alphanumeric characters
      .filter(t => t.length > 0);
  };

  // Get tokens for both texts
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);
  
  // Create combined vocabulary
  const vocabulary = [...new Set([...tokens1, ...tokens2])];

  // Calculate term frequencies
  const tf1 = calculateTermFrequency(tokens1, vocabulary);
  const tf2 = calculateTermFrequency(tokens2, vocabulary);

  // Compute cosine similarity
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  vocabulary.forEach(term => {
    dotProduct += tf1[term] * tf2[term];
    mag1 += tf1[term] ** 2;
    mag2 += tf2[term] ** 2;
  });

  const magnitude = Math.sqrt(mag1) * Math.sqrt(mag2);
  const similarity = magnitude !== 0 ? (dotProduct / magnitude) * 100 : 0;

  return similarity;
}

function calculateTermFrequency(tokens, vocabulary) {
  const counts = tokens.reduce((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {});

  return vocabulary.reduce((acc, term) => {
    acc[term] = counts[term] || 0;
    return acc;
  }, {});
}

// Helper function to calculate skills match percentage
function calculateSkillsMatch(jobSkills, candidateSkills) {
  // If either array is empty, return 0
  if (!jobSkills.length || !candidateSkills.length) {
    return 0;
  }

  // Transform candidateSkills to match jobSkills format
  const candidateSkillNames = candidateSkills.map((skill) => skill.name);

  const matchedSkills = jobSkills.filter((skill) =>
    candidateSkillNames.some((candSkill) =>
      candSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(candSkill.toLowerCase())
    )
  );

  return (matchedSkills.length / jobSkills.length) * 100;
}


function checkExperienceMatch(requiredExp, candidateExp) {
  if (!requiredExp.length || !candidateExp.length) {
    return 0;
  }

  const expRanges = {
    '0-1 years': [0, 1],
    '2-4 years': [2, 4],
    '5-7 years': [5, 7],
    '8+ years': [8, Infinity],
  };

  const required = expRanges[requiredExp];
  if (!required) return 0;

  const totalYears = candidateExp.reduce((total, exp) => {
    // Parse MM/YYYY format
    const [startMonth, startYear] = exp.startDate.split('/');
    const start = new Date(startYear, startMonth - 1); // Month is 0-based in Date constructor

    let end;
    if (exp.endDate === 'Present') {
      end = new Date();
    } else {
      const [endMonth, endYear] = exp.endDate.split('/');
      end = new Date(endYear, endMonth - 1);
    }

    const years = (end - start) / (1000 * 60 * 60 * 24 * 365);
    return total + years;
  }, 0);

  if (totalYears >= required[0] && totalYears <= required[1]) {
    return 100; // Perfect match
  } else if (totalYears > required[1]) {
    return 80; // Overqualified
  } else {
    return (totalYears / required[0]) * 100; // Partial match
  }
}

// Helper function to check location match
function checkLocationMatch(jobPost, resume) {
  if (jobPost.jobLocation === 'remote') return 100;

  if (!resume.personal.country.length || !resume.personal.city.length) {
    return 0;
  }
  if (jobPost.jobLocation === 'onsite') {
    if (
      jobPost.country.toLowerCase() === resume.personal.country.toLowerCase()
    ) {
      return 100;
    } else {
      return 50;
    }
  }

  return 0;
}

// New function to generate detailed recommendations
function generateRecommendation(matchResults) {
  const { totalScore, details } = matchResults;
  
  // Generate primary recommendation based on total score
  let primaryRecommendation;
  if (totalScore >= 85) {
    primaryRecommendation = "Strong Match: Highly recommended for interview";
  } else if (totalScore >= 70) {
    primaryRecommendation = "Good Match: Consider for interview";
  } else if (totalScore >= 60) {
    primaryRecommendation = "Potential Match: Review additional qualifications";
  } else {
    primaryRecommendation = "Weak Match: May not meet core requirements";
  }

  // Generate specific insights based on component scores
  const insights = [];
  
  if (details.skillsMatch >= 80) {
    insights.push("Strong skills alignment with job requirements");
  } else if (details.skillsMatch < 50) {
    insights.push("Consider evaluating technical skill gaps");
  }

  if (details.experienceMatch >= 80) {
    insights.push("Experience level well-suited for the position");
  } else if (details.experienceMatch < 50) {
    insights.push("May need additional experience in the field");
  }

  if (details.locationMatch < 50) {
    insights.push("Location might be a consideration for this role");
  }

  if (details.roleSimilarity >= 75) {
    insights.push("Previous roles strongly align with position");
  }

  return {
    recommendation: primaryRecommendation,
    score: totalScore,
    insights: insights,
    details: details
  };
}

// Main matching function
async function matchResumesForJob(jobPostId) {
  try {
    // Get job post details
    const jobPost = await JobPost.findOne({ jobId: jobPostId });
    if (!jobPost) {
      throw new Error('Job post not found');
    }

    console.log('\n=== Job Post Details ===');
    console.log({
      jobId: jobPost.jobId,
      role: jobPost.jobRole,
      requiredSkills: jobPost.skills,
      experience: jobPost.experience,
      location: jobPost.jobLocation
    });

    // Get all applicants
    const applicants = await JobApplicant.find({}).select('resume');
    console.log(`\nTotal number of applicants: ${applicants.length}`);

    // Calculate match scores for each applicant
    const matches = await Promise.all(
      applicants.map(async (applicant, index) => {
        let resume = applicant.resume;
        
        // Sanitize resume fields
        // resume = sanitizeResume(resume);

        console.log(`\n=== Processing Applicant ${index + 1} ===`);
        console.log('Resume Details:');
        console.log({
          name: `${resume.personal.firstName} ${resume.personal.lastName}`,
          email: resume.personal.email,
          skills: resume.skills,
          experience: resume.experience.map(exp => ({
            role: exp.role,
            duration: `${exp.startDate} to ${exp.endDate || 'Present'}`,
            description: exp.description
          })),
          education: resume.education,
          location: {
            city: resume.personal.city,
            country: resume.personal.country
          }
        });
      
        // Calculate different matching criteria
       
        if(resume.personal.city===undefined)
          resume.personal.city = ' ';
        if(resume.personal.country===undefined)
          resume.personal.country = ' ';
    
        const skillsScore = calculateSkillsMatch(jobPost.skills, resume.skills);
        const experienceScore = checkExperienceMatch(jobPost.experience, resume.experience);
        const locationScore = checkLocationMatch(jobPost, resume);
        const enhanceText = (text) => {
          return text
            .replace(/\b(?:engineer|developer)\b/gi, 'developer')
            .replace(/\b(?:builds?|crafts?|creates?)\b/gi, 'create');
        };
        const roleSimilarity = calculateTextSimilarity(enhanceText(
          jobPost.jobRole + ' ' + jobPost.jobDescription),enhanceText(
          resume.professionalSummary)
        );
        const educationScore = resume.education.some((edu) =>
          edu.degree && edu.degree.toLowerCase().includes(jobPost.jobRole.toLowerCase())
        )
          ? 100
          : 50;

        const weightedScore = (
          skillsScore * 0.35 +
          experienceScore * 0.25 +
          locationScore * 0.15 +
          roleSimilarity * 0.15 +
          educationScore * 0.10
        );

        const totalScore = Math.round(weightedScore);

        // Save application record if score >= 60
        if (totalScore >= 60) {
          const applicationExists = await JobApplication.findOne({
            jobPost: jobPost._id,
            jobApplicant: applicant._id,
          });

          if (!applicationExists) {
            await JobApplication.create({
              jobPost: jobPost._id,
              jobApplicant: applicant._id,
              matchScore: totalScore,
            });
            console.log(`Applicant ${applicant._id} applied for job ${jobPost.jobId}`);
          }
        }

        const matchResults = {
          applicantId: applicant._id,
          name: `${resume.personal.firstName} ${resume.personal.lastName}`,
          email: resume.personal.email,
          totalScore: Math.round(weightedScore),
          details: {
            skillsMatch: Math.round(skillsScore),
            experienceMatch: Math.round(experienceScore),
            locationMatch: Math.round(locationScore),
            roleSimilarity: Math.round(roleSimilarity),
            educationRelevance: Math.round(educationScore),
          },
        };

        // Generate recommendation
        const recommendation = generateRecommendation(matchResults);
        const finalResult = {
          ...matchResults,
          recommendation: recommendation
        };

        // Log detailed scoring and recommendation for each applicant
        console.log('\nScoring Details:');
        console.log({
          name: finalResult.name,
          totalScore: finalResult.totalScore,
          details: finalResult.details,
          recommendation: finalResult.recommendation
        });

        return finalResult;
      })
    );

    // Sort matches by score in descending order
    const sortedMatches = matches.sort((a, b) => b.totalScore - a.totalScore);

    // Log final sorted results
    console.log('\n=== Final Sorted Results ===');
    console.log('Top 5 Matches:');
    sortedMatches.slice(0, 5).forEach((match, index) => {
      console.log(`\n#${index + 1} Match:`);
      console.log({
        name: match.name,
        email: match.email,
        totalScore: match.totalScore,
        recommendation: match.recommendation.recommendation,
        insights: match.recommendation.insights
      });
    });

    return sortedMatches;
  } catch (error) {
    console.error('Error in resume matching:', error.message);
    throw error;
  }
}

module.exports = { matchResumesForJob }; 