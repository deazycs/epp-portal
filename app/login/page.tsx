'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LOGIN_USERS } from '@/mock/data/users';

const AVATAR_COLORS: Record<string, string> = {
  u_shv: '#1d4ed8',
  u_che: '#15803d',
  u_tol: '#7e22ce',
  u_pik: '#b45309',
};

const AVATARS: Record<string, string> = {
  u_shv: 'ШК',
  u_che: 'ЧМ',
  u_tol: 'ТЮ',
  u_pik: 'ПО',
};

export default function LoginPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (userId: string) => {
    setSelected(userId);
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    router.push('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(160deg, #00112e 0%, #001e5e 45%, #003087 100%)',
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
    }}>

      {/* Верхняя полоса */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '12px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>РР</span>
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>Росреестр</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>Управление по Воронежской области</div>
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Внутренняя система · v3.0 · 2026</div>
        </div>
      </div>

      {/* Основной контент */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 680 }}>

          {/* Логотип */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: 'rgba(255,255,255,0.1)',
              border: '1.5px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}>
              <span style={{ color: '#fff', fontSize: 22, fontWeight: 900, letterSpacing: -1 }}>ЕПП</span>
            </div>
            <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, margin: '0 0 8px', letterSpacing: -0.5 }}>
              Единый портал поставок
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>
              Система сопровождения закупок · Выберите учётную запись
            </p>
          </div>

          {/* Карточки */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
            {LOGIN_USERS.map(u => {
              const isSelected = selected === u.userId;
              const isLoading  = loading && isSelected;
              return (
                <button
                  key={u.userId}
                  onClick={() => handleLogin(u.userId)}
                  disabled={loading}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '16px', borderRadius: 14, textAlign: 'left',
                    border: `1.5px solid ${isSelected ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.12)'}`,
                    background: isSelected ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.05)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading && !isSelected ? 0.45 : 1,
                    transition: 'all 0.18s',
                    boxShadow: isSelected ? '0 0 0 3px rgba(77,159,255,0.35)' : 'none',
                  }}
                  onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = isSelected ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.05)'; }}
                >
                  {/* Аватар */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: AVATAR_COLORS[u.userId] ?? '#1d4ed8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}>
                    {isLoading
                      ? <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
                      : <span style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>{AVATARS[u.userId] ?? '??'}</span>
                    }
                  </div>

                  {/* Текст */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, lineHeight: 1.3, marginBottom: 2 }}>{u.name}</div>
                    <div style={{ color: 'rgba(147,197,253,0.9)', fontSize: 11, marginBottom: 4 }}>{u.role}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, lineHeight: 1.4 }}>{u.desc}</div>
                  </div>

                  {/* Стрелка */}
                  <div style={{ color: 'rgba(255,255,255,0.3)', marginTop: 2, flexShrink: 0, fontSize: 16 }}>›</div>
                </button>
              );
            })}
          </div>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.28)', fontSize: 11 }}>
            Нажмите на карточку для входа · Демонстрационный режим · Пароль не требуется
          </p>
        </div>
      </div>

      {/* Нижняя полоса */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '10px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>ЕПП v3.0 · © Росреестр 2026</span>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>г. Воронеж, ул. Средне-Московская, д. 14</span>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
