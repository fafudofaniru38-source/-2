
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FOLIAGE_COUNT, TREE_HEIGHT, TREE_RADIUS, CHAOS_RADIUS, COLORS } from '../constants';

const vertexShader = `
  attribute vec3 chaosPosition;
  attribute vec3 targetPosition;
  uniform float uProgress;
  uniform float uTime;
  varying vec3 vColor;

  void main() {
    // Smoother interpolation with a bit of noise
    float p = clamp(uProgress, 0.0, 1.0);
    vec3 pos = mix(chaosPosition, targetPosition, p);
    
    // Add subtle waving motion
    pos.x += sin(uTime * 0.5 + pos.y) * 0.05 * (1.0 - p);
    pos.z += cos(uTime * 0.5 + pos.y) * 0.05 * (1.0 - p);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (15.0 / -mvPosition.z) * (1.0 + 0.5 * sin(uTime + pos.x));
    gl_Position = projectionMatrix * mvPosition;
    
    // Color logic: more emerald as it forms
    vColor = mix(vec3(0.1, 0.4, 0.2), vec3(0.02, 0.22, 0.15), p);
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.3, 0.5, r);
    gl_FragColor = vec4(vColor, alpha);
  }
`;

interface FoliageProps {
  progress: number;
}

const Foliage: React.FC<FoliageProps> = ({ progress }) => {
  const meshRef = useRef<THREE.Points>(null);
  
  const pointsData = useMemo(() => {
    const chaos = new Float32Array(FOLIAGE_COUNT * 3);
    const target = new Float32Array(FOLIAGE_COUNT * 3);

    for (let i = 0; i < FOLIAGE_COUNT; i++) {
      // Chaos: Random in sphere
      const r_c = Math.pow(Math.random(), 1/3) * CHAOS_RADIUS;
      const theta_c = Math.random() * Math.PI * 2;
      const phi_c = Math.acos(2 * Math.random() - 1);
      chaos[i * 3] = r_c * Math.sin(phi_c) * Math.cos(theta_c);
      chaos[i * 3 + 1] = r_c * Math.sin(phi_c) * Math.sin(theta_c);
      chaos[i * 3 + 2] = r_c * Math.cos(phi_c);

      // Target: Cone shape
      const h = Math.random() * TREE_HEIGHT;
      const r_t = (1 - h / TREE_HEIGHT) * TREE_RADIUS * Math.pow(Math.random(), 0.5);
      const theta_t = Math.random() * Math.PI * 2;
      target[i * 3] = r_t * Math.cos(theta_t);
      target[i * 3 + 1] = h - (TREE_HEIGHT / 2); // Center tree vertically
      target[i * 3 + 2] = r_t * Math.sin(theta_t);
    }

    return { chaos, target };
  }, []);

  const uniforms = useMemo(() => ({
    uProgress: { value: 0 },
    uTime: { value: 0 }
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      // Exponentially approach the progress for "physical" feel
      mat.uniforms.uProgress.value = THREE.MathUtils.lerp(mat.uniforms.uProgress.value, progress, 0.05);
      mat.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={FOLIAGE_COUNT}
          array={pointsData.chaos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-chaosPosition"
          count={FOLIAGE_COUNT}
          array={pointsData.chaos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-targetPosition"
          count={FOLIAGE_COUNT}
          array={pointsData.target}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default Foliage;
