import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent text-sm font-medium whitespace-nowrap transition-all outline-none select-none cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground font-semibold hover:brightness-105 shadow-sm shadow-primary/20 hover:shadow-teal-glow",
        outline:
          "border-border bg-card hover:bg-muted text-foreground hover:border-border-strong shadow-subtle",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-muted text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        link:
          "text-brand-ink dark:text-brand-cyan underline-offset-4 hover:underline p-0 h-auto font-normal",
        metallic:
          "border border-white/20 bg-gradient-to-b from-[#2A343D] to-[#171E24] text-brand-silver hover:text-white shadow-sm hover:border-brand-teal/40",
      },
      size: {
        default: "h-9 px-3.5 py-2 gap-2",
        xs: "h-7 px-2 text-xs rounded-md gap-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 px-2.5 text-xs rounded-md gap-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 px-5 text-base rounded-xl gap-2.5 [&_svg:not([class*='size-'])]:size-5",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
