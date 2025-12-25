
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import TreeBase from './TreeBase';
import Ribbon from './Ribbon';
import { TreeState } from '../types';

interface ExperienceProps {
  treeState: TreeState;
}

const Experience: React.FC<ExperienceProps> = ({ treeState }) => {
  const progress = treeState === TreeState.FORMED ? 1 : 0;

  return (
    <Canvas shadows gl={{ antialias: false, stencil: false, depth: true }}>
      <PerspectiveCamera makeDefault position={[0, 4, 25]} fov={45} />
      <color attach="background" args={['#01120b']} />
      
      <Suspense fallback={null}>
        <Environment preset="lobby" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.2} />
        <spotLight position={[10, 20, 10]} angle={0.15} penumbra={1} intensity={1.5} color="#ffd700" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#043927" />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <group position={[0, 0, 0]}>
            <Foliage progress={progress} />
            <Ornaments progress={progress} />
            <Ribbon progress={progress} />
            <TreeBase progress={progress} />
          </group>
        </Float>

        <OrbitControls 
          enablePan={false} 
          minDistance={10} 
          maxDistance={40} 
          autoRotate={treeState === TreeState.FORMED}
          autoRotateSpeed={0.5}
        />

        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={0.8} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.5} 
          />
          <Noise opacity={0.05} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
};

export default Experience;
