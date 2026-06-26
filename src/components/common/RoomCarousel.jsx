import React,{useEffect,useState} from "react";
import { getAllRooms, roomPhotoSrc } from "../utils/ApiFunctions";
import { Carousel, Container, Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
 

const RoomCarousel =() =>{
    const[rooms,setRooms]= useState([])
    const[errorMessage,setErrorMessage] = useState("");
    const[isLoading,setIsLoading] = useState(true)

    useEffect(()=>{
       getAllRooms()
         .then((data) =>{
            // handle both array and paginated response { content: [] }
            const list = Array.isArray(data) ? data : (data?.content ?? []);
            setRooms(list)
         })
         .catch((error) =>{
            setErrorMessage(error.message)
         })
         .finally(() => {
            setIsLoading(false)
         })
    },[])
    if(isLoading){
        return<div className="mt-5">Loading rooms..</div>
    }
    if(errorMessage){
        return <div className=" text-danger mb-5 mt-5">Error: {errorMessage}</div>

    }
    return(
        <section className="room-carousel-block">
            <Link to={"/browse-all-rooms"} className="hotel-color d-block text-center fw-semibold mb-3">
            Parcourir toutes les chambres
            </Link>
            <Container>
                <Carousel indicators={false}>
                    {[...Array(Math.ceil(rooms.length / 4))].map((_, index) => (
                        <Carousel.Item key={index}>
                            <Row>
                                {rooms.slice(index * 4, index * 4 + 4).map((room) => {
                                    const photoSrc = roomPhotoSrc(room);
                                    return (
                                    <Col key={room.id} className ="mb-4" xs={12} md={6} lg={3}>
                                        <Card>
                                            <Link to={`/book-room/${room.id}`} className="d-block">
                                                {photoSrc ? (
                                                <Card.Img
                                                 variant="top" 
                                                 src={photoSrc}
                                                    alt="Room Photo"
                                                    className="w-100"
                                                    style={{ height: "200px", objectFit: "cover" }}
                                                />
                                                ) : (
                                                <div className="bg-secondary bg-opacity-25 w-100 d-flex align-items-center justify-content-center text-muted small" style={{ height: "200px" }}>Pas d&apos;image</div>
                                                )}
                                            </Link>
                                            <Card.Body>
                                                <Card.Title className="hotel-color">{room.roomType}</Card.Title>
                                                <Card.Text className="room-price">${room.roomPrice}/night</Card.Text>
                                                <div className="flex-shrink-0">
                                                    <Link  className="btn btn-sm btn-hotel" to={`/book-room/${room.id}`}>
                                                        Book Now
                                                    </Link>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    );
                                })}
                            </Row>
                        </Carousel.Item> 
                    ))}



                                    
                                       
                                   

                                           




                     
                </Carousel>
            </Container>
            </section>
    )
}


    export default RoomCarousel








