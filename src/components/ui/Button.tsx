import React from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { cn } from "../../lib/utils"

export interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "glass"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", ...props }, ref) => {
        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-50 h-12 px-6 w-full shadow-sm",
                    {
                        "bg-white text-black hover:bg-neutral-200 shadow-[inset_0_-1px_0_rgba(0,0,0,0.2)]": variant === "primary",
                        "bg-white/5 text-white border border-white/10 hover:bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]": variant === "glass",
                        "bg-transparent text-neutral-400 border border-neutral-800 hover:bg-neutral-900 hover:text-white": variant === "outline",
                        "hover:bg-neutral-900 hover:text-white border border-transparent shadow-none": variant === "ghost",
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"
