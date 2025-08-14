import React, { forwardRef } from 'react';
import { useClientDropdown, useClientSearch } from '../../hooks/useClients';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

/**
 * ClientDropdown - A reusable dropdown component for selecting clients
 *
 * @param {Object} props - Component props
 * @param {string} props.value - Currently selected client ID
 * @param {Function} props.onChange - Function called when selection changes
 * @param {boolean} props.required - Whether selection is required
 * @param {string} props.label - Label text for the dropdown
 * @param {string} props.placeholder - Placeholder text when no selection
 * @param {boolean} props.includeContact - Whether to show contact info in dropdown
 * @param {boolean} props.disabled - Whether the dropdown is disabled
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.searchable - Whether to enable searching (uses useClientSearch)
 * @param {Object} props.options - Additional options for useClientDropdown
 */
const ClientDropdown = forwardRef(({
  value = '',
  onChange,
  required = false,
  label = 'Client',
  placeholder = 'Select a client',
  includeContact = false,
  disabled = false,
  className = '',
  searchable = true,
  options = {},
}, ref) => {
  const [query, setQuery] = React.useState('');
  
  // Use appropriate hook based on searchable prop
  const { 
    clients = [], 
    loading: clientsLoading, 
    error: clientsError 
  } = searchable ? 
    useClientSearch(query, { ...options, includeContact }) : 
    useClientDropdown({ ...options, includeContact });
  
  // Find the currently selected client
  const selectedClient = React.useMemo(() => {
    return clients.find(client => client.id === value) || null;
  }, [clients, value]);
  
  // Filter clients by query when not using search hook
  const filteredClients = React.useMemo(() => {
    if (searchable) return clients;
    
    if (!query) return clients;
    
    return clients.filter(client => 
      client.label.toLowerCase().includes(query.toLowerCase()) ||
      (includeContact && client.contactPerson && 
       client.contactPerson.toLowerCase().includes(query.toLowerCase()))
    );
  }, [clients, query, searchable, includeContact]);

  const handleChange = (client) => {
    if (onChange) {
      onChange(client ? client.id : '');
    }
  };
  
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <Combobox value={selectedClient} onChange={handleChange} disabled={disabled}>
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-md bg-white text-left border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <Combobox.Input
              ref={ref}
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
              displayValue={(client) => client?.label || ''}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
              required={required}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          
          <Transition
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredClients.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  {clientsLoading ? 'Loading...' : 'No clients found.'}
                </div>
              ) : (
                filteredClients.map((client) => (
                  <Combobox.Option
                    key={client.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-blue-600 text-white' : 'text-gray-900'
                      }`
                    }
                    value={client}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? 'font-medium' : 'font-normal'
                          }`}
                        >
                          {client.label}
                          {includeContact && client.contactPerson && (
                            <span className="ml-2 text-xs text-gray-500">
                              ({client.contactPerson})
                            </span>
                          )}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-white' : 'text-blue-600'
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
          
          {clientsError && (
            <p className="mt-1 text-sm text-red-600">{clientsError}</p>
          )}
        </div>
      </Combobox>
    </div>
  );
});

ClientDropdown.displayName = 'ClientDropdown';

export default ClientDropdown;
