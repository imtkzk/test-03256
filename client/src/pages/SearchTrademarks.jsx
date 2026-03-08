import React, { useState } from 'react';

export default function SearchTrademarks() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/trademarks/check?name=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: '検索中にエラーが発生しました' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 className="hero-title" style={{ fontSize: 24, marginBottom: 8 }}>
          &#x1F50D; 商標かんたん検索
        </h1>
        <p className="text-gray">登録したい商標名がすでに使われていないかチェックしよう</p>
      </div>

      <div className="card">
        <form onSubmit={handleSearch}>
          <div className="form-group">
            <label className="form-label">商標名を入力してね</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <input
                type="text"
                className="form-input"
                placeholder="例：トレマル、スマイルカフェ..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '検索中...' : '検索する'}
              </button>
            </div>
          </div>
        </form>

        {result && !result.error && (
          <div className="mt-24">
            <div
              className="card"
              style={{
                background: result.hasSimilar ? 'var(--danger-light)' : 'var(--success-light)',
                border: `2px solid ${result.hasSimilar ? 'var(--danger)' : 'var(--success)'}`,
              }}
            >
              <div style={{ textAlign: 'center', padding: 16 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>
                  {result.hasSimilar ? <>&#x26A0;&#xFE0F;</> : <>&#x2705;</>}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                  {result.hasSimilar
                    ? '類似する商標が見つかりました'
                    : '類似する商標は見つかりませんでした！'}
                </div>
                <p className="text-sm text-gray">{result.message}</p>
              </div>

              {result.similar && result.similar.length > 0 && (
                <div className="mt-16">
                  <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>類似商標一覧</h3>
                  {result.similar.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        padding: '10px 14px',
                        background: 'white',
                        borderRadius: 8,
                        marginBottom: 8,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{s.name}</span>
                      <span className={`badge badge-${s.status}`}>{s.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!result.hasSimilar && (
              <div className="text-center mt-24">
                <a href="/new" className="btn btn-primary btn-lg">
                  この商標で出願をはじめる
                </a>
              </div>
            )}
          </div>
        )}

        {result && result.error && (
          <div className="mt-24 text-center" style={{ color: 'var(--danger)' }}>
            {result.error}
          </div>
        )}
      </div>
    </div>
  );
}
