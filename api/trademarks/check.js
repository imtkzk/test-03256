const { applications } = require('../_data/store');

function levenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      matrix[i][j] =
        a[i - 1] === b[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j]) + 1;
    }
  }
  return matrix[a.length][b.length];
}

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name } = req.query;
  if (!name) return res.status(400).json({ error: '商標名を入力してください' });

  const similar = applications.filter((app) => {
    const n = app.trademarkName.toLowerCase();
    const q = name.toLowerCase();
    return n === q || n.includes(q) || q.includes(n) || levenshtein(n, q) <= 2;
  });

  res.json({
    query: name,
    hasSimilar: similar.length > 0,
    similar: similar.map((a) => ({
      id: a.id,
      name: a.trademarkName,
      classes: a.classes,
      status: a.status,
    })),
    message:
      similar.length > 0
        ? `「${name}」に類似する商標が ${similar.length} 件見つかりました`
        : `「${name}」に類似する商標は見つかりませんでした`,
  });
};
