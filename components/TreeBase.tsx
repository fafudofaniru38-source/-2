
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TREE_HEIGHT, COLORS } from '../constants';

const TreeBase: React.FC<{ progress: number }> = ({ progress }) => {
  const starRef = useRef<THREE.Mesh>(null);

  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const outerRadius = 1;
    const innerRadius = 0.4;
    const points = 5;

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points + Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    shape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: 0.3,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelOffset: 0,
      bevelSegments: 3,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    return geometry;
  }, []);

  useFrame((state) => {
    if (starRef.current) {
      starRef.current.position.y = THREE.MathUtils.lerp(15, TREE_HEIGHT / 2 + 0.8, progress);
      starRef.current.scale.setScalar(THREE.MathUtils.lerp(0, 1.2, progress));
      starRef.current.rotation.y += 0.02;
      
      const material = starRef.current.material as THREE.MeshStandardMaterial;
      
      // Adjusted flare and base brightness to be less overpowering
      const flare = progress > 0.98 ? 6.0 : 1.2;
      const pulse = Math.sin(state.clock.elapsedTime * 2.0) * (progress > 0.98 ? 0.8 : 0.3);
      material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, flare + pulse, 0.1);
    }
  });

  return (
    <group>
      <mesh ref={starRef} geometry={starGeometry}>
        <meshStandardMaterial 
          color={COLORS.GOLD_BRIGHT} 
          emissive={COLORS.GOLD_BRIGHT} 
          emissiveIntensity={1.2}
          metalness={1}
          roughness={0.2}
        />
      </mesh>

      <mesh position={[0, -TREE_HEIGHT / 2 - 1, 0]}>
        <cylinderGeometry args={[0.5, 0.8, 2, 16]} />
        <meshStandardMaterial color="#3d2b1f" metalness={0.1} roughness={0.8} />
      </mesh>
    </group>
  );
};

export default TreeBase;
