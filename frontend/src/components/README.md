# SearchBar and LiveMap Components

This document describes the usage, props, and functionality of the SearchBar and LiveMap components for the Sawari ride-booking application.

## SearchBar Component

A fully controlled search input component with Nominatim geocoding integration for location search.

### Features

- **Debounced Search**: 400ms debounce to prevent excessive API calls
- **Keyboard Navigation**: Arrow keys, Enter, and Escape support
- **Controlled Input**: Fully controlled with value/onChange pattern
- **Error Handling**: Network errors, rate limiting, and no results states
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **AbortController**: Cancels in-flight requests when new queries start
- **Responsive Design**: Works on mobile, tablet, and desktop

### Props

```jsx
<SearchBar
  mode="drop"                    // 'pickup' | 'drop' - Changes icon and placeholder
  placeholder="Custom placeholder" // Optional custom placeholder text
  onLocationSelect={handleSelect} // Callback when location is selected
  disabled={false}               // Optional disabled state
  className="custom-class"       // Optional additional CSS classes
  initialValue=""                // Optional initial input value
/>
```

### Location Selection Callback

The `onLocationSelect` callback receives a location object:

```javascript
{
  label: "Allama Iqbal International Airport, Lahore", // Display name
  lat: 31.5216,      // Latitude (number)
  lon: 74.4036,      // Longitude (number)
  address: {...}     // Raw Nominatim address object (optional)
}
```

### Usage Example

```jsx
import SearchBar from '../components/SearchBar';

const MyComponent = () => {
  const handleLocationSelect = (location) => {
    console.log('Selected:', location);
    setDestination(location);
  };

  return (
    <SearchBar
      mode="drop"
      onLocationSelect={handleLocationSelect}
      placeholder="Where are you going?"
    />
  );
};
```

## LiveMap Component

An interactive React-Leaflet map component with OpenStreetMap tiles, custom markers, and automatic bounds fitting.

### Features

- **Dual Markers**: Separate pickup and drop location markers
- **Auto Bounds**: Automatically fits bounds to include both markers
- **Recenter Button**: Manual recenter functionality
- **Responsive Design**: Height adapts to screen size
- **Custom Icons**: Animated pickup (📍) and drop (🏁) markers
- **Validation**: Coordinates validation and error handling
- **Performance**: Memoized icons and optimized re-renders

### Props

```jsx
<LiveMap
  pickup={pickupLocation}   // Pickup location object
  drop={dropLocation}       // Drop location object (optional)
  className="custom-class"  // Optional additional CSS classes
/>
```

### Location Object Structure

Both pickup and drop props expect objects with this structure:

```javascript
{
  lat: 31.5204,              // Latitude (required, number)
  lon: 74.3587,              // Longitude (required, number)  
  label: "Current Location"  // Display label (optional, string)
}
```

### Usage Example

```jsx
import LiveMap from '../components/LiveMap';

const MyComponent = () => {
  const [pickup, setPickup] = useState({
    lat: 31.5204,
    lon: 74.3587,
    label: 'Current Location'
  });
  
  const [drop, setDrop] = useState(null);

  return (
    <LiveMap 
      pickup={pickup}
      drop={drop}
      className="map-container"
    />
  );
};
```

## useCurrentLocation Hook

Enhanced geolocation hook with proper error handling and permission management.

### Features

- **Modern API**: Returns coords, loading, error, permission states
- **Watch Position**: Continuous location tracking with cleanup
- **Manual Retry**: Retry function for failed location requests  
- **Permission Handling**: Proper permission state management
- **Error Messages**: User-friendly error messages

### Return Values

```javascript
const {
  coords,           // {latitude, longitude, accuracy, timestamp} | null
  loading,          // boolean - location request in progress
  error,           // string | null - error message
  permission,      // 'prompt' | 'granted' | 'denied'
  getCurrentPosition, // function - get current position once
  startWatching,   // function - start continuous tracking
  stopWatching,    // function - stop tracking
  retry           // function - retry failed request
} = useCurrentLocation(options);
```

### Usage Example

```jsx
import useCurrentLocation from '../customHooks/useCurrentLocation';

const MyComponent = () => {
  const { coords, loading, error, permission, retry } = useCurrentLocation();

  useEffect(() => {
    if (permission === 'granted') {
      getCurrentPosition();
    }
  }, [permission]);

  if (loading) return <div>Getting location...</div>;
  if (error) return <div>{error} <button onClick={retry}>Retry</button></div>;

  return <div>Location: {coords?.latitude}, {coords?.longitude}</div>;
};
```

## CSS Classes

### Map Responsive Styles

The following CSS classes are available for responsive map layouts:

```css
.map-container {
  width: 100%;
  height: 70vh;        /* Desktop */
  min-height: 320px;
  border-radius: 12px;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .map-container {
    height: 60vh;      /* Tablet */
  }
}

@media (max-width: 768px) {
  .map-container {
    height: 50vh;      /* Mobile */
    border-radius: 8px;
  }
}
```

### SearchBar Styles

SearchBar has built-in responsive styles with proper z-index management:

```css
.search-container {
  position: relative;
  z-index: 1000;     /* Above map elements */
}
```

## Known Constraints

### Nominatim API Limits

- **Rate Limiting**: 1 request per second per IP
- **Usage Policy**: Must include User-Agent and respect rate limits
- **Bulk Queries**: Not suitable for bulk geocoding operations

### Browser Requirements

- **Geolocation API**: Required for location features
- **Modern Browsers**: ES6+ features used (Arrow functions, async/await)
- **HTTPS**: Geolocation requires secure context in production

### Mobile Considerations

- **iOS Safari**: Input font-size: 16px prevents zoom on focus
- **Touch Targets**: Minimum 48px tap areas for accessibility
- **Viewport**: Map heights optimized for mobile viewports

### Performance Notes

- **Debouncing**: 400ms debounce prevents excessive API calls
- **Memoization**: Icons and expensive calculations are memoized
- **AbortController**: Prevents race conditions in search requests

## Error Handling

### SearchBar Errors

- **Rate Limiting (429)**: Shows retry button with delay
- **Network Errors**: Connection timeout or offline handling  
- **No Results**: Empty state with retry option
- **Invalid Queries**: Minimum 3 characters required

### Location Errors

- **Permission Denied**: Clear CTA to enable permissions
- **Position Unavailable**: Device/service issues
- **Timeout**: Network or GPS timeout handling
- **Not Supported**: Graceful degradation for old browsers

## Accessibility Features

### Keyboard Support

- **SearchBar**: Arrow keys, Enter, Escape navigation
- **Map**: Keyboard interaction enabled for map controls
- **Focus Management**: Proper focus trapping and restoration

### Screen Readers

- **ARIA Labels**: Proper labeling for all interactive elements
- **Role Attributes**: Correct roles for dropdown and buttons
- **Live Regions**: Status announcements for location updates

### Color Contrast

- **Text Colors**: WCAG AA compliant contrast ratios
- **Focus Indicators**: Visible focus rings on all interactive elements
- **Error States**: Clear visual and textual error indication

This implementation provides a robust, accessible, and performant location search and mapping solution for the Sawari platform.