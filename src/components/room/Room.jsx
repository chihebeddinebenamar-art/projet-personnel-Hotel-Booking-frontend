import React, { useState, useEffect } from "react";
import { Container, Row, Col } from 'react-bootstrap';
import NavBar from "../layout/NavBar";
import RoomCard from "./RoomCard";
import { getAllRooms } from "../utils/ApiFunctions";
import RoomFilter from "../common/RoomFilter";
import RoomPaginator from "../common/RoomPaginator";

const Room = () => {
    const [data, setData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null) 
    const [filteredData, setFilteredData] = useState([{id: "" }])
    const [currentPage, setCurrentPage] = useState(1)
    const [roomsPerPage] = useState(6)

    useEffect(() => {
            getAllRooms().then((data) => {
                setData(data)
                setFilteredData(data)
                setIsLoading(false)
            }).catch((error) => {
                setError(error.message)
                setIsLoading(false)
            })
    }, [])
    if (isLoading) {
        return <div>Loading...</div>
    }
    if (error) {
        return <div className="text-danger">Error: {error}</div>
    }

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber)
    }

    const handleFilterChange = (roomType) => {
        if (!roomType) {
            setFilteredData(data)
        } else {
            setFilteredData(data.filter((r) => r.roomType === roomType))
        }
        setCurrentPage(1)
    }

    const totalPages = Math.ceil(filteredData.length / roomsPerPage)
    const renderRooms = () => {
        const startIndex = (currentPage - 1) * roomsPerPage
        const endIndex = startIndex + roomsPerPage
        return filteredData
        .slice(startIndex, endIndex)
        .map((room) => <RoomCard key={room.id} room={room} /> )
       
    }

    return (
        <Container>
            <Row>
                <Col md ={6} className=" mb-3 mb-md-0 ">
                <RoomFilter data={data} onFilterChange={handleFilterChange} />
                </Col>

                <Col md={6} className=" d-flex align-items-center justify-content-md-end">
                <RoomPaginator 
                totalPages={totalPages} 
                currentPage={currentPage} 
                onPageChange={handlePageChange} 
                />
                </Col>
            </Row>

            <Row>    {renderRooms()} </Row>
                <Row>
                      <Col md={6} className=" d-flex align-items-center justify-content-md-end">
                <RoomPaginator 
                totalPages={totalPages} 
                currentPage={currentPage} 
                onPageChange={handlePageChange} 
                />
                </Col>

             


                
                
                
                
                
               




            </Row>



        </Container>
    )
    }
export default Room
