export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '2rem', 
      textAlign: 'center',
      fontFamily: 'system-ui, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <h1 style={{ 
        fontSize: '4rem', 
        marginBottom: '1rem',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
      }}>
        🌟 Horoscope App
      </h1>
      <p style={{ 
        fontSize: '1.8rem', 
        marginBottom: '3rem',
        opacity: 0.9
      }}>
        ✅ Next.js + Vercel Başarılı!
      </p>
      
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '2rem',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
          🚀 Yakında:
        </h2>
        <ul style={{ textAlign: 'left', fontSize: '1.2rem' }}>
          <li>🔮 Günlük Burç Yorumu</li>
          <li>⭐ Farcaster Frame</li>
          <li>💰 Wallet Connect</li>
          <li>📱 Warpcast Mini App</li>
        </ul>
      </div>
      
      <p style={{ 
        marginTop: '3rem', 
        fontSize: '1rem', 
        opacity: 0.8 
      }}>
        Made with ❤️ by tutkungur
      </p>
    </div>
  );
}
