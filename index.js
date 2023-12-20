const express = require('express');
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Initial data for rooms, bookings, and customers
let rooms = [
    {
        roomId: "0",
        seatsAvailable: "4",
        amenities: "AC,Wi-fi,TV",
        pricePerhr: "100"
    },
    {
        roomId: "1",
        seatsAvailable: "10",
        amenities: "TV,Non-AC,Wi-fi",
        pricePerhr: "200"
    }
];

let bookings = [
    {
        customer: "Dhari",
        bookingDate: "28/10/2023",
        startTime: "10:00am",
        endTime: "12:00pm",
        bookingID: "A27",
        roomId: "0",
        status: "booked",
        booked_On: "25/10/2023"
    },
    {
        customer: "veena",
        bookingDate: "29/10/2023",
        startTime: "7:00am",
        endTime: "10.00pm",
        bookingID: "A28",
        roomId: "1",
        status: "booked",
        booked_On: "1/10/2023"
    }
];

let customers = [
    {
        name: 'Dhari',
        bookings: [
            {
                customer: "Dhari",
                bookingDate: "28/10/2023",
                startTime: "10:00am",
                endTime: "12:00pm",
                bookingID: "A27",
                roomId: "0",
                status: "booked",
                booked_On: "25/10/2023"
            }
        ]
    },
    {
        name: 'veena',
        bookings: [
            {
                customer: "veena",
                bookingDate: "29/10/2023",
                startTime: "7:00am",
                endTime: "10.00pm",
                bookingID: "A28",
                roomId: "1",
                status: "booked",
                booked_On: "1/10/2023"
            }
        ]
    }
];

// Endpoint to get a list of rooms
app.get('/rooms', (req, res) => {
    res.status(200).send({
        message: "Room List",
        rooms
    });
});

// Endpoint to add a new room
app.post('/rooms', (req, res) => {
    let data = req.body;
    let filteredData = rooms.filter((e) => e.roomId == data.roomId);
    if (filteredData.length === 0) {
        rooms.push(data);
        res.status(201).send({
            message: "Room created successfully"
        });
    } else {
        res.status(400).send({
            message: "Room Already Exists"
        });
    }
});

// Endpoint to book a room
app.post('/booking/:id', (req, res) => {
    try {
        const id = req.params.id;
        let bookRoom = req.body;
        let date = new Date();
        let dateFormat = date.toLocaleDateString();
        let idExist = rooms.find((e) => e.roomId === id);
        if (idExist === undefined) {
            res.status(400).send({
                message: "Room Does Not Exist.",
                RoomList: rooms
            });
        }
        let matchID = bookings.filter((b) => b.roomId === id);
        if (matchID.length === 0) {
            let dateCheck = matchID.filter((m) => m.bookingDate === bookRoom.bookingDate);
            if (dateCheck.length === 0) {
                let newID = "B" + (bookings.length + 1);
                let newBooking = { ...bookRoom, bookingID: newID, roomdID: id, status: "booked", booked_On: dateFormat };
                bookings.push(newBooking);
                res.status(201).send({
                    message: "Hall Booked",
                    Booking: bookings,
                    added: newBooking
                });
            } else {
                res.status(400).send({
                    message: "Hall already booked for this date, Choose another hall",
                    Bookings: bookings
                });
            }

        } else {
            let newID = "B" + (bookings.length + 1);
            let newbooking = { ...bookRoom, bookingID: newID, roomId: id, status: "booked", booked_On: dateFormat };
            bookings.push(newbooking);
            const customerdetails = customers.find(cust =>
                cust.name === newbooking.customer);
            if (customerdetails) {
                customerdetails.bookings.push(newbooking);
            } else {
                customers.push({ name: newbooking.customer, bookings: [newbooking] });
            }
            res.status(201).send({
                message: "hall booked",
                Bookings: bookings,
                added: newbooking
            });
        }
    } catch (error) {
        res.status(400).send({
            message: "Error in Booking Room",
            Error: error,
            date: bookings
        });
    }
});

// Endpoint to view booked rooms
app.get('/viewbooking', (req, res) => {
    const bookedRooms = bookings.map(booking => {
        const { roomId, Status, customer, bookingDate, startTime, endTime } = booking;
        return { roomId, Status, customer, bookingDate, startTime, endTime }
    });
    res.status(201).send({
        Message: bookedRooms
    });
});

// Endpoint to get a list of customers and their bookings
app.get('/customers', (req, res) => {
    const customerBookings = customers.map(customer => {
        const { name, bookings } = customer;
        const customerDetails = bookings.map(bookings => {
            const { roomId, bookingDate, startTime, endTime } = bookings;
            return { name, roomId, bookingDate, startTime, endTime };
        });
        return customerDetails;
    });
    res.send({ customerBookings });
});

// Endpoint to get bookings for a specific customer
app.get('/customers/:name', (req, res) => {
    const { name } = req.params;
    const customer = customers.find(cust => cust.name === name);
    if (!customer) {
        res.status(404).send({ error: 'Customer not found' });
        return;
    }
    const customerBookings = customer.bookings.map(booking => {
        const { customer, roomId, startTime, endTime, bookingID, status, bookingDate, booked_On } = booking;
        return { customer, roomId, startTime, endTime, bookingID, status, bookingDate, booked_On };
    });
    count = customerBookings.length;
    res.send({
        Message: `${name} booked ${count} time(s)`,
        Customer: customerBookings
    });
});

// Start the server on port 5000
app.listen(5000, () => console.log(" Server listening to port 5000"));
