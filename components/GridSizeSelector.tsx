const SIZES = [
  { label: 'Small', gridWidth: 4, gridHeight: 4 },
  { label: 'Medium', gridWidth: 5, gridHeight: 5 },
  { label: 'Large', gridWidth: 7, gridHeight: 7 },
];

interface GridSizeSelectorProps {
  selected: { gridWidth: number; gridHeight: number };
  onSelect: (size: { gridWidth: number; gridHeight: number }) => void;
}

export default function GridSizeSelector({ selected, onSelect }: GridSizeSelectorProps) {
  return (
    <div className="flex gap-1.5">
      {SIZES.map((size) => {
        const active = selected.gridWidth === size.gridWidth && selected.gridHeight === size.gridHeight;
        return (
          <button
            key={size.label}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
              active ? 'bg-accent text-panelDark' : 'bg-base text-muted hover:text-white'
            }`}
            onClick={() => onSelect({ gridWidth: size.gridWidth, gridHeight: size.gridHeight })}
          >
            {size.label}
          </button>
        );
      })}
    </div>
  );
}