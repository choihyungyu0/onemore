"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

/**
 * WebGL 이미지 왜곡 — 커서가 닿으면 이미지가 물결처럼 휘고 RGB가 살짝 갈라진다.
 * 어워즈 히어로의 단골 기법. next/image 위에 투명 캔버스로 얹히므로 텍스처 로딩 전엔
 * 아래 이미지가 그대로 보인다. 마우스 환경(데스크톱)에서만 마운트할 것.
 */
const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uTime;
  uniform vec2 uCover; // cover-fit 스케일
  varying vec2 vUv;

  void main() {
    // object-fit: cover 와 동일하게 uv 보정
    vec2 uv = (vUv - 0.5) * uCover + 0.5;

    vec2 d = uv - uMouse;
    float dist = length(d);
    float ripple = sin(dist * 18.0 - uTime * 4.0) * exp(-dist * 4.0);
    vec2 offset = normalize(d + 1e-5) * ripple * 0.035 * uHover;

    float shift = 0.006 * uHover;
    float r = texture2D(uTex, uv + offset + vec2(shift, 0.0)).r;
    float g = texture2D(uTex, uv + offset).g;
    float b = texture2D(uTex, uv + offset - vec2(shift, 0.0)).b;
    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

function Plane({ src }: { src: string }) {
  const tex = useLoader(THREE.TextureLoader, src);
  const { viewport } = useThree();
  const mat = useRef<THREE.ShaderMaterial>(null);
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const target = useRef(0);

  const uniforms = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    const img = tex.image as { width: number; height: number };
    const imgAspect = img.width / img.height;
    const planeAspect = viewport.width / viewport.height;
    const cover =
      imgAspect > planeAspect
        ? new THREE.Vector2(planeAspect / imgAspect, 1)
        : new THREE.Vector2(1, imgAspect / planeAspect);
    return {
      uTex: { value: tex },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
      uTime: { value: 0 },
      uCover: { value: cover },
    };
  }, [tex, viewport.width, viewport.height]);

  useFrame((_, dt) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    u.uTime.value += dt;
    u.uHover.value += (target.current - u.uHover.value) * 0.08;
    (u.uMouse.value as THREE.Vector2).lerp(mouse.current, 0.12);
  });

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (e.uv) mouse.current.set(e.uv.x, e.uv.y);
  };

  return (
    <mesh
      scale={[viewport.width, viewport.height, 1]}
      onPointerMove={onMove}
      onPointerEnter={() => (target.current = 1)}
      onPointerLeave={() => (target.current = 0)}
    >
      <planeGeometry args={[1, 1]} />
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={VERT} fragmentShader={FRAG} />
    </mesh>
  );
}

export function DistortImage({ src, className }: { src: string; className?: string }) {
  if (!src) return null;
  return (
    <div className={className} aria-hidden>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 5], zoom: 1 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <Plane src={src} />
        </Suspense>
      </Canvas>
    </div>
  );
}
