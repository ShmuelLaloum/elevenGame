import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import clsx from "clsx";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
}

export const Button = ({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonProps) => {
  const variants = {
    primary:
      "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white shadow-lg",
    danger:
      "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20",
    outline:
      "bg-transparent border-2 border-slate-600 text-slate-200 hover:border-slate-400 hover:text-white",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={clsx(
        "px-6 py-2 rounded-full font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};
