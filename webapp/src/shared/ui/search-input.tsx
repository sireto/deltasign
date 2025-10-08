import React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

export type SearchProps = React.InputHTMLAttributes<HTMLInputElement>;

const SearchInput = React.forwardRef<HTMLInputElement, SearchProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex items-center rounded-md border border-input bg-white pl-3 text-sm ring-offset-background border-[1.5px] border-midnight-gray-300",
          className,
        )}
      >
        <Search height={16} width={16} className="text:midnight-gray-600" />
        <input
          {...props}
          type="search"
          ref={ref}
          className="w-full pl-2 placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    );
  },
);

SearchInput.displayName = "Search";

export { SearchInput };
