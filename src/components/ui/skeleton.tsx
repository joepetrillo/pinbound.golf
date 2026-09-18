import { cn } from "cn";

function Skeleton({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "pill" | "field" | "button";
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse bg-muted",
        {
          default: "rounded-2xl",
          pill: "rounded-full",
          field: "rounded-lg",
          button: "rounded-4xl",
        }[variant],
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
