
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
    <Canvas 
      shadows 
      gl={{ 
        antialias: false, 
        stencil: false, 
        depth: true, 
        powerPreference: "high-performance",
        alpha: false
      }}
      dpr={[1, 2]} // 限制像素比提高性能
    >
      <PerspectiveCamera makeDefault position={[0, 4, 25]} fov={45} />
      <color attach="background" args={['#01120b']} />
      
      <Suspense fallback={null}>
        {/* 
          关键修复：彻底不使用外部 HDR 文件。
          在国内，下载远程贴图是导致“一直初始化”的元凶。
          我们用多光源组合来模拟金属的闪耀感。
        */}
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.4} />
        
        {/* 金色主光源：提供温暖的色调 */}
        <spotLight position={[15, 25, 15]} angle={0.3} penumbra={1} intensity={2.5} color="#ffd700" castShadow />
        
        {/* 白色补光：为金属装饰球提供高亮反光（Specular Highlight） */}
        <pointLight position={[10, 5, 10]} intensity={2} color="#ffffff" />
        <pointLight position={[-10, 5, 10]} intensity={2} color="#ffffff" />
        
        {/* 底部暗绿色环境光：增强树的体积感 */}
        <pointLight position={[0, -10, -10]} intensity={1} color="#043927" />

        <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
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
          makeDefault
        />

        <EffectComposer multisampling={0}>
          <Bloom 
            luminanceThreshold={0.8} 
            mipmapBlur 
            intensity={1.0} 
            radius={0.4} 
          />
          <Noise opacity={0.02} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
};

export default Experience;
