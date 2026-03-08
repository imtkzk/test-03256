import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const trademarkTypes = [
  { value: '文字', label: '文字商標', desc: 'ブランド名やキャッチフレーズなど' },
  { value: '図形', label: '図形商標', desc: 'ロゴやマークなど' },
  { value: '文字+図形', label: '結合商標', desc: '文字とロゴの組み合わせ' },
  { value: '立体', label: '立体商標', desc: '商品の形状など' },
  { value: '音', label: '音商標', desc: 'ジングルやサウンドロゴ' },
];

export default function NewApplication() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [classes, setClasses] = useState([]);
  const [classSearch, setClassSearch] = useState('');
  const [allClasses, setAllClasses] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    trademarkName: '',
    trademarkType: '文字',
    applicantName: '',
    applicantAddress: '',
    description: '',
    selectedClasses: [],
  });

  useEffect(() => {
    fetch('/api/trademarks/classes')
      .then((res) => res.json())
      .then(setAllClasses)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!classSearch.trim()) {
      setClasses(allClasses);
      return;
    }
    const timeout = setTimeout(() => {
      fetch(`/api/trademarks/classes/search?q=${encodeURIComponent(classSearch)}`)
        .then((res) => res.json())
        .then(setClasses)
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timeout);
  }, [classSearch, allClasses]);

  const toggleClass = (id) => {
    setForm((prev) => ({
      ...prev,
      selectedClasses: prev.selectedClasses.includes(id)
        ? prev.selectedClasses.filter((c) => c !== id)
        : [...prev.selectedClasses, id],
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/trademarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trademarkName: form.trademarkName,
          trademarkType: form.trademarkType,
          applicantName: form.applicantName,
          applicantAddress: form.applicantAddress,
          description: form.description,
          classes: form.selectedClasses,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate(`/application/${data.id}`);
      } else {
        alert(data.error || 'エラーが発生しました');
      }
    } catch {
      alert('通信エラーが発生しました');
    } finally {
      setSubmitting(false);
    }
  };

  const estimatedCost = form.selectedClasses.length > 0
    ? {
        applicationFee: 3400 + form.selectedClasses.length * 8600,
        registrationFee: form.selectedClasses.length * 32900,
      }
    : null;

  const canProceedStep1 = form.trademarkName && form.trademarkType;
  const canProceedStep2 = form.selectedClasses.length > 0;
  const canProceedStep3 = form.applicantName;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>
        &#x270F;&#xFE0F; 新しい商標を出願する
      </h1>

      <div className="steps">
        {[
          { num: 1, label: '商標情報' },
          { num: 2, label: '区分えらび' },
          { num: 3, label: '出願人情報' },
          { num: 4, label: '確認＆提出' },
        ].map((s) => (
          <div
            key={s.num}
            className={`step ${step === s.num ? 'active' : step > s.num ? 'completed' : ''}`}
          >
            <div className="step-number">{step > s.num ? '\u2713' : s.num}</div>
            {s.label}
          </div>
        ))}
      </div>

      <div className="card">
        {/* Step 1: 商標情報 */}
        {step === 1 && (
          <div>
            <div className="card-header">
              <div className="card-icon" style={{ background: 'var(--primary-light)' }}>&#x1F3F7;&#xFE0F;</div>
              <div>
                <div className="card-title">商標の情報を入力しよう</div>
                <div className="card-subtitle">登録したいブランド名やロゴの情報を教えてね</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                商標名<span className="required">*必須</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="例：トレマル"
                value={form.trademarkName}
                onChange={(e) => setForm({ ...form, trademarkName: e.target.value })}
              />
              <div className="form-hint">登録したいブランド名・サービス名を入力</div>
            </div>

            <div className="form-group">
              <label className="form-label">商標のタイプ</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {trademarkTypes.map((t) => (
                  <label
                    key={t.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      border: `2px solid ${form.trademarkType === t.value ? 'var(--primary)' : 'var(--gray-200)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      background: form.trademarkType === t.value ? 'var(--primary-light)' : 'white',
                      transition: 'all 0.2s',
                    }}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={t.value}
                      checked={form.trademarkType === t.value}
                      onChange={(e) => setForm({ ...form, trademarkType: e.target.value })}
                      style={{ display: 'none' }}
                    />
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: `2px solid ${form.trademarkType === t.value ? 'var(--primary)' : 'var(--gray-300)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {form.trademarkType === t.value && (
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{t.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{t.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">補足説明</label>
              <textarea
                className="form-textarea"
                placeholder="商標の使い方や特徴があれば教えてね（任意）"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn btn-primary" disabled={!canProceedStep1} onClick={() => setStep(2)}>
                次へ進む
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 区分選択 */}
        {step === 2 && (
          <div>
            <div className="card-header">
              <div className="card-icon" style={{ background: 'var(--accent-light)' }}>&#x1F4C2;</div>
              <div>
                <div className="card-title">区分をえらぼう</div>
                <div className="card-subtitle">商標を使う商品・サービスの分野をえらんでね</div>
              </div>
            </div>

            <div className="form-group">
              <div className="search-box">
                <span className="search-icon">&#x1F50D;</span>
                <input
                  type="text"
                  className="form-input"
                  placeholder="キーワードで区分を絞り込み..."
                  value={classSearch}
                  onChange={(e) => setClassSearch(e.target.value)}
                />
              </div>
            </div>

            {form.selectedClasses.length > 0 && (
              <div className="mb-16" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <span className="text-sm" style={{ fontWeight: 600, marginRight: 4 }}>選択中：</span>
                {form.selectedClasses.map((id) => {
                  const cls = allClasses.find((c) => c.id === id);
                  return (
                    <span key={id} className="badge badge-submitted" style={{ cursor: 'pointer' }} onClick={() => toggleClass(id)}>
                      {cls ? cls.name : `第${id}類`} &times;
                    </span>
                  );
                })}
              </div>
            )}

            <div className="class-grid">
              {classes.map((c) => (
                <div
                  key={c.id}
                  className={`class-chip ${form.selectedClasses.includes(c.id) ? 'selected' : ''}`}
                  onClick={() => toggleClass(c.id)}
                >
                  <span className="class-chip-id">{c.name}</span>
                  <span>{c.description}</span>
                </div>
              ))}
            </div>

            {estimatedCost && (
              <div className="cost-card mt-24">
                <div style={{ fontWeight: 600, fontSize: 14 }}>&#x1F4B0; 費用の目安</div>
                <div className="cost-total">
                  &yen;{(estimatedCost.applicationFee + estimatedCost.registrationFee).toLocaleString()}
                </div>
                <div className="cost-breakdown">
                  <dt>出願料</dt>
                  <dd>&yen;{estimatedCost.applicationFee.toLocaleString()}</dd>
                  <dt>登録料（10年分）</dt>
                  <dd>&yen;{estimatedCost.registrationFee.toLocaleString()}</dd>
                </div>
                <div className="form-hint mt-8">※ 特許庁に納付する費用の目安です</div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>もどる</button>
              <button className="btn btn-primary" disabled={!canProceedStep2} onClick={() => setStep(3)}>
                次へ進む
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 出願人情報 */}
        {step === 3 && (
          <div>
            <div className="card-header">
              <div className="card-icon" style={{ background: 'var(--success-light)' }}>&#x1F464;</div>
              <div>
                <div className="card-title">出願人の情報を入力しよう</div>
                <div className="card-subtitle">商標の権利者になる方の情報です</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                出願人名<span className="required">*必須</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="例：山田太郎 / 株式会社トレマル"
                value={form.applicantName}
                onChange={(e) => setForm({ ...form, applicantName: e.target.value })}
              />
              <div className="form-hint">個人名または法人名を入力</div>
            </div>

            <div className="form-group">
              <label className="form-label">住所</label>
              <input
                type="text"
                className="form-input"
                placeholder="例：東京都千代田区..."
                value={form.applicantAddress}
                onChange={(e) => setForm({ ...form, applicantAddress: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <button className="btn btn-secondary" onClick={() => setStep(2)}>もどる</button>
              <button className="btn btn-primary" disabled={!canProceedStep3} onClick={() => setStep(4)}>
                確認画面へ
              </button>
            </div>
          </div>
        )}

        {/* Step 4: 確認 */}
        {step === 4 && (
          <div>
            <div className="card-header">
              <div className="card-icon" style={{ background: 'var(--secondary-light)' }}>&#x2705;</div>
              <div>
                <div className="card-title">内容を確認しよう</div>
                <div className="card-subtitle">入力内容に間違いがないかチェックしてね</div>
              </div>
            </div>

            <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 20 }}>
              <table style={{ width: '100%', fontSize: 14 }}>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600, padding: '8px 0', verticalAlign: 'top', width: 120, color: 'var(--gray-600)' }}>商標名</td>
                    <td style={{ padding: '8px 0', fontWeight: 700, fontSize: 16 }}>{form.trademarkName}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, padding: '8px 0', color: 'var(--gray-600)' }}>タイプ</td>
                    <td style={{ padding: '8px 0' }}>{form.trademarkType}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, padding: '8px 0', verticalAlign: 'top', color: 'var(--gray-600)' }}>区分</td>
                    <td style={{ padding: '8px 0' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {form.selectedClasses.map((id) => {
                          const cls = allClasses.find((c) => c.id === id);
                          return (
                            <span key={id} className="badge badge-submitted">
                              {cls ? `${cls.name} ${cls.description}` : `第${id}類`}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, padding: '8px 0', color: 'var(--gray-600)' }}>出願人名</td>
                    <td style={{ padding: '8px 0' }}>{form.applicantName}</td>
                  </tr>
                  {form.applicantAddress && (
                    <tr>
                      <td style={{ fontWeight: 600, padding: '8px 0', color: 'var(--gray-600)' }}>住所</td>
                      <td style={{ padding: '8px 0' }}>{form.applicantAddress}</td>
                    </tr>
                  )}
                  {form.description && (
                    <tr>
                      <td style={{ fontWeight: 600, padding: '8px 0', verticalAlign: 'top', color: 'var(--gray-600)' }}>補足説明</td>
                      <td style={{ padding: '8px 0' }}>{form.description}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {estimatedCost && (
              <div className="cost-card mb-24">
                <div style={{ fontWeight: 600, fontSize: 14 }}>&#x1F4B0; 費用の目安</div>
                <div className="cost-total">
                  &yen;{(estimatedCost.applicationFee + estimatedCost.registrationFee).toLocaleString()}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={() => setStep(3)}>もどる</button>
              <button className="btn btn-success btn-lg" disabled={submitting} onClick={handleSubmit}>
                {submitting ? '送信中...' : '出願を提出する'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
