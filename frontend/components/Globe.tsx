import React, { useRef, useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { TextureLoader } from 'three';
import { Asset } from 'expo-asset';

function SpinningBox(props: any) {
  const meshRef = useRef<any>(null);
  const [colourMap, setColourMap] = useState<any>(null);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const loadTexture = async () => {
      const asset = Asset.fromModule(require('../assets/earth_texture.jpg'));
      await asset.downloadAsync();
      const texture = new TextureLoader().load(asset.localUri || asset.uri);
      setColourMap(texture);
    };

    loadTexture();
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta ;
    }
  });

  if (!colourMap) return null;

  return (
	// @ts-ignore
    <mesh
      {...props}
      ref={meshRef}
      scale={active ? 1.5 : 1}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial map={colourMap} />
    </mesh>
  );
}

export default function Welcome() {
  return (
    <>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Welcome Page</Text>
        <Link href="/onboarding">Go to Onboarding</Link>
      </View>

      <Canvas style={{ flex: 1 }}>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight position={[10, 500, 100]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
        <pointLight position={[-100, -10, -10]} decay={0} intensity={Math.PI} />
        <SpinningBox position={[0, 0, 0]} />
      </Canvas>
    </>
  );
}
