import React, { useRef, useEffect } from 'react';

const SHADER_ANIMATIONS = `
@keyframes shader-fade-in-down {
  from { opacity: 0; transform: translateY(-20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shader-fade-in-up {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shader-gradient-shift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.shader-fade-in-down   { animation: shader-fade-in-down 0.8s ease-out forwards; }
.shader-fade-in-up     { animation: shader-fade-in-up 0.8s ease-out forwards; opacity: 0; }
.shader-delay-200      { animation-delay: 0.2s; }
.shader-delay-400      { animation-delay: 0.4s; }
.shader-delay-600      { animation-delay: 0.6s; }
.shader-delay-800      { animation-delay: 0.8s; }
@keyframes shader-pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.7); }
}
.shader-pulse-dot      { animation: shader-pulse-dot 2s ease-in-out infinite; }
`;

const molecularShaderSource = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)
#define PI 3.14159265359

float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  f*=f*(3.-2.*f);
  return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),
             mix(h2(i+vec2(0,1)),h2(i+1.),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.,a=.5;
  for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.+vec2(3.7,1.9);a*=.5;}
  return v;
}

void main(){
  vec2 uv=(FC-.5*R)/MN;
  vec3 col=vec3(0.016,0.022,0.068);
  float nb=fbm(uv*1.2+T*.025);
  col+=vec3(0.,0.038,0.115)*nb*nb*3.5;
  col+=vec3(0.008,0.,0.07)*fbm(uv*2.4-T*.018)*.5;
  float freq=8.0;
  float amp=0.27;
  float scroll=T*0.35;
  float phase=uv.y*freq+scroll;
  float xs1=amp*sin(phase);
  float xs2=-xs1;
  float slope=amp*freq*cos(phase);
  float invLen=inversesqrt(1.+slope*slope);
  float dp1=abs(uv.x-xs1)*invLen;
  float dp2=abs(uv.x-xs2)*invLen;
  col+=vec3(0.,0.898,0.627)*0.0048/(dp1+0.007);
  col+=vec3(0.,0.702,1.0)*0.0048/(dp2+0.007);
  float nodeT=fract(phase*(3./PI));
  float nodeMask=smoothstep(.38,.0,abs(nodeT-.5));
  float dn1=length(uv-vec2(xs1,uv.y));
  float dn2=length(uv-vec2(xs2,uv.y));
  col+=vec3(0.35,1.,0.82)*nodeMask*0.008/(dn1*dn1+.0008);
  col+=vec3(0.25,0.78,1.)*nodeMask*0.008/(dn2*dn2+.0008);
  float bGlow=0.;
  for(float period=-3.;period<=3.;period++){
    for(float k=0.;k<6.;k++){
      float angle=k*(PI/3.);
      float bY=(angle+2.*PI*period-scroll)/freq;
      if(abs(bY-uv.y)>.44) continue;
      float bx1=amp*sin(angle);
      float bx2=-bx1;
      float lo=min(bx1,bx2),hi=max(bx1,bx2);
      float cx=clamp(uv.x,lo,hi);
      float bd=length(uv-vec2(cx,bY));
      bGlow+=.5/(bd*bd*900.+1.);
    }
  }
  col+=vec3(0.482,0.38,1.)*bGlow*.0022;
  for(float i=0.;i<12.;i++){
    vec2 pos=vec2(h2(vec2(i*17.3,1.)),h2(vec2(i*6.1,3.)))-.5;
    pos*=2.4;
    pos.x+=sin(T*.16+i*2.1)*.18;
    pos.y+=cos(T*.12+i*1.85)*.18;
    float d=length(uv-pos);
    vec3 beadCol=i<4. ? vec3(0.,0.898,0.627) : i<8. ? vec3(0.,0.702,1.) : vec3(0.482,0.38,1.);
    float pulse=.5+.5*sin(T*1.3+i*2.7);
    float r=.015+.006*pulse;
    col+=beadCol*.0018/(d*d+.001);
    col+=beadCol*.22*smoothstep(r,r*.5,d);
  }
  col*=1.-smoothstep(.48,1.08,length(uv));
  col=col/(1.+col*.8);
  col=pow(max(col,0.),vec3(.45));
  O=vec4(col,1.);
}`

function useShaderBackground() {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const glRef = useRef(null);
  const progRef = useRef(null);
  const bufRef = useRef(null);
  const mouseRef = useRef([0, 0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2');
    if (!gl) return;
    glRef.current = gl;

    const dpr = Math.max(1, 0.5 * window.devicePixelRatio);

    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();

    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(s));
      }
      return s;
    }

    const vs = compile(gl.VERTEX_SHADER, `#version 300 es\nprecision highp float;\nin vec4 position;\nvoid main(){gl_Position=position;}`);
    const fs = compile(gl.FRAGMENT_SHADER, molecularShaderSource);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    progRef.current = prog;

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,-1,-1,1,1,1,-1]), gl.STATIC_DRAW);
    bufRef.current = buf;

    const pos = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uRes  = gl.getUniformLocation(prog, 'resolution');
    const uTime = gl.getUniformLocation(prog, 'time');

    function loop(now) {
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, now * 1e-3);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animFrameRef.current = requestAnimationFrame(loop);
    }
    animFrameRef.current = requestAnimationFrame(loop);

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, []);

  return canvasRef;
}

