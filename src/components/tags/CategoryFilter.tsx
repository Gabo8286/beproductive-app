import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTags } from "@/hooks/useTags";
import { cn } from "@/lib/utils";

const DEFAULT_CATEGORIES = [
  "Work",
  "Personal",
  "Health",
  "Learning",
  "Finance",
  "Home",
  "Travel",
  "Creative",
];

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const { data: tags = [] } = useTags();

  // Get unique categories from tags, including defaults
  const categories = Array.from(
    new Set([
      ...DEFAULT_CATEGORIES,
      ...tags.map(tag => tag.category).filter(Boolean) as string[],
    ])
  );

  const getCategoryCount = (category: string) => {
    return tags.filter(tag => tag.category === category).length;
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Filter by Category</p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(null)}
          className="h-8"
        >
          All
        </Button>
        {categories.map((category) => {
          const count = getCategoryCount(category);
          return (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category)}
              className="h-8 gap-2"
            >
              {category}
              {count > 0 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
