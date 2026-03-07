import React, { useRef, useEffect } from 'react';

const SHADER_ANIMATIONS = `
@keyframes fade-in-down {
  from { opacity: 0; transform: translateY(-20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes gradient-shift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.shader-fade-in-down   { animation: fade-in-down 0.8s ease-out forwards; }
.shader-fade-in-up     { animation: fade-in-up 0.8s ease-out forwards; opacity: 0; }
.shader-delay-200      { animation-delay: 0.2s; }
.shader-delay-400      { animation-delay: 0.4s; }
.shader-delay-600      { animation-delay: 0.6s; }
.shader-delay-800      { animation-delay: 0.8s; }
`;

const defaultShaderSource = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)
float rnd(vec2 p){p=fract(p*vec2(12.9898,78.233));p+=dot(p,p+34.56);return fract(p.x*p.y);}
float noise(in vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);float a=rnd(i),b=rnd(i+vec2(1,0)),c=rnd(i+vec2(0,1)),d=rnd(i+1.);return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
float fbm(vec2 p){float t=.0,a=1.;mat2 m=mat2(1.,-.5,.2,1.2);for(int i=0;i<5;i++){t+=a*noise(p);p*=2.*m;a*=.5;}return t;}
float clouds(vec2 p){float d=1.,t=.0;for(float i=.0;i<3.;i++){float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);t=mix(t,d,a);d=a;p*=2./(i+1.);}return t;}
void main(void){
  vec2 uv=(FC-.5*R)/MN,st=uv*vec2(2,1);
  vec3 col=vec3(0);
  float bg=clouds(vec2(st.x+T*.5,-st.y));
  uv*=1.-.3*(sin(T*.2)*.5+.5);
  for(float i=1.;i<12.;i++){
    uv+=.1*cos(i*vec2(.1+.01*i,.8)+i*i+T*.5+.1*uv.x);
    vec2 p=uv;float d=length(p);
    col+=.00125/d*(cos(sin(i)*vec3(1,2,3))+1.);
    float b=noise(i+p+bg*1.731);
    col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)));
    col=mix(col,vec3(bg*.25,bg*.137,bg*.05),d);
  }
  O=vec4(col,1);
}`;

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
    const fs = compile(gl.FRAGMENT_SHADER, defaultShaderSource);
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
  trustBadge,
  headline = { line1: 'Optimize Your', line2: 'Peptide Stack.' },
  subtitle = 'Build protocols, track doses, and let AI surface the insights that show exactly how your stack is performing.',
  buttons,
  className = '',
}) {
  const canvasRef = useShaderBackground();

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: '#000' }} className={className}>
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
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'rgba(0,229,160,0.08)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(0,229,160,0.25)',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              color: 'rgba(238,242,255,0.9)',
            }}>
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
                <button onClick={buttons.primary.onClick} className="btn btn-primary" style={{ minWidth: '180px' }}>
                  {buttons.primary.text}
                </button>
              )}
              {buttons.secondary && (
                <button onClick={buttons.secondary.onClick} className="btn btn-ghost" style={{ minWidth: '160px' }}>
                  {buttons.secondary.text}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
