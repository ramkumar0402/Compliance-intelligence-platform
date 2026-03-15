import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Command } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  action: () => void;
  group: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, commands }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    const lowerQuery = query.toLowerCase();
    return commands.filter(
      (cmd) => cmd.label.toLowerCase().includes(lowerQuery) || cmd.group.toLowerCase().includes(lowerQuery)
    );
  }, [commands, query]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.group]) {
        groups[cmd.group] = [];
      }
      groups[cmd.group].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  let flatIndex = -1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-enter"
        onClick={onClose}
      />

      {/* Command Palette */}
      <div className="fixed inset-x-4 top-[15%] z-50 mx-auto max-w-xl animate-enter">
        <div className="overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-gray-200">
          {/* Search Input */}
          <div className="flex items-center border-b border-gray-200 px-4">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search commands..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border-0 bg-transparent py-4 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
            />
            <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-gray-200 bg-gray-100 px-2 font-mono text-xs text-gray-500">
              ESC
            </kbd>
          </div>

          {/* Command List */}
          <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="py-14 px-4 text-center">
                <p className="text-sm text-gray-500">No commands found</p>
              </div>
            ) : (
              Object.entries(groupedCommands).map(([group, items]) => (
                <div key={group} className="mb-2">
                  <div className="px-3 py-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {group}
                    </p>
                  </div>
                  {items.map((item) => {
                    flatIndex++;
                    const currentIndex = flatIndex;
                    const isSelected = currentIndex === selectedIndex;

                    return (
                      <button
                        key={item.id}
                        data-index={currentIndex}
                        onClick={() => {
                          item.action();
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        className={cn(
                          'w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                          isSelected ? 'bg-blue-50 text-blue-900' : 'text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        <span className="font-medium text-sm">{item.label}</span>
                        {item.shortcut && (
                          <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-gray-200 bg-gray-50 px-1.5 font-mono text-[10px] text-gray-500">
                            {item.shortcut}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Command className="h-3 w-3" />
              <span>ClearanceIQ Command Palette</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-gray-200 font-mono">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-gray-200 font-mono">↵</kbd>
                Select
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
