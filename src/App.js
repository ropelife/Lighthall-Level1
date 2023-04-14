import { useState, useEffect } from 'react';

function App() {

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    window.alert('Please allow location access. It may take some time to load your geographic location.'); // display alert message
    setTimeout(() => {
      setIsLoaded(true);
    }, 3000); // wait for 3 seconds before setting the state to true
  }, []);

  const [clickCount, setClickCount] = useState(parseInt(localStorage.getItem('clickCount') || '0'));
  const [location, setLocation] = useState(JSON.parse(localStorage.getItem('location') || 'null'));
  const [cityCounts, setCityCounts] = useState(JSON.parse(localStorage.getItem('cityCounts') || '[]'));

  const handleClick = () => {
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    // get city name from latitude and longitude
    fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.latitude}&longitude=${location.longitude}&localityLanguage=en`)
      .then(response => response.json())
      .then(data => {
        const cityName = data.city;
        const countryName = data.countryName;
        const cityIndex = cityCounts.findIndex(cityCount => cityCount.cityName === cityName && cityCount.countryName === countryName);

        if (cityIndex === -1) {
          setCityCounts([...cityCounts, { cityName, countryName, count: 1 }]);
        } else {
          const newCityCounts = [...cityCounts];
          newCityCounts[cityIndex].count += 1;
          setCityCounts(newCityCounts);
        }
      });
  }

  useEffect(() => {
    if (!location) {
      // get user's current location
      navigator.geolocation.getCurrentPosition(position => {
        const newLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        setLocation(newLocation);
        localStorage.setItem('location', JSON.stringify(newLocation));
      });
    }
  }, [location]);

  useEffect(() => {
    localStorage.setItem('clickCount', clickCount);
  }, [clickCount]);

  useEffect(() => {
    localStorage.setItem('cityCounts', JSON.stringify(cityCounts));
  }, [cityCounts]);

  return (
      <div className='container'>
      <button onClick={handleClick} className="myButton btn btn-primary">Click Me</button>
      <p>Click count: {clickCount}</p>
      <h4>Distribution of clicks by Geographic Location:</h4>

      <table className='table-container'>
        <thead>
          <tr>
            <th>City</th>
            <th>Country</th>
            <th>Click Count</th>
          </tr>
        </thead>
        <tbody>
          {cityCounts.map(cityCount => (
            <tr key={`${cityCount.cityName}-${cityCount.countryName}`}>
              <td>{cityCount.cityName}</td>
              <td>{cityCount.countryName}</td>
              <td>{cityCount.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  
  );
}

export default App;
