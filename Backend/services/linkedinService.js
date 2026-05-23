const axios = require('axios');
require('dotenv').config();

const fetchLinkedInJobs = async (keyword = 'freelance', location = '', limit = 10) =>{
    const options = {
        method: 'GET',
        url: 'https://linkedin-job-search-api.p.rapidapi.com/active-jd',
        params: {
            keyword,
            location,
            limit: String(limit),
        },
        headers:{
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': process.env.RAPIDAPI_HOST,
        },
    };

    //to fetch data from RapidAPI
    const response = await axios.request(options);

    // RapidAPI returns different shapes — normalize it
    const raw = response.data;
    const jobs = Array.isArray(raw) ? raw : raw?.data ??  raw?.jobs ?? [];

    return jobs.map( job => ({
        title: job.title || job.job_title || 'N/A',
        company: job.company || job.company_name || 'N/A',
        location: job.location || job.job_location || 'Remote',
        description: job.description || job.job_description || '',
        job_url: job.job_url || job.apply_url || job.url || '',

    }));
};

module.exports = { fetchLinkedInJobs };