import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { useIsTouch, useReducedMotion } from "@/hooks/useMedia";

/* ------------------------------------------------------------------ */
/* Palette — same ink / paper / vermilion as the rest of the site       */
/* ------------------------------------------------------------------ */
const INK = "#0b0a09";
const PAPER = "#ece6d8";
const PAPER_DIM = "#c9c1ae";
const SHU = "#c1301c";
const WHITE = "#f5f1e6";

/* ------------------------------------------------------------------ */
/* Googly eye — white ball + pupil that chases the pointer.             */
/* This is where 90% of the comedy budget went.                         */
/* ------------------------------------------------------------------ */
function Eye({
  position,
  size = 0.16,
  lazy = 1,
}: {
  position: [number, number, number];
  size?: number;
  lazy?: number;
}) {
  const pupil = useRef<THREE.Mesh>(null!);
  const wobble = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // R3F pointer is already normalized (-1 → 1); each eye gets its own
    // personality via `lazy` (1 = nosy, 0.2 = hungover).
    const px = state.pointer.x * 0.09 * lazy + Math.sin(t * 1.7 + wobble) * 0.012;
    const py = state.pointer.y * 0.09 * lazy + Math.cos(t * 2.1 + wobble) * 0.012;
    pupil.current.position.set(px, py, size * 0.72);
  });

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[size, 24, 24]} />
        <meshStandardMaterial color={WHITE} roughness={0.25} metalness={0} />
      </mesh>
      <mesh ref={pupil}>
        <sphereGeometry args={[size * 0.42, 16, 16]} />
        <meshStandardMaterial color={INK} roughness={0.15} metalness={0.1} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* A "4" built from boxes. It knows what it did.                       */
