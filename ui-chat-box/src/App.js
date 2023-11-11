import './App.css';
import React, { useEffect,useState } from 'react';
import axios from 'axios';
import { database, ref, get, set } from './firebase'; 
import { Layout, Input, Button, Tooltip, Col, Row, message, Avatar, Space, Flex, Spin, Image } from 'antd';
import { SendOutlined, UserOutlined, RobotFilled } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { TextArea } = Input;

function App() {

  const [apiUrl, setApiUrl] = useState(null);
  const [htmlData, setHtmlData] = useState(null);
  const [inputTextUrl, setInputTextUrl] = useState([]);
  const [firebaseData, setFirebaseData] = useState([]);
  const [loading, setLoading] = useState();
  const [showSpin, setShowSpin] = useState(true);



  const isUrlValid = (url) => {
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    return urlRegex.test(url);
  };

  useEffect(() => {
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
            const firebaseResponse = await get(ref(database, 'valueProducts'));  //call data from firebase then processing
            setFirebaseData((prevFirebaseData) => [...prevFirebaseData, firebaseResponse.val()]);
          } else {
            console.error('Product not found in HTML');
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
    const timer = setTimeout(() => {
      setShowSpin(false);
    }, 1000);

    // Clear the timer on component unmount or when it's not needed anymore
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (event) => {
    setApiUrl(event);
  };

  const handleButtonClick = async () => {
    try {
      if(apiUrl) {
        if(isUrlValid(apiUrl)){
          setLoading(true);

          setInputTextUrl((prevInputTextUrl) => [...prevInputTextUrl, apiUrl]);

          const response = await axios.get(apiUrl); //crawl data from website
          setHtmlData(response.data);
        }
        else {
            message.error('Invalid URL. Please enter a valid URL.');
        }
      }
    }
    catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  console.log('Firebase Data:', firebaseData);

  return (
    <div className="App">
      <div className='App-content'>
        <Layout className='layout-app'>
          <Header className='header-app'>     
          </Header>
          <Content className="site-layout content-app">

            <div className='display-content-chat-box'>

            <Flex gap="middle" align="start" justify="start" className='row-message-user'>
              <Flex justify='center' align='flex-start'>
                <Avatar className='avatar-chat-box' icon={<RobotFilled />} size={35} />
                {showSpin ? (
                  <Spin/>
                ) : (
                  <span className='chat-message'>
                    Hello! I'm your virtual assistant. Please enter the product URL, and I will provide detailed information and advice for you. Thank you for visiting!
                  </span>
                )}
              </Flex>
            </Flex>

              {inputTextUrl.map((apiUrl, index) => (
                <div key={index}>
                <Flex key={index} gap="middle" align="start" justify="end" className='row-message-user'>
                  <Flex justify='center' align='center'>
                    <span className='chat-message'>{apiUrl}</span>
                    <Avatar className='avatar-user-chat-box' icon={<UserOutlined />} size={35}/>
                  </Flex>
                </Flex>

                  {firebaseData[index] && (
                    <Flex gap="middle" align="start" justify="start" className='row-message-user'>
                      <Flex justify='center' align='flex-start'>
                        <Avatar className='avatar-chat-box' icon={<RobotFilled />} size={35} />
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
                      </Flex>
                    </Flex>
                  )}
                </div>
              ))}
              {loading ? (
                <Flex gap="middle" align="start" justify="start" className='row-message-user'>
                  <Flex justify='center' align='flex-start'>
                    <Avatar className='avatar-chat-box' icon={<RobotFilled />} size={35} />
                    <Spin/>
                  </Flex>
                </Flex>
              ) : (
                <div>
                  {firebaseData.slice(inputTextUrl.length).map((product, index) => (
                    <Flex key={index} gap="middle" align="start" justify="start" className='row-message-user'>
                      <Flex justify='center' align='flex-start'>
                        <Avatar className='avatar-chat-box' icon={<RobotFilled />} size={35} />
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
          <Footer style={{ textAlign: 'center' }}>

            <Row gutter={5} justify={'center'}>
              <Col className="gutter-row icon-search-footer" span={1}>
                <Space size={16} wrap>
                  <Avatar icon={<UserOutlined />} size={40}/>
                </Space>
              </Col>
              <Col className="gutter-row" span={10}>
                  <TextArea
                    placeholder="Enter the product URL you want to search for"
                    autoSize={{ minRows: 1, maxRows: 6 }}                    
                    onChange={(e) => handleInputChange(e.target.value)}
                    size="large"
                  />
              </Col>
              <Col className="gutter-row icon-search-footer" span={1}>
                  <Tooltip title="search">
                    <Button onClick={handleButtonClick} type="primary" shape="circle" icon={<SendOutlined />} size="large"/>
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
