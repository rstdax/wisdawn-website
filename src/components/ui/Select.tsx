import React from "react"
import { cn } from "../../lib/utils"
import { ChevronDown } from "lucide-react"
import { motion } from "framer-motion"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    icon?: React.ReactNode
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, icon, children, ...props }, ref) => {
        return (
            <motion.div
                whileTap={{ scale: 0.995 }}
                className="relative w-full group"
            >
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-blue-400 transition-colors z-10">
                        {icon}
                    </div>
                )}
                <select
                    ref={ref}
                    className={cn(
                        "flex h-12 w-full appearance-none rounded-xl border border-white/10 bg-[#18181b] px-4 py-2 text-sm text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-white/20 hover:bg-[#27272a] disabled:cursor-not-allowed disabled:opacity-50",
                        icon && "pl-11",
                        "pr-11",
                        className
                    )}
                    {...props}
                >
                    {children}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                    <ChevronDown size={20} />
                </div>
            </motion.div>
        )
    }
)
Select.displayName = "Select"
