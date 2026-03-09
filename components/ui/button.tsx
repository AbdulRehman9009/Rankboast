"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-brand/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // High-end agency feel: Glow effect in dark mode, solid indigo in light mode
        default: 
          "bg-brand text-white shadow-sm hover:bg-brand/90 dark:shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)]",
        // The "Glassmorphism" look for your dashboard
        outline:
          "border-border bg-background hover:bg-card hover:text-foreground dark:bg-glass dark:backdrop-blur-md dark:border-glass-border dark:hover:bg-white/10",
        // University/Academic style: Subtle and clean
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
        ghost:
          "hover:bg-card hover:text-foreground dark:hover:bg-white/5",
        destructive:
          "bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30",
        link: "text-brand underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 gap-2 px-4",
        xs: "h-7 gap-1 rounded-md px-2 text-xs",
        sm: "h-8 gap-1.5 rounded-md px-3 text-xs",
        lg: "h-11 gap-2.5 px-6 text-base",
        icon: "size-9",
        "icon-xs": "size-7 rounded-md",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Define the merged types for Framer Motion and Shadcn variants
type CombinedProps = HTMLMotionProps<"button"> & VariantProps<typeof buttonVariants> & {
    asChild?: boolean
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: CombinedProps) {
  // Use a standard motion.button if not asChild
  const Comp = asChild ? Slot : motion.button

  return (
    <Comp
      // Modern interactive animations
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...(props as any)}
    />
  )
}

export { Button, buttonVariants }