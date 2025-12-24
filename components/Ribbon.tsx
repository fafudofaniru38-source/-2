
import React, { useMemo, useRef } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { TREE_HEIGHT, TREE_RADIUS, COLORS } from '../constants';

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
}

interface RibbonProps {
  progress: number;
}

const Ribbon: React.FC<RibbonProps> = ({ progress }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const smoothedProgress = useRef(0);

  const { geometry } = useMemo(() => {
    const points = [];
    const segments = 400;
    const loops = 7;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const h = t * TREE_HEIGHT - (TREE_HEIGHT / 2);
      const radius = (1 - t) * TREE_RADIUS * 1.05; 
      const angle = t * Math.PI * 2 * loops;
      
      points.push(new THREE.Vector3(
        radius * Math.cos(angle),
        h,
        radius * Math.sin(angle)
      ));
    }
    
    const curve = new THREE.CatmullRomCurve3(points);
    const geo = new THREE.TubeGeometry(curve, segments, 0.05, 8, false);
    return { geometry: geo };
  }, []);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: COLORS.RIBBON_PINK,
      transparent: true,
      opacity: 0.6,
      emissive: COLORS.RIBBON_PINK,
      emissiveIntensity: 2.0,
      side: THREE.DoubleSide
    });
  }, []);

  useFrame((state) => {
    if (meshRef.current && geometry.index) {
      smoothedProgress.current = THREE.MathUtils.lerp(smoothedProgress.current, progress, 0.03);
      const indexCount = geometry.index.count;
      const drawCount = Math.floor(indexCount * smoothedProgress.current);
      geometry.setDrawRange(0, drawCount);
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      geometry={geometry} 
      material={material} 
      frustumCulled={false} 
    />
  );
};

export default Ribbon;
