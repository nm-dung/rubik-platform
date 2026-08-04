"use client";

import { Flame } from "lucide-react";

interface StreakFireProps {
  currentStreak: number;
  size?: "sm" | "md" | "lg";
}

export function StreakFire({ currentStreak, size = "md" }: StreakFireProps) {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  const getColor = () => {
    if (currentStreak >= 30) return "text-purple-500";
    if (currentStreak >= 14) return "text-red-500";
    if (currentStreak >= 7) return "text-orange-500";
    if (currentStreak >= 3) return "text-yellow-500";
    return "text-gray-400";
  };

  const getAnimation = () => {
    if (currentStreak >= 7) return "animate-pulse";
    return "";
  };

  return (
    <Flame 
      className={`${sizes[size]} ${getColor()} ${getAnimation()}`} 
      fill={currentStreak > 0 ? "currentColor" : "none"}
    />
  );
}
