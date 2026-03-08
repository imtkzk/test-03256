import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const statusLabels = {
  draft: '下書き',
  reviewing: '確認中',
  submitted: '出願済み',
  examining: '審査中',
  published: '公開中',
  registered: '登録完了',
  rejected: '拒絶',
};

const statusFlow = ['draft', 'reviewing', 'submitted', 'examining', 'published', 'registered'];

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchApp = () => {
    fetch(`/api/trademarks/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then((data) => {
        setApp(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchApp();
  }, [id]);

  const advanceStatus = async () => {
    const currentIdx = statusFlow.indexOf(app.status);
    if (currentIdx < 0 || currentIdx >= statusFlow.length - 1) return;
    const nextStatus = statusFlow[currentIdx + 1];

    const res = await fetch(`/api/trademarks/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus, note: `${statusLabels[nextStatus]}に更新` }),
    });
    if (res.ok) fetchApp();
  };

  const handleDelete = async () => {
    if (!window.confirm('この出願を削除してもよいですか？')) return;
    const res = await fetch(`/api/trademarks/${id}`, { method: 'DELETE' });
    if (res.ok) navigate('/');
  };

  if (loading) {
    return <div className="text-center text-gray" style={{ padding: 60 }}>読み込み中...</div>;
  }

  if (!app) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">&#x1F62E;</div>
        <div className="empty-state-title">出願が見つかりません</div>
        <Link to="/" className="btn btn-primary mt-16">ホームにもどる</Link>
      </div>
    );
  }

  const currentIdx = statusFlow.indexOf(app.status);

  return (
    <div>
      <Link to="/" className="btn btn-secondary btn-sm mb-24">&#x2190; ホームにもどる</Link>

      <div className="card mb-24">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>{app.trademarkName}</h1>
            <div className="text-sm text-gray">
              {app.trademarkType} ・ {app.classes.length}区分 ・ {new Date(app.createdAt).toLocaleDateString('ja-JP')} 作成
            </div>
          </div>
          <span className={`badge badge-${app.status}`} style={{ fontSize: 14, padding: '6px 16px' }}>
            {statusLabels[app.status] || app.status}
          </span>
        </div>

        {/* ステータスプログレス */}
        <div style={{ margin: '28px 0', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {statusFlow.map((s, i) => (
            <div
              key={s}
              style={{
                flex: 1,
                minWidth: 60,
                padding: '8px 4px',
                textAlign: 'center',
                fontSize: 11,
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                background:
                  i <= currentIdx
                    ? app.status === 'registered'
                      ? 'var(--success)'
                      : 'var(--primary)'
                    : 'var(--gray-100)',
                color: i <= currentIdx ? 'white' : 'var(--gray-400)',
                transition: 'all 0.3s',
              }}
            >
              {statusLabels[s]}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {app.status !== 'registered' && app.status !== 'rejected' && (
            <button className="btn btn-primary btn-sm" onClick={advanceStatus}>
              次のステップへ進める
            </button>
          )}
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>
            削除する
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {/* 出願人情報 */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: 'var(--accent-light)' }}>&#x1F464;</div>
            <div className="card-title">出願人情報</div>
          </div>
          <div style={{ fontSize: 14 }}>
            <div style={{ marginBottom: 8 }}>
              <span className="text-gray">出願人名：</span>
              <strong>{app.applicantName}</strong>
            </div>
            {app.applicantAddress && (
              <div style={{ marginBottom: 8 }}>
                <span className="text-gray">住所：</span>
                {app.applicantAddress}
              </div>
            )}
            {app.description && (
              <div>
                <span className="text-gray">補足：</span>
                {app.description}
              </div>
            )}
          </div>
        </div>

        {/* 費用情報 */}
        {app.estimatedCost && (
          <div className="card">
            <div className="card-header">
              <div className="card-icon" style={{ background: 'var(--secondary-light)' }}>&#x1F4B0;</div>
              <div className="card-title">費用の目安</div>
            </div>
            <div className="cost-total" style={{ fontSize: 24 }}>
              &yen;{app.estimatedCost.total.toLocaleString()}
            </div>
            <div className="cost-breakdown">
              <dt>出願料</dt>
              <dd>&yen;{app.estimatedCost.applicationFee.toLocaleString()}</dd>
              <dt>登録料（10年分）</dt>
              <dd>&yen;{app.estimatedCost.registrationFee.toLocaleString()}</dd>
            </div>
          </div>
        )}
      </div>

      {/* 更新履歴 */}
      <div className="card mt-16">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'var(--primary-light)' }}>&#x1F4DD;</div>
          <div className="card-title">更新履歴</div>
        </div>
        <div className="timeline">
          {[...app.statusHistory].reverse().map((h, i) => (
            <div key={i} className="timeline-item">
              <div className="timeline-date">{new Date(h.date).toLocaleString('ja-JP')}</div>
              <div className="timeline-text">
                <span className={`badge badge-${h.status}`} style={{ marginRight: 8 }}>
                  {statusLabels[h.status] || h.status}
                </span>
                {h.note}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
