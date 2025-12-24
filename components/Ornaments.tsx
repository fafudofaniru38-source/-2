
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ORNAMENT_COUNT, TREE_HEIGHT, TREE_RADIUS, CHAOS_RADIUS, COLORS } from '../constants';
import { OrnamentData } from '../types';

interface OrnamentsProps {
  progress: number;
}

const Ornaments: React.FC<OrnamentsProps> = ({ progress }) => {
  const ballRef = useRef<THREE.InstancedMesh>(null);
  const giftRef = useRef<THREE.InstancedMesh>(null);
  const lightRef = useRef<THREE.InstancedMesh>(null);

  const { data, counts } = useMemo(() => {
    const list: OrnamentData[] = [];
    const counts = { BALL: 0, GIFT: 0, LIGHT: 0 };

    for (let i = 0; i < ORNAMENT_COUNT; i++) {
      const typeRand = Math.random();
      const type = typeRand > 0.75 ? 'BALL' : (typeRand > 0.5 ? 'LIGHT' : 'GIFT');
      counts[type]++;
      
      const r_c = Math.pow(Math.random(), 1/3) * CHAOS_RADIUS;
      const theta_c = Math.random() * Math.PI * 2;
      const phi_c = Math.acos(2 * Math.random() - 1);
      const chaosPosition: [number, number, number] = [
        r_c * Math.sin(phi_c) * Math.cos(theta_c),
        r_c * Math.sin(phi_c) * Math.sin(theta_c),
        r_c * Math.cos(phi_c)
      ];

      const h_rand = Math.random();
      const h = (1 - Math.sqrt(h_rand)) * TREE_HEIGHT;
      const r_t = (1 - h / TREE_HEIGHT) * TREE_RADIUS;
      const theta_t = Math.random() * Math.PI * 2;
      
      const depthOffset = 0.93 + Math.random() * 0.1;
      const targetPosition: [number, number, number] = [
        r_t * Math.cos(theta_t) * depthOffset,
        h - (TREE_HEIGHT / 2),
        r_t * Math.sin(theta_t) * depthOffset
      ];

      let weight = 0.03 + Math.random() * 0.05;
      let scale = 0.15;
      let color = COLORS.GOLD_METALLIC;

      if (type === 'BALL') {
        weight = 0.04;
        scale = 0.16 + Math.random() * 0.1;
        const ballColors = [COLORS.BLUE_LUXURY, COLORS.GOLD_BRIGHT, COLORS.EMERALD_LIGHT, COLORS.GOLD_METALLIC];
        color = ballColors[i % ballColors.length];
      } else if (type === 'GIFT') {
        weight = 0.02;
        scale = 0.2 + Math.random() * 0.12;
        const giftColors = [COLORS.RED_LUXURY, COLORS.RED_LUXURY, COLORS.GOLD_DEEP, COLORS.EMERALD_DARK];
        color = giftColors[i % giftColors.length];
      } else if (type === 'LIGHT') {
        weight = 0.08;
        scale = 0.04 + Math.random() * 0.02; 
        color = COLORS.GOLD_BRIGHT;
      }

      list.push({ chaosPosition, targetPosition, scale, type, weight, color });
    }
    return { data: list, counts };
  }, []);

  const tempObj = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  const progressState = useRef<Map<number, number>>(new Map());

  useFrame((state) => {
    const refs = [ballRef, giftRef, lightRef];
    const types = ['BALL', 'GIFT', 'LIGHT'] as const;
    
    // Calculate the current maximum height of the ribbon based on progress
    const ribbonLimitY = progress * TREE_HEIGHT - (TREE_HEIGHT / 2);

    refs.forEach((ref, idx) => {
      if (!ref.current) return;
      const currentType = types[idx];
      let instanceIdx = 0;

      data.forEach((orn, ornIdx) => {
        if (orn.type !== currentType) return;

        const currentP = progressState.current.get(ornIdx) || 0;
        const newP = THREE.MathUtils.lerp(currentP, progress, orn.weight);
        progressState.current.set(ornIdx, newP);

        const x = THREE.MathUtils.lerp(orn.chaosPosition[0], orn.targetPosition[0], newP);
        const y = THREE.MathUtils.lerp(orn.chaosPosition[1], orn.targetPosition[1], newP);
        const z = THREE.MathUtils.lerp(orn.chaosPosition[2], orn.targetPosition[2], newP);

        tempObj.position.set(x, y, z);
        const breath = 0.94 + 0.1 * Math.sin(state.clock.elapsedTime * 1.5 + ornIdx);
        tempObj.scale.setScalar(orn.scale * breath);
        
        if (orn.type === 'GIFT') {
          tempObj.rotation.y = state.clock.elapsedTime * 0.4 + ornIdx;
          tempObj.rotation.x = ornIdx;
        } else {
          tempObj.rotation.y = state.clock.elapsedTime * (orn.weight * 2);
        }
        
        tempObj.updateMatrix();
        ref.current!.setMatrixAt(instanceIdx, tempObj.matrix);
        
        tempColor.set(orn.color);
        
        if (orn.type === 'LIGHT') {
          // Check if ribbon has "reached" this light's target height
          const isReached = y <= ribbonLimitY + 0.2;
          const flicker = Math.sin(state.clock.elapsedTime * 10 + (ornIdx * 0.8)) > 0.4 ? 1.0 : 0.2;
          // Lights stay off until ribbon passes them, then they pulse and glow
          const intensity = isReached ? (1 + newP * 12 * flicker) : 0;
          tempColor.multiplyScalar(intensity);
        } else if (orn.type === 'BALL') {
          const shine = 1 + 0.2 * Math.sin(state.clock.elapsedTime * 2 + ornIdx);
          tempColor.multiplyScalar(shine);
        }
        
        ref.current!.setColorAt(instanceIdx, tempColor);
        instanceIdx++;
      });
      ref.current!.instanceMatrix.needsUpdate = true;
      if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
    });
  });

  return (
    <>
      <instancedMesh ref={ballRef} args={[undefined, undefined, counts.BALL]} frustumCulled={false}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial metalness={0.9} roughness={0.1} envMapIntensity={1} />
      </instancedMesh>
      
      <instancedMesh ref={giftRef} args={[undefined, undefined, counts.GIFT]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial metalness={0.4} roughness={0.6} envMapIntensity={0.8} />
      </instancedMesh>

      <instancedMesh ref={lightRef} args={[undefined, undefined, counts.LIGHT]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial emissive={COLORS.GOLD_BRIGHT} emissiveIntensity={3} toneMapped={false} />
      </instancedMesh>
    </>
  );
};

export default Ornaments;
