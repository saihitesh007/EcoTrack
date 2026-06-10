import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { loadGoogleMapsScript, initAutocomplete } from '../services/mapsService';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

interface MapInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function MapInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
}: MapInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(!MAPS_API_KEY);

  useEffect(() => {
    if (!MAPS_API_KEY) {
      setLoadFailed(true);
      return;
    }

    loadGoogleMapsScript()
      .then(() => {
        setIsLoaded(true);
      })
      .catch(err => {
        if (import.meta.env.DEV) {
          console.error('Maps error:', err);
        }
        setLoadFailed(true);
      });
  }, []);

  useEffect(() => {
    if (!isLoaded || loadFailed || !inputRef.current || disabled) return;

    const autocomplete = initAutocomplete(inputRef.current, place => {
      if (place.formatted_address) {
        onChange(place.formatted_address);
      } else if (place.name) {
        onChange(place.name);
      }
    });

    return () => {
      if (window.google?.maps && autocomplete) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [isLoaded, loadFailed, onChange, disabled]);

  const useManualInput = loadFailed || !MAPS_API_KEY;

  return (
    <div className="relative">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          ref={inputRef}
          type="text"
          id={id}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled && !useManualInput}
          placeholder={useManualInput ? placeholder : isLoaded ? placeholder : 'Loading Maps...'}
          className="form-input pl-10"
          aria-describedby={`${id}-desc`}
        />
      </div>
      <p id={`${id}-desc`} className="sr-only">
        {useManualInput
          ? 'Enter a location manually.'
          : 'Search for a location using Google Maps autocomplete. Use arrow keys to navigate suggestions.'}
      </p>
    </div>
  );
}
