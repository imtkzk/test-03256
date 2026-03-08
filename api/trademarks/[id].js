const { applications } = require('../_data/store');

const statusLabels = {
  draft: '下書き',
  reviewing: '確認中',
  submitted: '出願済み',
  examining: '審査中',
  published: '公開中',
  registered: '登録完了',
  rejected: '拒絶',
};

module.exports = (req, res) => {
  const { id } = req.query;
  const app = applications.find((a) => a.id === id);

  if (req.method === 'GET') {
    if (!app) return res.status(404).json({ error: '出願が見つかりません' });
    return res.json(app);
  }

  if (req.method === 'DELETE') {
    const idx = applications.findIndex((a) => a.id === id);
    if (idx === -1) return res.status(404).json({ error: '出願が見つかりません' });
    applications.splice(idx, 1);
    return res.json({ message: '削除しました' });
  }

  if (req.method === 'PATCH') {
    if (!app) return res.status(404).json({ error: '出願が見つかりません' });

    const { status, note } = req.body;
    const validStatuses = ['draft', 'reviewing', 'submitted', 'examining', 'published', 'registered', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: '無効なステータスです' });
    }

    app.status = status;
    app.statusHistory.push({
      status,
      date: new Date().toISOString(),
      note: note || '',
    });
    app.updatedAt = new Date().toISOString();

    return res.json(app);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
