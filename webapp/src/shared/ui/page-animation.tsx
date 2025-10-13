"use client";
import { motion } from "framer-motion";
export default function PageAnimation({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="flex h-full w-full flex-1 py-[32px] px-[160px] flex-col gap-[24px]"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 1,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
