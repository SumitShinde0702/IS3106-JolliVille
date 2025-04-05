"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface BackArrowProps {
  href?: string;
  onClick?: () => void;
  className?: string;
}

export default function BackArrow({ href, onClick, className = '' }: BackArrowProps) {
  const content = (
    <motion.div
      className={`inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer ${className}`}
      whileHover={{ x: -4 }}
      onClick={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
          clipRule="evenodd"
        />
      </svg>
      <span>Back</span>
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
} 