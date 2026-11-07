import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { IconChip, type Tone } from "./IconChip";

type PanelProps = {
  title: string;
  description?: string;
  icon: LucideIcon;
  tone: Tone;
  className?: string;
  children?: ReactNode;
};

export function Panel({ title, description, icon, tone, className, children }: PanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("min-w-0", className)}
    >
      <Card className="border-border/60 bg-card/80 h-full gap-4 rounded-2xl shadow-sm backdrop-blur">
        <CardHeader className="flex flex-row items-start gap-3">
          <IconChip icon={icon} tone={tone} />
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-base">{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.section>
  );
}
