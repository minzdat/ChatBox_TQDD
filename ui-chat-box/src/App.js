import './App.css';
import React, { useEffect, useState, useRef} from 'react';
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
  const [firebaseData, setFirebaseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSpin, setShowSpin] = useState(true);

  const scrollContainerRef = useRef(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpin(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
    
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [firebaseData, loading]);

  const handleInputChange = (event) => {
    setApiUrl(event);
  };

  const fetchData = async () => {
    try {
      const firebaseResponse = await get(ref(database, 'valueProducts'));
      const dataProductFirebase = firebaseResponse.val();
      console.log(dataProductFirebase);
      if(dataProductFirebase.imageUrlProduct1 === '' && dataProductFirebase.imageUrlProduct2 === '' && dataProductFirebase.imageUrlProduct3 === ''){
        fetchData();
      } else {
        setFirebaseData((prevFirebaseData) => [...prevFirebaseData, dataProductFirebase]);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleButtonClick = async () => {
    if (apiUrl) {
      try {
        // Update inputTextUrl in Firebase
        await set(ref(database, 'inputTextUrl'), apiUrl);

        const listValueProduct = {
          imageUrlProduct1: '',
          imageUrlProduct2: '',
          imageUrlProduct3: '',
        };

        await set(ref(database, 'valueProducts'), listValueProduct); //put data to firebase

        setInputTextUrl((prevInputTextUrl) => [...prevInputTextUrl, apiUrl]);
  
        // Reset apiUrl and set loading to true
        setApiUrl('');
        setLoading(true);

        fetchData();
  
      } catch (error) {
        console.error("Error updating data in Firebase:", error);
      } 
    }
  };

  console.log(firebaseData);
  
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
                      <Avatar className='avatar-chat-box'  size={50}><FontAwesomeIcon beatFade icon={faRobot} size="2xl" style={{color: "#19c37d",}} /></Avatar>
                      <Spin size='large'/>
                    </>
                  ) : (
                    <>
                      <Avatar className='avatar-chat-box'  size={50}><FontAwesomeIcon icon={faRobot} size="2xl" style={{color: "#19c37d",}} /></Avatar>
                      <span  className='chat-message' >
                        Hello! I'm your virtual assistant. Please enter product information, I will advise on a few suitable products according to your requirements. Thank you for visiting!
                      </span >
                    </>
                  )}
                </Flex>
              </Flex>
              {inputTextUrl.map((apiUrl, index) => (         
                <div key={index}>
                  <Flex key={index} gap="middle" align="start" justify="end" className='row-message-user'>
                    <Flex justify='center' align='center'>
                      <span className='chat-message'>{apiUrl}</span>
                      <Avatar className='avatar-user-chat-box'  size={50}><FontAwesomeIcon icon={faUser} size='2xl' style={{color: "#17c7ff",}} /></Avatar>
                    </Flex>
                  </Flex>

                  {firebaseData[index] && (
                    <Flex gap="middle" align="start" justify="start" className='row-message-user'>
                      <Flex justify='center' align='flex-start'>
                        <Avatar className='avatar-chat-box' size={50}><FontAwesomeIcon icon={faRobot} size="2xl" style={{color: "#19c37d",}} /></Avatar>
                          <span className='chat-message'>
                            <p className='content-product-then-image'>I hope the product below matches your description. If you need any further assistance, please ask me more questions.</p>
                            <Row gutter={5}  justify="center">
                              <Col span={8}>
                                <Image className='img-product-firebase' width={200} src={firebaseData[index].imageUrlProduct1} alt="Product1" />
                              </Col>
                              <Col span={8}>
                                <Image className='img-product-firebase' width={200} src={firebaseData[index].imageUrlProduct2} alt="Product2" />
                              </Col>
                              <Col span={8}>
                                <Image className='img-product-firebase' width={200} src={firebaseData[index].imageUrlProduct3} alt="Product3" />
                              </Col>
                            </Row>
                          </span>
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
                          <p className='content-product-then-image'>I hope the product below matches your description. If you need any further assistance, please ask me more questions.</p>
                          <Row gutter={5}  justify="center">
                              <Col span={8}>
                                <Image className='img-product-firebase' width={200} src={product.imageUrlProduct1} alt="Product1" />
                              </Col>
                              <Col span={8}>
                                <Image className='img-product-firebase' width={200} src={product.imageUrlProduct2} alt="Product2" />
                              </Col>
                              <Col span={8}>
                                <Image className='img-product-firebase' width={200} src={product.imageUrlProduct3} alt="Product3" />
                              </Col>
                          </Row>
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
              <Col className="gutter-row" xs={20} sm={20} md={15} lg={15} xl={15} xxl={15}>
                  <TextArea
                    placeholder="Message ChatBox_TQDD..."
                    autoSize={{ minRows: 1, maxRows: 6 }}                
                    value={apiUrl}
                    onChange={(e) => handleInputChange(e.target.value)}
                    size="large"
                    className='text-area-seatch-chat-box'
                  />
              </Col>
              <Col className="gutter-row icon-search-footer" xs={0}>
                  <Tooltip title="search">
                    <Button 
                      onClick={handleButtonClick} 
                      type="dashed" 
                      shape="circle" 
                      icon={<SendOutlined />} 
                      size="large" 
                      loading = {loading}
                    />
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