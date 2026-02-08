import { timeFilters } from '../utils/calculations';

interface TimeFilterBarProps {
  selectedFilter: string;
  onFilterChange: (filterId: string) => void;
}

export function TimeFilterBar({ selectedFilter, onFilterChange }: TimeFilterBarProps) {
  return (
    <div className="flex gap-2 justify-center flex-wrap mb-6 px-4">
      {timeFilters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            selectedFilter === filter.id
              ? 'gradient-primary text-white shadow-md'
              : 'bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:-translate-y-0.5'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
