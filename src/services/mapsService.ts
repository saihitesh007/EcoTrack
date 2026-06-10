const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
let scriptLoaded = false;
let loadPromise: Promise<void> | null = null;

export function loadGoogleMapsScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places&callback=initMaps`;
    script.async = true;
    script.defer = true;

    window.initMaps = () => {
      scriptLoaded = true;
      resolve();
    };

    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function cleanupGoogleMapsScript(): void {
  const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
  scripts.forEach(s => s.remove());
  scriptLoaded = false;
  loadPromise = null;
}

export function initAutocomplete(
  inputEl: HTMLInputElement,
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void
): google.maps.places.Autocomplete {
  const autocomplete = new google.maps.places.Autocomplete(inputEl, {
    types: ['geocode', 'establishment'],
  });

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    onPlaceSelected(place);
  });

  return autocomplete;
}

export async function calculateDistance(
  origin: string,
  destination: string
): Promise<number> {
  return new Promise((resolve, reject) => {
    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [destination],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status !== 'OK' || !response) {
          reject(new Error(`Distance Matrix API error: ${status}`));
          return;
        }
        const element = response.rows[0]?.elements[0];
        if (!element || element.status !== 'OK') {
          reject(new Error('Could not calculate distance between locations'));
          return;
        }
        // Convert meters to kilometers
        const distanceKm = element.distance.value / 1000;
        resolve(Math.round(distanceKm * 10) / 10);
      }
    );
  });
}

// Extend window with Google Maps callback
declare global {
  interface Window {
    initMaps: () => void;
  }
}
