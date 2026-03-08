const { niceClasses } = require('../_data/nice-classes');

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.query;
  if (!q) return res.json(niceClasses);

  const keyword = q.toLowerCase();
  const results = niceClasses.filter(
    (c) =>
      c.description.toLowerCase().includes(keyword) ||
      c.examples.toLowerCase().includes(keyword) ||
      c.name.includes(keyword)
  );
  res.json(results);
};
