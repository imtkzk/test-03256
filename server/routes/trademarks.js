const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { applications } = require('../data/store');
const { niceClasses } = require('../data/nice-classes');

const router = express.Router();

// ニース分類一覧を取得
router.get('/classes', (req, res) => {
  res.json(niceClasses);
});

// ニース分類をキーワードで検索
router.get('/classes/search', (req, res) => {
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
});

// 商標名の類似チェック（簡易）
router.get('/check', (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: '商標名を入力してください' });

  // 既存の出願との類似チェック
  const similar = applications.filter((app) => {
    const n = app.trademarkName.toLowerCase();
    const q = name.toLowerCase();
    return (
      n === q ||
      n.includes(q) ||
      q.includes(n) ||
      levenshtein(n, q) <= 2
    );
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
});

// 出願一覧
router.get('/', (req, res) => {
  const { status } = req.query;
  let results = [...applications];
  if (status) {
    results = results.filter((a) => a.status === status);
  }
  results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(results);
});

// 出願詳細
router.get('/:id', (req, res) => {
  const app = applications.find((a) => a.id === req.params.id);
  if (!app) return res.status(404).json({ error: '出願が見つかりません' });
  res.json(app);
});

// 新規出願
router.post('/', (req, res) => {
  const { trademarkName, trademarkType, applicantName, applicantAddress, classes, description } = req.body;

  if (!trademarkName || !applicantName || !classes || classes.length === 0) {
    return res.status(400).json({ error: '必須項目を入力してください' });
  }

  const newApp = {
    id: uuidv4(),
    trademarkName,
    trademarkType: trademarkType || '文字',
    applicantName,
    applicantAddress: applicantAddress || '',
    classes,
    description: description || '',
    status: 'draft',
    statusHistory: [
      { status: 'draft', date: new Date().toISOString(), note: '下書き作成' },
    ],
    estimatedCost: calculateCost(classes.length),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  applications.push(newApp);
  res.status(201).json(newApp);
});

// ステータス更新
router.patch('/:id/status', (req, res) => {
  const app = applications.find((a) => a.id === req.params.id);
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

  res.json(app);
});

// 出願削除
router.delete('/:id', (req, res) => {
  const idx = applications.findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: '出願が見つかりません' });
  applications.splice(idx, 1);
  res.json({ message: '削除しました' });
});

// 費用計算
function calculateCost(classCount) {
  // 特許庁への出願料: 3,400円 + (区分数 × 8,600円)
  const applicationFee = 3400 + classCount * 8600;
  // 登録料（10年分）: 区分数 × 32,900円
  const registrationFee = classCount * 32900;
  return {
    applicationFee,
    registrationFee,
    total: applicationFee + registrationFee,
    breakdown: {
      出願料基本料: 3400,
      '出願料区分加算': `${classCount}区分 × 8,600円 = ${(classCount * 8600).toLocaleString()}円`,
      '登録料（10年）': `${classCount}区分 × 32,900円 = ${(classCount * 32900).toLocaleString()}円`,
    },
  };
}

// レーベンシュタイン距離（簡易類似判定用）
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

module.exports = router;
