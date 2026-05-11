"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, RoundedBox, ContactShadows, Environment } from "@react-three/drei";
const COLORS = {
  white: "#ffffff",
  yellow: "#ffcf00",
  green: "#009b48",
  blue: "#0045ad",
  orange: "#ff5800",
  red: "#b71234",
  internal: "#121212" 
};

function Cubie({ position }: { position: [number, number, number] }) {
  const [x, y, z] = position;

  return (
    <group position={position}>
      <RoundedBox args={[0.97, 0.97, 0.97]} radius={0.08} smoothness={4}>
        <meshStandardMaterial color={COLORS.internal} roughness={0.2} metalness={0.1} />
      </RoundedBox>

      {/* Top - White */}
      {y === 1 && (
        <mesh position={[0, 0.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.82, 0.82]} />
          <meshStandardMaterial color={COLORS.white} roughness={0.1} />
        </mesh>
      )}
      {/* Bottom - Yellow */}
      {y === -1 && (
        <mesh position={[0, -0.49, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.82, 0.82]} />
          <meshStandardMaterial color={COLORS.yellow} roughness={0.1} />
        </mesh>
      )}
      {/* Front - Green */}
      {z === 1 && (
        <mesh position={[0, 0, 0.49]}>
          <planeGeometry args={[0.82, 0.82]} />
          <meshStandardMaterial color={COLORS.green} roughness={0.1} />
        </mesh>
      )}
      {/* Back - Blue */}
      {z === -1 && (
        <mesh position={[0, 0, -0.49]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.82, 0.82]} />
          <meshStandardMaterial color={COLORS.blue} roughness={0.1} />
        </mesh>
      )}
      {/* Right - Red */}
      {x === 1 && (
        <mesh position={[0.49, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.82, 0.82]} />
          <meshStandardMaterial color={COLORS.red} roughness={0.1} />
        </mesh>
      )}
      {/* Left - Orange */}
      {x === -1 && (
        <mesh position={[-0.49, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.82, 0.82]} />
          <meshStandardMaterial color={COLORS.orange} roughness={0.1} />
        </mesh>
      )}
    </group>
  );
}

export default function CubeScene() {
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
      <Canvas 
        key="cube-canvas"
        shadows 
       
        camera={{ position: [8, 6.5, 8], fov: 25 }} 
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />

        
        <group rotation={[0, 0, 0]}>
          {positions.map((pos, i) => (
            <Cubie key={i} position={pos} />
          ))}
        </group>

  
        <ContactShadows 
          position={[0, -1.52, 0]} 
          opacity={0.5} 
          scale={10} 
          blur={2.5} 
          far={4} 
        />
        
        <Environment preset="city" />

        <OrbitControls 
          enablePan={false} 
          minDistance={8} 
          maxDistance={15}
          target={[0, 0, 0]} 
          makeDefault 
        />
      </Canvas>
    </div>
  );
}