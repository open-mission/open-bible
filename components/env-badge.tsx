import { Badge } from "@/components/ui/badge";
import { APP_ENV, ENV_LABEL, isPreRelease } from "@/lib/app-env";
import { cn } from "@/lib/utils";

export function EnvBadge({ className }: { className?: string }) {
  if (!isPreRelease) return null;

  const variant = APP_ENV === "development" ? "destructive" : "secondary";

  return (
    <Badge
      variant={variant}
      className={cn("uppercase tracking-wide", className)}
    >
      {ENV_LABEL[APP_ENV]}
    </Badge>
  );
}
