const SIZES = [
  { label: 'Small', width: 4, height: 4 },
  { label: 'Medium', width: 5, height: 5 },
  { label: 'Large', width: 7, height: 7 },
];

interface GridSizeSelectorProps {
  selected: { width: number; height: number };
  onSelect: (size: { width: number; height: number }) => void;
}

export default function GridSizeSelector({ selected, onSelect }: GridSizeSelectorProps) {
  return (
    <div className="flex gap-2">
      {SIZES.map((size) => {
        const active = selected.width === size.width && selected.height === size.height;
        return (
          <button
            key={size.label}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
              active ? 'bg-accent text-panelDark' : 'bg-panelDark text-muted hover:text-white'
            }`}
            onClick={() => onSelect({ width: size.width, height: size.height })}
          >
            {size.label}
          </button>
        );
      })}
    </div>
  );
}