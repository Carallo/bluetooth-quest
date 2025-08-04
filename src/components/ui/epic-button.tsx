import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const epicButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-epic text-primary-foreground shadow-epic hover:shadow-glow transition-epic",
        medieval: "bg-gradient-medieval text-foreground border border-primary/30 hover:border-primary shadow-dark transition-epic",
        blood: "bg-gradient-blood text-foreground shadow-dark hover:shadow-glow transition-epic",
        ghost: "hover:bg-muted hover:text-foreground transition-epic",
        outline: "border border-primary/50 bg-card/50 hover:bg-primary/10 hover:border-primary transition-epic",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface EpicButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof epicButtonVariants> {
  asChild?: boolean
}

const EpicButton = React.forwardRef<HTMLButtonElement, EpicButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(epicButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
EpicButton.displayName = "EpicButton"

export { EpicButton, epicButtonVariants }