export default function AnimatedShaderHero({
  id,
  trustBadge,
  headline = { line1: 'Optimize Your', line2: 'Peptide Stack.' },
  subtitle  = 'Build precision protocols, log every dose, and let AI surface the insights that reveal exactly how your peptide stack is performing.',
  buttons,
  tags,
  className = '',
}) {
  const canvasRef = useShaderBackground();

  return (
    <div id={id}
      style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: '#060810' }} className={className}>
      <style>{SHADER_ANIMATIONS}</style>

      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'none' }}
      />

      <div style={{
        position: 'absolute', inset: 0, zIndex: 10,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: '#fff', padding: '0 1.5rem',
      }}>
        {trustBadge && (
          <div className="shader-fade-in-down" style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '7px 18px',
              background: 'rgba(0,229,160,0.08)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(0,229,160,0.22)',
              borderRadius: '9999px',
              fontSize: '11px', fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: '#00E5A0',
            }}>
              <span className="shader-pulse-dot" style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: '#00E5A0', boxShadow: '0 0 8px #00E5A0', flexShrink: 0,
              }} />
              {trustBadge.icons?.map((icon, i) => <span key={i}>{icon}</span>)}
              <span>{trustBadge.text}</span>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', maxWidth: '64rem', margin: '0 auto' }}>
          <div>
            <h1 className="shader-fade-in-up shader-delay-200" style={{
              fontSize: 'clamp(2.5rem, 7vw, 5rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              background: 'linear-gradient(90deg, #00E5A0, #00B3FF, #00E5A0)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '0.25rem',
            }}>{headline.line1}</h1>
            <h1 className="shader-fade-in-up shader-delay-400" style={{
              fontSize: 'clamp(2.5rem, 7vw, 5rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              background: 'linear-gradient(90deg, #00B3FF, #00E5A0, #7B61FF)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>{headline.line2}</h1>
          </div>

          <p className="shader-fade-in-up shader-delay-600" style={{
            marginTop: '1.5rem',
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'rgba(192,203,223,0.9)',
            fontWeight: 300,
            lineHeight: 1.7,
            maxWidth: '48rem',
            margin: '1.5rem auto 0',
          }}>{subtitle}</p>

          {buttons && (
            <div className="shader-fade-in-up shader-delay-800" style={{
              display: 'flex', gap: '1rem', justifyContent: 'center',
              flexWrap: 'wrap', marginTop: '2.5rem',
            }}>
              {buttons.primary && (
                <a
                  href={buttons.primary.href}
                  onClick={buttons.primary.onClick}
                  className="btn btn-primary"
                  style={{ minWidth: '180px' }}
                >
                  <span>{buttons.primary.text}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </a>
              )}
              {buttons.secondary && (
                <a
                  href={buttons.secondary.href}
                  onClick={buttons.secondary.onClick}
                  className="btn btn-ghost"
                  style={{ minWidth: '160px' }}
                >
                  {buttons.secondary.text}
                </a>
              )}
            </div>
          )}

          {tags && tags.length > 0 && (
            <div
              className="shader-fade-in-up shader-delay-800"
              style={{
                display: 'flex', gap: '8px', justifyContent: 'center',
                flexWrap: 'wrap', marginTop: '1.75rem',
              }}
            >
              {tags.map((tag, i) => (
                <span key={i} className="tag-pill">
                  {tag.icon}
                  {tag.text}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <a
        href="#features"
        style={{
          position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
          color: 'rgba(192,203,223,0.5)', fontSize: '11px', fontWeight: 500,
          letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none',
          zIndex: 11,
        }}
        className="shader-fade-in-up shader-delay-800"
      >
        <span>Scroll to explore</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </a>
    </div>
  );
}
