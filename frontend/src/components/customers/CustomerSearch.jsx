import { useEffect, useRef, useState } from 'react';
import { fetchCustomers } from '../../domains/customers/customers.service.js';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';

/**
 * Campo de busca de cliente com autocomplete.
 *
 * Props:
 *   value       - valor atual (nome do cliente)
 *   onSelect    - callback(id, name) chamado ao selecionar ou digitar
 *   placeholder - texto do placeholder
 *   maxResults  - máximo de resultados no dropdown (padrão: 8)
 */
export default function CustomerSearch({ value, onSelect, placeholder, maxResults = 8 }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const handleChange = (event) => {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    clearTimeout(timer.current);

    if (!nextQuery.trim()) {
      onSelect(null, nextQuery);
      setResults([]);
      setOpen(false);
      return;
    }

    onSelect(null, nextQuery);

    timer.current = setTimeout(async () => {
      try {
        const customers = await fetchCustomers({ q: nextQuery });
        const filtered = customers.slice(0, maxResults);
        setResults(filtered);
        setOpen(filtered.length > 0);
      } catch {
        setResults([]);
      }
    }, 280);
  };

  const pickCustomer = (customer) => {
    setQuery(customer.name);
    setOpen(false);
    setResults([]);
    onSelect(customer.id, customer.name);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <Input
          type="text"
          placeholder={placeholder || 'Buscar por nome ou CPF/CNPJ'}
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          autoComplete="off"
        />
      </PopoverAnchor>
      <PopoverContent
        className="customer-search-popover p-0 w-[var(--radix-popover-trigger-width)]"
        style={{ width: 'var(--radix-popover-trigger-width)' }}
        onOpenAutoFocus={(e) => e.preventDefault()}
        align="start"
      >
        <ul className="py-1">
          {results.map((customer) => (
            <li
              key={customer.id}
              className="customer-search-popover-item flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted text-sm"
              onMouseDown={() => pickCustomer(customer)}
            >
              <span className="customer-search-popover-name font-medium">{customer.name}</span>
              <span className="customer-search-popover-meta text-muted-foreground text-xs">{customer.document || customer.phone}</span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
