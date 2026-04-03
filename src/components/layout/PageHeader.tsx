import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
}

export const PageHeader = ({ title, description, icon: Icon, actions }: PageHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div className="space-y-2">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && <Icon className="h-8 w-8 shrink-0 text-primary" />}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground min-w-0 break-words">{title}</h1>
        </div>
        {description && (
          <p className="text-lg text-muted-foreground max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};