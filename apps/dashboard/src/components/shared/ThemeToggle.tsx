import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { teks } from "@/i18n/teks";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={teks.gantiTema}>
      <Icon aria-hidden="true" />
    </Button>
  );
}
