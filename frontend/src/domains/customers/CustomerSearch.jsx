import { useEffect, useRef, useState } from 'react';
import { fetchCustomers } from './customers.service.js';

export default function CustomerSearch({ value, onSelect, placeholder, maxResults = 8 }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const timer = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handler = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
        setResults(customers.slice(0, maxResults));
        setOpen(true);
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
    <div className="customer-search" ref={containerRef}>
      <input
        type="text"
        placeholder={placeholder || 'Buscar por nome ou CPF/CNPJ'}
        value={query}
        onChange={handleChange}
        onFocus={() => results.length > 0 && setOpen(true)}
        autoComplete="off"
      />
      {open && results.length > 0 && (
        <ul className="customer-dropdown">
          {results.map((customer) => (
            <li key={customer.id} onMouseDown={() => pickCustomer(customer)}>
              <span className="cd-name">{customer.name}</span>
              <span className="cd-meta">{customer.document || customer.phone}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}