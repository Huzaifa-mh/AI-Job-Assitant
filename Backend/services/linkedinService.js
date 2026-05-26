const axios = require('axios');
require('dotenv').config();

const fetchLinkedInJobs = async (query, country = 'Pakistan', date_posted = 'week', employment_types = 'FULLTIME', page = 1) => {
  const options = {
    method: 'GET',
    url: 'https://jsearch.p.rapidapi.com/search-v2',
    params: {
      query,
      country,
      date_posted,
      employment_types,
      page: String(page),
    },
    headers: {
      'x-rapidapi-host': process.env.RAPIDAPI_HOST,
      'x-rapidapi-key':  process.env.RAPIDAPI_KEY,
    },
  };

  const response = await axios.request(options);

  console.log(response.data);

  // RapidAPI returns different shapes — normalize it
  const raw = response.data;
  const jobs = raw?.data?.jobs || [];

  return jobs.map(job => ({
    title:       job.title        || job.job_title        || 'N/A',
    company:     job.company      || job.employer_name    || 'N/A',
    location:    job.location     || job.job_city         || job.job_country     || 'Remote',
    description: job.description  || job.job_description  || job.description_text || 'No description provided.',
    job_url:     job.job_url      || job.apply_url        || job.job_apply_link || '',
    source:      job.job_publisher || 'unknown',
  }));
};

module.exports = { fetchLinkedInJobs };