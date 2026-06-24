import { useState, useRef, useEffect } from 'react';

export interface SelectOption {
    value: number;
    label: string;
}

interface BaseProps {
    options: SelectOption[];
    placeholder?: string;
    loading?: boolean;
    className?: string;
}

interface SingleProps extends BaseProps {
    multi?: false;
    value: number | null;
    onChange: (value: number | null) => void;
}

interface MultiProps extends BaseProps {
    multi: true;
    value: number[];
    onChange: (value: number[]) => void;
}

type SearchableSelectProps = SingleProps | MultiProps;

export function SearchableSelect(props: SearchableSelectProps) {
    const { options, placeholder = 'Search...', loading = false, className = '' } = props;
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const filtered = query.trim()
        ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
        : options;

    useEffect(() => {
        function handleOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setQuery('');
            }
        }
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    if (props.multi) {
        const { value, onChange } = props;

        const toggle = (v: number) =>
            onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);

        const selectedOptions = options.filter(o => value.includes(o.value));

        return (
            <div ref={containerRef} className={`relative ${className}`}>
                {selectedOptions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {selectedOptions.map(o => (
                            <span key={o.value} className="badge badge-primary gap-1 text-xs">
                                {o.label}
                                <button
                                    type="button"
                                    aria-label={`Remove ${o.label}`}
                                    onMouseDown={e => { e.preventDefault(); toggle(o.value); }}
                                >
                                    ✕
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder={placeholder}
                    value={query}
                    onChange={e => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                />

                {open && (
                    <ul className="absolute z-50 w-full mt-1 max-h-52 overflow-y-auto bg-base-100 border border-base-300 rounded-box shadow-lg">
                        {loading ? (
                            <li className="px-3 py-2 text-sm text-base-content/50">Loading…</li>
                        ) : filtered.length === 0 ? (
                            <li className="px-3 py-2 text-sm text-base-content/50">No results</li>
                        ) : (
                            filtered.map(o => (
                                <li
                                    key={o.value}
                                    className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-base-200 ${value.includes(o.value) ? 'bg-primary/10 font-medium' : ''
                                        }`}
                                    onMouseDown={e => { e.preventDefault(); toggle(o.value); }}
                                >
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-primary checkbox-xs"
                                        checked={value.includes(o.value)}
                                        readOnly
                                    />
                                    {o.label}
                                </li>
                            ))
                        )}
                    </ul>
                )}
            </div>
        );
    }

    // — Single select —
    const { value, onChange } = props;
    const selectedLabel = options.find(o => o.value === value)?.label ?? '';

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <input
                type="text"
                className="input input-bordered w-full pr-8"
                placeholder={placeholder}
                value={open ? query : selectedLabel}
                onChange={e => { setQuery(e.target.value); setOpen(true); }}
                onFocus={() => { setQuery(''); setOpen(true); }}
            />

            {value !== null && (
                <button
                    type="button"
                    aria-label="Clear selection"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                    onMouseDown={e => { e.preventDefault(); onChange(null); setQuery(''); setOpen(false); }}
                >
                    ✕
                </button>
            )}

            {open && (
                <ul className="absolute z-50 w-full mt-1 max-h-52 overflow-y-auto bg-base-100 border border-base-300 rounded-box shadow-lg">
                    {loading ? (
                        <li className="px-3 py-2 text-sm text-base-content/50">Loading…</li>
                    ) : filtered.length === 0 ? (
                        <li className="px-3 py-2 text-sm text-base-content/50">No results</li>
                    ) : (
                        filtered.map(o => (
                            <li
                                key={o.value}
                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-base-200 ${value === o.value ? 'bg-primary/10 font-medium' : ''
                                    }`}
                                onMouseDown={e => {
                                    e.preventDefault();
                                    onChange(o.value);
                                    setOpen(false);
                                    setQuery('');
                                }}
                            >
                                {o.label}
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
}