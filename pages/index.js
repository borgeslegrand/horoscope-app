import { NeynarAPIClient } from '@neynar/nodejs-sdk';

export default function Home() {
  // Neynar API Client (Environment variable'dan çekecek)
  const neynar = new NeynarAPIClient(process.env.NEYNAR_API_KEY);

  return (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#3B82F6' }}>⭐ Horoscope + Farcaster</h1>
      <p>Next.js + Vercel + Neynar API ✅</p>
      
      <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px' }}>
        <h2>🔮 Farcaster Özellikleri:</h2>
        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
          <li>Neynar API Entegrasyonu</li>
          <li>Warpcast Frame Desteği</li>
          <li>Wallet Connect (Wagmi)</li>
          <li>Cast Gönderme</li>
        </ul>
      </div>
      
      <button 
        style={{
          marginTop: '1rem',
          padding: '0.75rem 1.5rem',
          background: '#3B82F6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
        onClick={() => alert('Farcaster Connect yakında! 👋')}
      >
        🚀 Farcaster'e Bağlan
      </button>
    </div>
  );
}
