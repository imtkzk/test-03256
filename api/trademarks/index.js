const { applications } = require('../_data/store');

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function calculateCost(classCount) {
  const applicationFee = 3400 + classCount * 8600;
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

module.exports = (req, res) => {
  if (req.method === 'GET') {
    const { status } = req.query;
    let results = [...applications];
    if (status) {
      results = results.filter((a) => a.status === status);
    }
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(results);
  }

  if (req.method === 'POST') {
    const { trademarkName, trademarkType, applicantName, applicantAddress, classes, description } = req.body;

    if (!trademarkName || !applicantName || !classes || classes.length === 0) {
      return res.status(400).json({ error: '必須項目を入力してください' });
    }

    const newApp = {
      id: generateId(),
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
    return res.status(201).json(newApp);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
