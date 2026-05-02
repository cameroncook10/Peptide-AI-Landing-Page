export default function IPhoneFrame({ src, alt = '', width = 300, className = '', style = {} }) {
  const ratio = 1083 / 500;
  const h = Math.round(width * ratio);
  const pad = Math.round(width * 0.023);
  const br = Math.round(width * 0.148);
  const ibr = Math.max(0, br - pad);
  const diW = Math.round(width * 0.33);
  const diH = Math.max(26, Math.round(width * 0.09));
  const camSize = Math.max(8, Math.round(width * 0.03));

  const lBtn = (top, height) => ({
    position: 'absolute', left: -3, top: Math.round(h * top),
    width: 3, height: Math.round(h * height), borderRadius: '2px 0 0 2px',
    background: 'linear-gradient(to right, #525254, #3e3e40 35%, #2e2e30 65%, #3c3c3e)',
    boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.09), inset 0 -0.5px 0 rgba(0,0,0,0.5)',
    zIndex: 2,
  });

  return (
    <div className={className} style={{ position: 'relative', width, height: h, flexShrink: 0, ...style }}>

      {/* Action button */}
      <div style={lBtn(0.105, 0.053)} />
      {/* Volume up */}
      <div style={lBtn(0.19, 0.098)} />
      {/* Volume down */}
      <div style={lBtn(0.305, 0.098)} />

      {/* Power button */}
      <div style={{
        position: 'absolute', right: -3, top: Math.round(h * 0.235),
        width: 3, height: Math.round(h * 0.12), borderRadius: '0 2px 2px 0',
        background: 'linear-gradient(to left, #525254, #3e3e40 35%, #2e2e30 65%, #3c3c3e)',
        boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.09), inset 0 -0.5px 0 rgba(0,0,0,0.5)',
        zIndex: 2,
      }} />

      {/* Titanium chassis */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: br, padding: pad,
        background: `linear-gradient(
          150deg,
          #606062 0%, #444446 7%, #303032 16%,
          #1e1e20 30%, #222224 46%, #2c2c2e 60%,
          #3c3c3e 74%, #4e4e50 87%, #5c5c5e 100%
        )`,
        boxShadow: [
          'inset 0 0 0 0.5px rgba(255,255,255,0.065)',
          'inset 0 1.5px 0 rgba(255,255,255,0.1)',
          'inset 0 -1px 0 rgba(0,0,0,0.6)',
          '0 0 0 0.5px rgba(0,0,0,0.9)',
          '0 40px 80px -18px rgba(0,0,0,0.75)',
          '0 14px 40px -8px rgba(0,0,0,0.45)',
          '0 0 50px -8px rgba(45,216,132,0.15)',
        ].join(', '),
      }}>

        {/* OLED screen */}
        <div style={{
          width: '100%', height: '100%', borderRadius: ibr,
          background: '#000', overflow: 'hidden', position: 'relative',
          boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.04)',
        }}>

          {/* Dynamic Island */}
          <div style={{
            position: 'absolute', top: 9, left: '50%', transform: 'translateX(-50%)',
            width: diW, height: diH, background: '#000', borderRadius: 999,
            zIndex: 10, display: 'flex', alignItems: 'center',
            justifyContent: 'flex-end', paddingRight: 8,
            boxShadow: '0 0 0 0.5px rgba(255,255,255,0.03)',
          }}>
            <div style={{
              width: camSize, height: camSize, borderRadius: '50%',
              background: '#070707', border: '1px solid #141414', position: 'relative',
            }}>
              <div style={{
                position: 'absolute', inset: 1, borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #162030, #020202 70%)',
              }} />
            </div>
          </div>

          {/* App screenshot */}
          {src && (
            <img src={src} alt={alt} draggable={false} style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'top center', display: 'block',
            }} />
          )}

          {/* Home indicator */}
          <div style={{
            position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
            width: '32%', height: 4, borderRadius: 4,
            background: 'rgba(255,255,255,0.18)', zIndex: 10,
          }} />

          {/* Glass sheen */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5,
            borderRadius: 'inherit',
            background: 'linear-gradient(165deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 25%, transparent 55%)',
          }} />
        </div>

        {/* Top edge glint */}
        <div style={{
          position: 'absolute', top: 0, left: '18%', right: '18%', height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
          borderRadius: br, pointerEvents: 'none',
        }} />

      </div>
    </div>
  );
}
