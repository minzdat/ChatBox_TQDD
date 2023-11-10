import './App.css';
import React, { useEffect,useState } from 'react';
import axios from 'axios';
import { database, ref, get, set } from './firebase'; 

function App() {

  const [apiUrl, setApiUrl] = useState('https://www.adidas.com/us/own-the-run-shorts/FS9807.html');

  useEffect(() => {
    const fetchData = async () => {
      try {

        const response = await axios.get(apiUrl);
        const htmlData = response.data;

        const regexName = /<h1[^>]*class="name___120FN"[^>]*><span>([^<]+)<\/span><\/h1>/;
        const matchName = htmlData.match(regexName);

        const regexPrice = /<div class="gl-price-item gl-price-item--sale notranslate[^>]*>(.*?)<\/div>/;
        const matchPrice = htmlData.match(regexPrice);

        const regexColor = /<div\s+data-auto-id="color-label"[^>]*>(.*?)<\/div>/;
        const matchColor = htmlData.match(regexColor);

        const regexImageUrl = /<div class="content___3m-ue" data-auto-id="pdp__image-viewer__desktop-zoom__content"[^>]*><picture[^>]*><source[^>]*><img src="([^"]+)"[^>]*>/;
        const matchImageUrl = htmlData.match(regexImageUrl);

        if (matchName || matchPrice || matchColor || matchImageUrl) {
          const listValueProduct = {
            nameProduct: matchName[1],
            priceProduct: matchPrice[1],
            colorProduct: matchColor[1],
            imageUrlProduct: matchImageUrl[1],
          };

        await set(ref(database, 'valueProducts'), listValueProduct);

        const firebaseResponse = await get(ref(database, 'valueProducts'));
        const firebaseData = firebaseResponse.val();
        console.log('Firebase Data:', firebaseData);

        } else {
          console.error('Product not found in HTML');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [apiUrl]);

  const handleInputChange = (event) => {
    setApiUrl(event.target.value);
  };

  console.log(apiUrl);

  return (
    <div className="App">
      <header className="App-header">
        <input type="text" value={apiUrl} onChange={handleInputChange} />      
      </header>
    </div>
  );
}

export default App;
