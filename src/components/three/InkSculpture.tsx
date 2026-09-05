import { Suspense, lazy, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "@/lib/sceneState";
import { useIsTouch, useReducedMotion } from "@/hooks/useMedia";

/* ------------------------------------------------------------------ */
/* Shaders                                                             */
/* ------------------------------------------------------------------ */

const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const VERT = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uHover;
uniform vec2 uMouse;
varying vec3 vPos;
varying float vDisp;
${NOISE}
void main(){
  vec3 p = position;
  float t = uTime * 0.16;
  float n1 = snoise(p * 1.05 + t);
  float n2 = snoise(p * 2.4 - t * 1.3) * 0.38;
  float n3 = snoise(p * 5.5 + t * 0.5) * 0.09 * (0.5 + uMorph);
  float disp = (n1 + n2 + n3) * (0.20 + uMorph * 0.42);
  // cursor pressure: a soft dent that follows the pointer
  vec3 dir = normalize(p);
  float m = smoothstep(1.1, 0.0, distance(dir.xy, uMouse * 0.9));
  disp -= m * 0.16 * uHover;
  vec3 np = p + normal * disp;
  vDisp = disp;
  vec4 world = modelMatrix * vec4(np, 1.0);
  vPos = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

const FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uMorph;
varying vec3 vPos;
varying float vDisp;
${NOISE}
void main(){
  vec3 N = normalize(cross(dFdx(vPos), dFdy(vPos)));
  vec3 V = normalize(cameraPosition - vPos);
  float ndv = max(dot(N, V), 0.0);
  float fres = pow(1.0 - ndv, 2.6);
  vec3 L = normalize(vec3(-0.55, 0.85, 0.6));
  float diff = max(dot(N, L), 0.0);
  vec3 ink   = vec3(0.045, 0.040, 0.034);
  vec3 paper = vec3(0.925, 0.905, 0.85);
  vec3 col = ink + paper * diff * 0.07 + paper * fres * 0.5;
  // topographic contour lines — the diagram inside the ink
  float c = fract(vDisp * 16.0 - uTime * 0.04);
  float line = smoothstep(0.0, 0.05, c) * smoothstep(0.14, 0.09, c);
  col += paper * line * (0.16 + uMorph * 0.12) * (1.0 - fres * 0.6);
  // a rare vermilion fleck, like a seal pressed into wet ink
  float fleck = smoothstep(0.93, 0.99, snoise(vPos * 2.2 + 3.7));
  col = mix(col, vec3(0.76, 0.19, 0.11), fleck * 0.55);
  gl_FragColor = vec4(col, 1.0);
}`;

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

function Sculpture({ lowPower, still }: { lowPower: boolean; still: boolean }) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const lattice = useRef<THREE.LineSegments>(null);
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uHover: { value: 0 },
      uMouse: { value: new THREE.Vector2() },
    }),
    [],
  );

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, lowPower ? 16 : 32), [lowPower]);
  const latticeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.32, 1)), []);

  const target = useMemo(() => ({ rx: 0, ry: 0, hover: 0, mx: 0, my: 0 }), []);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const s = sceneState;
    const clampDt = Math.min(dt, 0.05);
    const k = 1 - Math.pow(0.001, clampDt); // frame-rate independent lerp

    uniforms.uTime.value = still ? 0 : t;
    uniforms.uMorph.value += (s.scroll * 1.4 + s.velocity * 0.8 - uniforms.uMorph.value) * k * 0.6;

    target.mx += (s.mouse.x - target.mx) * k * 0.5;
    target.my += (s.mouse.y - target.my) * k * 0.5;
    uniforms.uMouse.value.set(target.mx, target.my);
    uniforms.uHover.value += (s.hover - uniforms.uHover.value) * k;

    // inertia-driven rotation: idle drift + pointer pull + scroll spin
    const idle = still ? 0 : t * 0.08;
    target.rx += (target.my * -0.35 - target.rx) * k * 0.35;
    target.ry += (target.mx * 0.5 - target.ry) * k * 0.35;
    g.rotation.x = target.rx + Math.sin(idle * 0.7) * 0.12;
    g.rotation.y = target.ry + idle + s.scroll * Math.PI * 0.9;

    // travel & scale as the hero scrolls away
    const p = s.scroll;
    const isWide = viewport.width > viewport.height;
    const baseX = isWide ? viewport.width * 0.22 : 0;
    const baseY = isWide ? 0 : viewport.height * 0.2;
    g.position.x = baseX + p * viewport.width * 0.15;
    g.position.y = baseY - p * viewport.height * 0.35;
    const intro = still ? 1 : s.intro;
    const sc =
      (isWide ? Math.min(viewport.height * 0.3, 2.0) : Math.min(viewport.width * 0.27, 1.4)) *
      (1 - p * 0.55) *
      (0.2 + 0.8 * intro);
    g.scale.setScalar(Math.max(sc, 0.0001));

    if (lattice.current) {
      lattice.current.rotation.y = -idle * 0.6 - p * 1.5;
      lattice.current.rotation.z = idle * 0.25;
      (lattice.current.material as THREE.LineBasicMaterial).opacity = 0.14 * (1 - p);
    }
    if (mesh.current) mesh.current.visible = p < 0.98;

    s.velocity *= 0.92;
  });

  return (
    <group ref={group}>
      <mesh ref={mesh} geometry={geometry}>
        <shaderMaterial vertexShader={VERT} fragmentShader={FRAG} uniforms={uniforms} />
      </mesh>
      <lineSegments ref={lattice} geometry={latticeGeo}>
        <lineBasicMaterial color="#ece6d8" transparent opacity={0.14} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Canvas host                                                          */
/* ------------------------------------------------------------------ */

function SculptureCanvas({ active }: { active: boolean }) {
  const touch = useIsTouch();
  const reduced = useReducedMotion();
  return (
    <Canvas
      dpr={touch ? [1, 1.25] : [1, 1.75]}
      camera={{ position: [0, 0, 6], fov: 38 }}
      gl={{ alpha: true, antialias: !touch, powerPreference: "high-performance" }}
      frameloop={active ? "always" : "never"}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      aria-hidden
    >
      <Sculpture lowPower={touch} still={reduced} />
    </Canvas>
  );
}

const LazyCanvas = lazy(() => Promise.resolve({ default: SculptureCanvas }));

export default function InkSculpture({ active }: { active: boolean }) {
  return (
    <div className="fixed inset-0 z-0" style={{ visibility: active ? "visible" : "hidden" }} aria-hidden>
      <Suspense fallback={null}>
        <LazyCanvas active={active} />
      </Suspense>
    </div>
  );
}