/* ------------------------------------------------------------------ */
function Four({
  position,
  mirror = false,
  drunk = 0,
  panic,
  onPoke,
  still,
}: {
  position: [number, number, number];
  mirror?: boolean;
  drunk?: number;
  panic: number;
  onPoke: () => void;
  still: boolean;
}) {
  const group = useRef<THREE.Group>(null!);
  const spin = useRef(0);
  const prevPanic = useRef(panic);
  const seed = useMemo(() => Math.random() * 10, []);

  useFrame((state, dt) => {
    if (prevPanic.current !== panic) {
      prevPanic.current = panic;
      spin.current = Math.PI * 2 * (mirror ? -1 : 1); // one full freak-out rotation
    }
    const t = state.clock.elapsedTime;
    spin.current *= Math.pow(0.02, dt); // decay the freak-out
    if (still) return;
    group.current.rotation.z =
      (mirror ? -1 : 1) * (0.1 + drunk * 0.22) + Math.sin(t * 0.9 + seed) * 0.07 + spin.current;
    group.current.rotation.y = Math.sin(t * 0.5 + seed) * 0.25 + spin.current * 0.5;
    group.current.position.y = position[1] + Math.sin(t * 1.2 + seed) * 0.14 + Math.abs(spin.current) * 0.4;
  });

  const inner = (
    <group
      ref={group}
      position={position}
      rotation={[0, 0, (mirror ? -1 : 1) * 0.1]}
      onClick={(e) => {
        e.stopPropagation();
        onPoke();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      {/* vertical stem */}
      <mesh position={[mirror ? 0.42 : -0.42, 0, 0]}>
        <boxGeometry args={[0.34, 2.1, 0.34]} />
        <meshStandardMaterial color={PAPER} roughness={0.4} />
      </mesh>
      {/* diagonal strut */}
      <mesh position={[0, 0.32, 0]} rotation={[0, 0, (mirror ? -1 : 1) * 0.62]}>
        <boxGeometry args={[0.28, 1.35, 0.3]} />
        <meshStandardMaterial color={PAPER_DIM} roughness={0.45} />
      </mesh>
      {/* crossbar */}
      <mesh position={[0, -0.18, 0]}>
        <boxGeometry args={[1.35, 0.3, 0.32]} />
        <meshStandardMaterial color={PAPER} roughness={0.4} />
      </mesh>
      {/* vermilion seal stamp — it has seen things */}
      <mesh position={[mirror ? 0.42 : -0.42, -0.72, 0.18]}>
        <boxGeometry args={[0.2, 0.2, 0.02]} />
        <meshStandardMaterial color={SHU} roughness={0.5} />
      </mesh>
      <Eye position={[-0.18, 0.78, 0.22]} size={0.17} lazy={mirror ? 0.25 : 1} />
      <Eye position={[0.24, 0.78, 0.22]} size={0.17} lazy={mirror ? 1 : 0.6} />
    </group>
  );

  if (still) return inner;
  return (
    <Float speed={2.2} rotationIntensity={0.25} floatIntensity={0.7}>
      {inner}
    </Float>
  );
}

/* ------------------------------------------------------------------ */
/* The "0" — a vermilion donut. The only digit that showed up to work, */
/* spinning to cope with the embarrassment.                            */
/* ------------------------------------------------------------------ */
function Zero({ position, panic, onPoke, still }: { position: [number, number, number]; panic: number; onPoke: () => void; still: boolean }) {
  const mesh = useRef<THREE.Mesh>(null!);
  const group = useRef<THREE.Group>(null!);
  const spin = useRef(0);
  const prevPanic = useRef(panic);

  useFrame((state, dt) => {
    if (prevPanic.current !== panic) {
      prevPanic.current = panic;
      spin.current = 9; // radians/sec of pure panic
    }
    const t = state.clock.elapsedTime;
    spin.current *= Math.pow(0.05, dt);
    if (!still) {
      mesh.current.rotation.x = t * 0.5;
      mesh.current.rotation.y = t * 0.7 + spin.current * 2;
      group.current.position.y = position[1] + Math.sin(t * 1.5) * 0.16 + spin.current * 0.12;
      group.current.rotation.z = Math.sin(t * 0.6) * 0.06 + spin.current * 0.4;
    }
  });

  const inner = (
    <group
      ref={group}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onPoke();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <mesh ref={mesh}>
        <torusGeometry args={[0.82, 0.36, 28, 64]} />
        <meshStandardMaterial color={SHU} roughness={0.32} metalness={0.05} />
      </mesh>
      <Eye position={[-0.22, 0.62, 0.42]} size={0.16} lazy={1} />
      <Eye position={[0.24, 0.66, 0.4]} size={0.14} lazy={0.7} />
    </group>
  );

  if (still) return inner;
  return (
    <Float speed={3} rotationIntensity={0.15} floatIntensity={1}>
      {inner}
    </Float>
  );
}

/* ------------------------------------------------------------------ */
/* Paper-dust particles + a faint orbit ring (echoes InkSculpture)      */
/* ------------------------------------------------------------------ */
function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 9;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 9;
      arr[i * 3] = Math.cos(theta) * r;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = Math.sin(theta) * r - 2;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={PAPER} size={0.045} transparent opacity={0.45} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Rig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null!);
  const { viewport } = useThree();
  const s = Math.min(1, Math.max(0.52, viewport.width / 13));

  useFrame((state) => {
    // gentle parallax — the void leans toward your cursor, judgmentally
    group.current.rotation.y += (state.pointer.x * 0.12 - group.current.rotation.y) * 0.04;
    group.current.rotation.x += (-state.pointer.y * 0.08 - group.current.rotation.x) * 0.04;
  });

  return (
    <group ref={group} scale={s}>
      {children}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Public component. `pokeSignal` bumps from the DOM ("poke the void"  */
/* button) — every bump makes all three digits do a panic flip.        */
/* ------------------------------------------------------------------ */
export default function LostInkScene({ pokeSignal = 0 }: { pokeSignal?: number }) {
  const touch = useIsTouch();
  const reduced = useReducedMotion();
  const [panic, setPanic] = useState(0);
  const prevSignal = useRef(pokeSignal);

  useEffect(() => {
    if (pokeSignal !== prevSignal.current) {
      prevSignal.current = pokeSignal;
      setPanic((p) => p + 1);
    }
  }, [pokeSignal]);

  const poke = () => setPanic((p) => p + 1);

  return (
    <Canvas
      dpr={touch ? [1, 1.25] : [1, 1.75]}
      camera={{ position: [0, 0.2, 9.5], fov: 38 }}
      gl={{ alpha: true, antialias: !touch, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0, pointerEvents: "auto" }}
      aria-hidden
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[-4, 6, 5]} intensity={1.6} color={WHITE} />
      <pointLight position={[4, -3, 4]} intensity={12} color={SHU} />
      <Rig>
        <Four position={[-3.1, 0.1, 0]} panic={panic} onPoke={poke} still={reduced} />
        <Zero position={[0, 0.35, 0.4]} panic={panic} onPoke={poke} still={reduced} />
        <Four position={[3.1, -0.15, 0]} mirror drunk={1} panic={panic} onPoke={poke} still={reduced} />
        {/* faint orbit ring — the halo of the page that never loaded */}
        <mesh rotation={[Math.PI / 2.4, 0, 0.3]}>
          <torusGeometry args={[4.6, 0.012, 8, 128]} />
          <meshBasicMaterial color={PAPER} transparent opacity={0.16} />
        </mesh>
        <Dust count={touch ? 150 : 380} />
      </Rig>
      <fog attach="fog" args={[INK, 10, 22]} />
    </Canvas>
  );
}
