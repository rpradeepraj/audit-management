"use client";

import React, { useState, useEffect } from "react";

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  alt?: string;
  title?: string;
}

const SIZE_CLASSES = {
  xs: "w-5 h-5 text-[10px]",
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-xs font-bold",
  lg: "w-10 h-10 text-sm font-bold",
  xl: "w-12 h-12 text-base font-black",
};

const COLOR_GRADIENTS = [
  "from-indigo-500 to-indigo-700",
  "from-teal-500 to-teal-700",
  "from-purple-500 to-purple-700",
  "from-blue-500 to-blue-700",
  "from-rose-500 to-rose-700",
  "from-emerald-500 to-emerald-700",
  "from-amber-500 to-amber-700",
  "from-cyan-500 to-cyan-700",
];

function getGradient(name?: string): string {
  if (!name) return COLOR_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_GRADIENTS.length;
  return COLOR_GRADIENTS[index];
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name = "User",
  size = "md",
  className = "",
  alt,
  title,
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const initial = (name?.trim().charAt(0) || "U").toUpperCase();
  const gradient = getGradient(name);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  if (src && !hasError && src.trim() !== "") {
    return (
      <img
        src={src}
        alt={alt || name}
        title={title || name}
        onError={() => setHasError(true)}
        className={`${sizeClass} rounded-full object-cover ring-1 ring-slate-200 shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      title={title || name}
      className={`${sizeClass} rounded-full bg-gradient-to-br ${gradient} text-white flex items-center justify-center font-bold shrink-0 ring-1 ring-white shadow-2xs select-none ${className}`}
    >
      {initial}
    </div>
  );
};

export default UserAvatar;
