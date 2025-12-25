
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Float } from '@react-three/drei';
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
    <Canvas shadows gl={{ antialias: false, stencil: false, depth: true, powerPreference: "high-performance" }}>
      <PerspectiveCamera makeDefault position={[0, 4, 25]} fov={45} />
      <color attach="background" args={['#01120b']} />
      
      <Suspense fallback={null}>
        {/* 
            关键修复：移除 Environment preset="lobby"，因为它会尝试从国外 CDN 下载几 MB 的图片资源，
            这是导致国内用户一直看到“初始化”的主要原因。
            改为使用高性能本地光源组合，模拟金属质感。
        */}
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.4} />
        
        {/* 模拟顶光 */}
        <spotLight position={[10, 20, 10]} angle={0.3} penumbra={1} intensity={2} color="#ffd700" castShadow />
        
        {/* 增加侧面补光，为金属装饰球提供高光反射点 */}
        <pointLight position={[15, 5, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-15, 5, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[0, -10, -10]} intensity={0.5} color="#043927" />

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

        <EffectComposer multisampling={0}>
          <Bloom 
            luminanceThreshold={0.8} 
            mipmapBlur 
            intensity={1.2} 
            radius={0.4} 
          />
          <Noise opacity={0.03} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
};

export default Experience;
