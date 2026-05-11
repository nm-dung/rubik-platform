"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Cubie({ position }: { position: [number, number, number] }) {
  // Define the 6 colors for the faces
  // Order: Right, Left, Top, Bottom, Front, Back
  const colors = ["red", "orange", "white", "yellow", "green", "blue"];

  return (
    <mesh position={position}>
      <boxGeometry args={[0.95, 0.95, 0.95]} />
      {colors.map((color, index) => (
        <meshStandardMaterial 
          key={index} 
          attach={`material-${index}`} 
          color={color} 
        />
      ))}
    </mesh>
  );
}

export default function CubeScene() {
  // Generate the 3x3x3 grid (27 blocks)
  const positions: [number, number, number][] = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        positions.push([x, y, z]);
      }
    }
  }

  return (
    <div className="w-full h-[400px] bg-slate-100 rounded-2xl overflow-hidden shadow-inner">
      <Canvas camera={{ position: [4, 4, 4], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        
        <group>
          {positions.map((pos, i) => (
            <Cubie key={i} position={pos} />
          ))}
        </group>

        <OrbitControls enablePan={false} minDistance={3} maxDistance={10} />
      </Canvas>
    </div>
  );
}