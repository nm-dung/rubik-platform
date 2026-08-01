"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, RoundedBox, ContactShadows, Environment } from "@react-three/drei";
import { useCubeStore } from "@/hooks/useCubeStore";
import * as THREE from "three"; 

const COLORS = {
  white: "#ffffff", yellow: "#ffcf00", green: "#009b48",
  blue: "#0045ad", orange: "#ff5800", red: "#b71234", internal: "#121212" 
};


function Cubie({ position }: { position: [number, number, number] }) {
  const [x, y, z] = position;
  return (
    <group position={position}>
      <RoundedBox args={[0.97, 0.97, 0.97]} radius={0.08} smoothness={4}>
        <meshStandardMaterial color={COLORS.internal} roughness={0.2} metalness={0.1} />
      </RoundedBox>
      {y === 1 && <mesh position={[0, 0.49, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.82, 0.82]} /><meshStandardMaterial color={COLORS.white} roughness={0.1} /></mesh>}
      {y === -1 && <mesh position={[0, -0.49, 0]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[0.82, 0.82]} /><meshStandardMaterial color={COLORS.yellow} roughness={0.1} /></mesh>}
      {z === 1 && <mesh position={[0, 0, 0.49]}><planeGeometry args={[0.82, 0.82]} /><meshStandardMaterial color={COLORS.green} roughness={0.1} /></mesh>}
      {z === -1 && <mesh position={[0, 0, -0.49]} rotation={[0, Math.PI, 0]}><planeGeometry args={[0.82, 0.82]} /><meshStandardMaterial color={COLORS.blue} roughness={0.1} /></mesh>}
      {x === 1 && <mesh position={[0.49, 0, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[0.82, 0.82]} /><meshStandardMaterial color={COLORS.red} roughness={0.1} /></mesh>}
      {x === -1 && <mesh position={[-0.49, 0, 0]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[0.82, 0.82]} /><meshStandardMaterial color={COLORS.orange} roughness={0.1} /></mesh>}
    </group>
  );
}


function AnimatedCubeGroup({ positions, isSpinning, onSpinEnd }: { positions: [number, number, number][], isSpinning: boolean, onSpinEnd: () => void }) {
  const groupRef = useRef<THREE.Group>(null);

  // useFrame runs 60 FPS
  useFrame((state, delta) => {
    if (isSpinning && groupRef.current) {
      // Rotate the whole cube on the Y axis
      groupRef.current.rotation.y += delta * 15; // Spinning speed
      
      // Stop spinning after a full circle (2 * PI)
      if (groupRef.current.rotation.y >= Math.PI * 2) {
        groupRef.current.rotation.y = 0; // Reset exactly to start
        onSpinEnd();
      }
    }
  });

  return (
    <group ref={groupRef}>
      {positions.map((pos, i) => <Cubie key={i} position={pos} />)}
    </group>
  );
}

export default function CubeScene() {
  const algorithmQueue = useCubeStore((state) => state.algorithmQueue);
  const clearQueue = useCubeStore((state) => state.clearQueue);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    if (algorithmQueue.length > 0) {
      // Trigger the 3D spin animation
      setIsSpinning(true);
      clearQueue(); // Clear immediately so they can click again
    }
  }, [algorithmQueue, clearQueue]);

  const positions: [number, number, number][] = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (x === 0 && y === 0 && z === 0) continue;
        positions.push([x, y, z]);
      }
    }
  }

  return (
    <div className="w-full h-[450px] bg-[#f8fafc] rounded-3xl overflow-hidden border border-slate-200 shadow-2xl">
      <Canvas shadows camera={{ position: [8, 6.5, 8], fov: 25 }} dpr={[1, 2]}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />

        <AnimatedCubeGroup 
          positions={positions} 
          isSpinning={isSpinning} 
          onSpinEnd={() => setIsSpinning(false)} 
        />

        <ContactShadows position={[0, -1.52, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />
        <Environment preset="city" />
        <OrbitControls enablePan={false} minDistance={8} maxDistance={15} target={[0, 0, 0]} makeDefault />
      </Canvas>
    </div>
  );
}