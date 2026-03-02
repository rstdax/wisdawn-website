import React from "react"
import { cn } from "../../lib/utils"
import { motion } from "framer-motion"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode
    rightIcon?: React.ReactNode
    error?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, icon, rightIcon, error, ...props }, ref) => {
        return (
            <motion.div
                className="relative w-full group"
                whileTap={{ scale: 0.995 }}
            >
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors flex items-center justify-center z-10 pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    ref={ref}
                    className={cn(
                        "flex h-12 w-full rounded-xl border border-white/10 bg-[#18181b] px-4 py-2 text-sm text-white shadow-sm transition-all placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-white/20 hover:bg-[#27272a] disabled:cursor-not-allowed disabled:opacity-50",
                        icon && "pl-11",
                        rightIcon && "pr-11",
                        error && "border-red-500/50 focus-visible:ring-red-500/20",
                        className
                    )}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-emerald-400">
                        {rightIcon}
                    </div>
                )}
            </motion.div>
        )
    }
)
Input.displayName = "Input"
