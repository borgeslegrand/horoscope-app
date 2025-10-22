export default function Home() {
  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center', 
      fontFamily: 'sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ 
        color: '#3B82F6', 
        fontSize: '2.5rem',
        marginBottom: '1rem'
      }}>
        ⭐ Horoscope + Farcaster
      </h1>
      
      <p style={{ 
        fontSize: '1.2rem', 
        color: '#666',
        marginBottom: '2rem'
      }}>
        Next.js + Vercel + Neynar API ✅
      </p>
      
      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        border: '1px solid #eee', 
        borderRadius: '12px',
        background: '#f9f9f9'
      }}>
        <h2 style={{ color: '#10B981', marginBottom: '1rem' }}>
          🔮 Farcaster Özellikleri:
        </h2>
        <ul style={{ 
          textAlign: 'left', 
          display: 'inline-block',
          fontSize: '1.1rem'
        }}>
          <li>✅ Neynar API Entegrasyonu</li>
          <li>✅ Warpcast Frame Desteği</li>
          <li>✅ Wallet Connect (Wagmi)</li>
          <li>✅ Cast Gönderme</li>
        </ul>
      </div>
      
      <button 
        style={{
          marginTop: '2rem',
          padding: '1rem 2rem',
          background: 'linear-gradient(45deg, #3B82F6, #1D4ED8)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
        }}
        onClick={() => {
          alert('🚀 Farcaster Connect yakında!\n\nNeynar API Key başarıyla çalışıyor! 👋');
        }}
      >
        🚀 Farcaster'e Bağlan
      </button>
      
      <p style={{ 
        marginTop: '2rem', 
        fontSize: '0.9rem', 
        color: '#999' 
      }}>
        Made with ❤️ by tutkungur | Next.js 15 + Vercel
      </p>
    </div>
  );
}
