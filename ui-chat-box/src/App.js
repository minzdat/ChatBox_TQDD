import './App.css';
import React, { useEffect, useState, useRef} from 'react';
import axios from 'axios';
import { database, ref, get, set } from './firebase'; 
import { Layout, Input, Button, Tooltip, Col, Row, Avatar, Flex, Spin, Image} from 'antd';
import { SendOutlined} from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faUser } from '@fortawesome/free-solid-svg-icons';

const { Header, Content, Footer } = Layout;
const { TextArea } = Input;

function App() {

  const [apiUrl, setApiUrl] = useState(null);
  const [inputTextUrl, setInputTextUrl] = useState([]);
  const [htmlData, setHtmlData] = useState(null);
  const [firebaseData, setFirebaseData] = useState([]);
  const [loading, setLoading] = useState();
  const [showSpin, setShowSpin] = useState(true);
  const [dataFound, setDataFound] = useState(true);

  const scrollContainerRef = useRef(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpin(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log('data1');
    if (inputTextUrl.length > 0 && !isUrlValid(apiUrl)) {
      setFirebaseData((prevFirebaseData) => {
        return [...prevFirebaseData, 'Invalid URL. Please enter a valid URL'];
      });
    } else if(inputTextUrl.length > 0 && dataFound === false){
      setFirebaseData((prevFirebaseData) => {
        return [...prevFirebaseData, 'Product not found in HTML'];
      });
    }
  }, [inputTextUrl, dataFound, apiUrl]);

  useEffect(() => {
    console.log('data2');
    const fetchData = async () => {
      try {
        
        if(htmlData) {

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

            await set(ref(database, 'valueProducts'), listValueProduct); //put data to firebase
            const firebaseResponse = await get(ref(database, 'valueProducts'));  //get data from firebase then processing
            setFirebaseData((prevFirebaseData) => [...prevFirebaseData, firebaseResponse.val()]);
          } else {
            console.error('Product not found in HTML');
            setDataFound(false);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false)
    };

    fetchData();
  }, [htmlData]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [firebaseData, loading]);

  const isUrlValid = (url) => {
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    return urlRegex.test(url);
  };

  const handleInputChange = (event) => {
    setApiUrl(event);
  };

  const handleButtonClick = async () => {
    try {
      if(apiUrl) {
        setInputTextUrl((prevInputTextUrl) => [...prevInputTextUrl, apiUrl]);
        if(isUrlValid(apiUrl)){
          setLoading(true);
          setDataFound(true);
          const response = await axios.get(apiUrl); //crawl data from website
          setHtmlData(response.data);
        }
      }
    }
    catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSend = () => {
    setInputTextUrl('');
  }

  return (
    <div className="App">
      <div className='App-content'>
        <Layout className='layout-app'>

          <Header className='header-app'>  
            <FontAwesomeIcon bounce icon={faRobot} size="xl" style={{ color: "#19c37d", position: 'absolute', left: '40', top: '20' }} />
            <span>ChatBox_TQDD</span>
          </Header>

          <Content className="site-layout content-app"> 
            <div ref={scrollContainerRef} className='display-content-chat-box'>
              <Flex gap="middle" align="start" justify="start" className='row-message-user'>
                <Flex justify='center' align='flex-start'>
                  {showSpin ? (
                    <>
                      <Avatar className='avatar-chat-box' size={50}><FontAwesomeIcon beatFade icon={faRobot} size="2xl" style={{color: "#19c37d",}} /></Avatar>
                      <Spin size='large'/>
                    </>
                  ) : (
                    <>
                      <Avatar className='avatar-chat-box' size={50}><FontAwesomeIcon icon={faRobot} size="2xl" style={{color: "#19c37d",}} /></Avatar>
                      <span className='chat-message'>
                        Hello! I'm your virtual assistant. Please enter the product URL, and I will provide detailed information and advice for you. Thank you for visiting!
                      </span>
                    </>
                  )}
                </Flex>
              </Flex>
              {inputTextUrl.map((apiUrl, index) => (         
                <div key={index}>
                  <Flex key={index} gap="middle" align="start" justify="end" className='row-message-user'>
                    <Flex justify='center' align='center'>
                      <span className='chat-message'>{apiUrl}</span>
                      <Avatar className='avatar-user-chat-box' size={50}><FontAwesomeIcon icon={faUser} size='2xl' style={{color: "#17c7ff",}} /></Avatar>
                    </Flex>
                  </Flex>
                  {firebaseData[index] && (
                    <Flex gap="middle" align="start" justify="start" className='row-message-user'>
                      <Flex justify='center' align='flex-start'>
                        <Avatar className='avatar-chat-box' size={50}><FontAwesomeIcon icon={faRobot} size="2xl" style={{color: "#19c37d",}} /></Avatar>
                        {firebaseData[index].nameProduct || firebaseData[index].colorProduct || firebaseData[index].priceProduct ? (
                          <span className='chat-message'>
                            <Flex key={index} gap="middle" align="start" justify="start" className='row-message-user'>
                              <Flex justify='center' align='flex-start'>
                                {firebaseData[index].imageUrlProduct && <Image className='img-product-firebase' width={200} src={firebaseData[index].imageUrlProduct} alt="Product" />}
                                <div className='content-product-then-image'>
                                  <strong>Product's name: </strong>{firebaseData[index].nameProduct} <br/>
                                  <strong>Product color: </strong>{firebaseData[index].colorProduct} <br/>
                                  <strong>Product price: </strong>{firebaseData[index].priceProduct} <br/>
                                </div>
                              </Flex>
                            </Flex>
                          </span>
                        ) : (
                        <Flex gap="middle" align="start" justify="start" className='row-message-user'>
                          <Flex justify='center' align='flex-start'>
                            <span className='chat-message'>
                              {firebaseData[index]}
                            </span>
                          </Flex>
                        </Flex>
                        )}
                      </Flex>
                    </Flex>
                  )}
                </div>
              ))}
              {loading ? (
                <Flex gap="middle" align="start" justify="start" className='row-message-user'>
                  <Flex justify='center' align='flex-start'>
                    <Avatar className='avatar-chat-box' size={50}><FontAwesomeIcon beatFade icon={faRobot} size="2xl" style={{color: "#19c37d",}} /></Avatar>
                    <Spin size='large'/>
                  </Flex>
                </Flex>
              ) : (
                <div>
                  {firebaseData.slice(inputTextUrl.length).map((product, index) => (
                    <Flex key={index} gap="middle" align="start" justify="start" className='row-message-user'>
                      <Flex justify='center' align='flex-start'>
                        <Avatar className='avatar-chat-box' size={50}><FontAwesomeIcon icon={faRobot} size="2xl" style={{color: "#19c37d",}} /></Avatar>
                        <span className='chat-message'>
                          <Flex key={index} gap="middle" align="start" justify="start" className='row-message-user'>
                            <Flex justify='center' align='flex-start'>
                              {product.imageUrlProduct && <Image className='img-product-firebase' width={200} src={firebaseData[index].imageUrlProduct} alt="Product" />}
                              <div className='content-product-then-image'>
                                <strong>Product's name: </strong>{product.nameProduct} 
                                <strong>Product color: </strong>{product.colorProduct} 
                                <strong>Product price: </strong>{product.priceProduct} 
                              </div>
                            </Flex>
                          </Flex>
                        </span>
                      </Flex>
                    </Flex>
                  ))}
                </div>
              )}
            </div>
          </Content>

          <Footer className='footer-chat-box'>
            <Row gutter={5} justify={'center'}>
              <Col className="gutter-row" span={10}>
                  <TextArea
                    placeholder="Enter the product URL you want to search for"
                    autoSize={{ minRows: 1, maxRows: 6 }}                    
                    onChange={(e) => handleInputChange(e.target.value)}
                    size="large"
                    className='text-area-seatch-chat-box'
                  />
                  <Button onClick={handleSend}></Button>
              </Col>
              <Col className="gutter-row icon-search-footer" span={1}>
                  <Tooltip title="search">
                    {loading ?(
                    <Button 
                      // onClick={handleButtonClick} 
                      type="dashed" 
                      shape="circle" 
                      icon={<SendOutlined />} 
                      size="large" 
                      loading
                    />
                    ) : (
                      <Button 
                        onClick={handleButtonClick} 
                        type="dashed" 
                        shape="circle" 
                        icon={<SendOutlined />} 
                        size="large"
                      />
                    )}
                  </Tooltip>
              </Col>
            </Row>
          </Footer>

        </Layout>
      </div>   
    </div>
  );
}

export default App;
