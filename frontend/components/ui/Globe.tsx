import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber/native';
import { TextureLoader } from 'three';
import { Asset } from 'expo-asset';

interface SpinningGlobeProps {
  position?: [number, number, number];
  scale?: number;
  texture?: any;
  shouldSpin?: boolean;
}

export const SpinningGlobe = ({
  position = [0, 0, 0],
  scale = 1.5,
  texture,
  shouldSpin = true,
}: SpinningGlobeProps) => {
  const meshRef = useRef<any>(null);
  const [colourMap, setColourMap] = useState<any>(texture || null);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const loadTexture = async () => {
      const asset = Asset.fromModule(require('@/assets/earth_texture.jpg'));
      await asset.downloadAsync();
      const texture = new TextureLoader().load(asset.localUri || asset.uri);
      setColourMap(texture);
    };

    loadTexture();
  }, []);

  useFrame((state, delta) => {
    if (shouldSpin && meshRef.current) {
      meshRef.current.rotation.y += delta ;
    }
  });

  if (!colourMap) return null;

  return (
	// @ts-ignore
    <mesh
      ref={meshRef}
      position={position}
      scale={active ? 1.2 : scale}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial map={colourMap} />
    </mesh>
  );
};
