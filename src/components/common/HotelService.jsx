import React from 'react';
import { Container, Row,Col } from 'react-bootstrap';
import Header from './Header';
import { FaClock, FaWifi, FaUtensils, FaTshirt, FaCocktail, FaDumbbell, FaSpa, FaParking, FaSnowflake } from 'react-icons/fa';
import { Card } from 'react-bootstrap';


const HotelService = () => {
    return (
        <>
        <Container className="mb-2">
            <Header title={"Our Services"} />

            <Row>
                <h4 className='text-center'>
                    Services at <span className='hotel-color'>SmartHotelPlus</span> 
                    <span className='gap-2'>
                        <FaClock  />- 24/7 Room Service
                    </span>
                    


                </h4>



            </Row>
            <hr />
            <Row xs={1} md={2} lg={3} className="g-4 mt-2">
                <Col>
                  <Card>
                    <Card.Body>
                      <Card.Title className="hotel-color">
                        <FaWifi />  Wi-Fi
                        </Card.Title>
                      <Card.Text>
                        Stay connected with our complimentary high-speed Wi-Fi available throughout the hotel.
                       </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col>
                  <Card>
                    <Card.Body>
                        <Card.Title className="hotel-color">
                        <FaUtensils/>  Breakfast
                        </Card.Title>
                        <Card.Text>
                        Our breakfast service offers a delightful selection of fresh, locally-sourced ingredients to start your day right.
                        </Card.Text>
                    </Card.Body>
                    </Card>
                </Col>
                <Col>
                  <Card>
                    <Card.Body> 
                        <Card.Title className="hotel-color">
                        <FaTshirt /> Laundry
                        </Card.Title>
                        <Card.Text>
                        Our laundry service ensures your clothes are clean and fresh, so you can enjoy your stay without any worries.
                        </Card.Text>
                    </Card.Body>
                    </Card>
                </Col>
                <Col>
                  <Card>
                    <Card.Body>
                        <Card.Title className="hotel-color">
                        <FaCocktail /> Bar
                        </Card.Title>
                        <Card.Text>
                        Unwind at our stylish bar, offering a wide selection of cocktails, wines, and spirits in a vibrant atmosphere.
                        </Card.Text>
                    </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card>
                    <Card.Body>
                        <Card.Title className="hotel-color">
                        <FaDumbbell /> Fitness Center
                        </Card.Title>
                        <Card.Text>
                        Stay active during your stay with our fully-equipped fitness center, featuring state-of-the-art equipment and a variety of workout options.
                        </Card.Text>
                    </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card>
                    <Card.Body>
                        <Card.Title className="hotel-color">
                        <FaSpa /> Spa
                        </Card.Title>
                        <Card.Text>
                        Indulge in relaxation at our luxurious spa, offering a range of treatments and therapies to rejuvenate your body and mind.
                        </Card.Text>
                    </Card.Body>
                    </Card>
                </Col>

                 <Col>
                    <Card>
                    <Card.Body>
                        <Card.Title className="hotel-color">
                        <FaParking /> Parking
                        </Card.Title>
                        <Card.Text>
                        Enjoy convenient and secure parking facilities available on-site for all our guests.
                        </Card.Text>
                    </Card.Body>
                    </Card>
                </Col>
                    <Col>
                    <Card>
                    <Card.Body>
                        <Card.Title className="hotel-color">
                        <FaSnowflake /> Air Conditioning
                        </Card.Title>
                        <Card.Text> 
                        Stay comfortable in our air-conditioned rooms, providing a cool and refreshing environment during your stay.
                        </Card.Text>
                    </Card.Body>
                    </Card>
                </Col>
                    



                
            </Row>       
        </Container>
        
        
        
        </>
    )
}
export default HotelService;