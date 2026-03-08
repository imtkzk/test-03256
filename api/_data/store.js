// In-memory store (resets on cold start - use a database for production)
// Vercel serverless functions share this module within the same instance
const applications = [];

module.exports = { applications };
