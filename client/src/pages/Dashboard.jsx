import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const statusLabels = {
  draft: '下書き',
  reviewing: '確認中',
  submitted: '出願済み',
  examining: '審査中',
  published: '公開中',
  registered: '登録完了',
  rejected: '拒絶',
};

export default function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/trademarks')
      .then((res) => res.json())
      .then((data) => {
        setApplications(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const stats = {
    total: applications.length,
    drafts: applications.filter((a) => a.status === 'draft').length,
    inProgress: applications.filter((a) => ['reviewing', 'submitted', 'examining', 'published'].includes(a.status)).length,
    registered: applications.filter((a) => a.status === 'registered').length,
  };

  return (
    <div>
      <div className="hero">
        <h1 className="hero-title">
          あなたのブランドを
          <br />
          <span className="highlight">かんたんに守ろう</span>
        </h1>
        <p className="hero-desc">
          商標登録の手続きをステップバイステップでサポート。
          むずかしい手続きも、トレマルと一緒なら安心です。
        </p>
        <Link to="/new" className="btn btn-primary btn-lg">
          新しく出願をはじめる
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number" style={{ color: 'var(--primary)' }}>{stats.total}</div>
          <div className="stat-label">すべての出願</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: 'var(--gray-500)' }}>{stats.drafts}</div>
          <div className="stat-label">下書き</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: 'var(--accent)' }}>{stats.inProgress}</div>
          <div className="stat-label">手続き中</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: 'var(--success)' }}>{stats.registered}</div>
          <div className="stat-label">登録完了</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'var(--primary-light)' }}>
            <span role="img" aria-label="リスト">&#x1F4CB;</span>
          </div>
          <div>
            <div className="card-title">出願リスト</div>
            <div className="card-subtitle">あなたの商標出願を管理</div>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray" style={{ padding: 40 }}>読み込み中...</div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">&#x1F331;</div>
            <div className="empty-state-title">まだ出願がありません</div>
            <div className="empty-state-text">
              「新しく出願をはじめる」ボタンから、最初の商標を登録してみましょう！
            </div>
            <Link to="/new" className="btn btn-primary">出願をはじめる</Link>
          </div>
        ) : (
          <div className="app-list">
            {applications.map((app) => (
              <Link key={app.id} to={`/application/${app.id}`} className="app-list-item">
                <div className="app-list-item-info">
                  <div className="app-list-item-name">{app.trademarkName}</div>
                  <div className="app-list-item-meta">
                    <span>{app.trademarkType}</span>
                    <span>{app.classes.length}区分</span>
                    <span>{new Date(app.createdAt).toLocaleDateString('ja-JP')}</span>
                  </div>
                </div>
                <span className={`badge badge-${app.status}`}>
                  {statusLabels[app.status] || app.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
