import React from "react";
import AddRoom from "./components/room/AddRoom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import ExistingRooms from "./components/room/ExistingRooms";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useLocation,
} from "react-router-dom";
import EditRoom from "./components/room/EditRoom";
import NavBar from "./components/layout/NavBar";
import Footer from "./components/layout/Footer";
import Home from "./components/home/Home";
import About from "./components/home/About";
import RoomListing from "./components/room/RoomListing";
import AdminDashboard from "./components/admin/AdminDashboard";
import RoomTypesAdmin from "./components/admin/RoomTypesAdmin";
import AccessoriesAdmin from "./components/admin/AccessoriesAdmin";
import BookingSuccess from "./components/bookings/BookingSuccess";
import BookingForm from "./components/bookings/BookingForm";
import BookingsList from "./components/bookings/BookingsList";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Profile from "./components/auth/Profile";
import Logout from "./components/auth/Logout";
import RequireAdmin from "./components/layout/RequireAdmin";
import RequireStaff from "./components/layout/RequireStaff";
import RequireLogin from "./components/layout/RequireLogin";
import AdminLayout from "./components/layout/AdminLayout";
import ReceptionLayout from "./components/layout/ReceptionLayout";
import ReceptionDashboard from "./components/reception/ReceptionDashboard";
import ReceptionClientHistory from "./components/reception/ReceptionClientHistory";
import ReceptionPlanning from "./components/reception/ReceptionPlanning";
import ReceptionistsAdmin from "./components/admin/ReceptionistsAdmin";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";

function AppContent() {
    const location = useLocation();
    const { isAdmin, isReceptionist } = useAuth();
    const p = location.pathname;
    const isAdminZone =
        p === "/admin" ||
        p.startsWith("/admin/") ||
        p === "/add-room" ||
        p === "/existing-rooms" ||
        p.startsWith("/edit-room");
    const isReceptionZone = p === "/reception" || p.startsWith("/reception/");
    const hidePublicChrome =
        (isAdmin && isAdminZone) ||
        (isReceptionist && isReceptionZone) ||
        (isAdmin && isReceptionZone);

    return (
        <>
            {!hidePublicChrome && <NavBar />}
            <div className={hidePublicChrome ? "" : "flex-grow-1"}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/book-room/:roomId" element={<BookingForm />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route element={<RequireLogin />}>
                        <Route path="/profile" element={<Profile />} />
                        <Route
                            path="/reservations"
                            element={<BookingsList variant="mine" />}
                        />
                    </Route>
                    <Route path="/browse-all-rooms" element={<RoomListing />} />
                    <Route path="/booking-success" element={<BookingSuccess />} />

                    <Route element={<RequireStaff />}>
                        <Route element={<ReceptionLayout />}>
                            <Route path="/reception" element={<ReceptionDashboard />} />
                            <Route
                                path="/reception/client-history"
                                element={<ReceptionClientHistory />}
                            />
                            <Route
                                path="/reception/planning"
                                element={<ReceptionPlanning />}
                            />
                            <Route
                                path="/reception/reservations"
                                element={<BookingsList variant="today" />}
                            />
                        </Route>
                    </Route>

                    <Route element={<RequireAdmin />}>
                        <Route element={<AdminLayout />}>
                            <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="/admin/room-types" element={<RoomTypesAdmin />} />
                            <Route path="/admin/accessories" element={<AccessoriesAdmin />} />
                            <Route
                                path="/admin/receptionists"
                                element={<ReceptionistsAdmin />}
                            />
                            <Route
                                path="/admin/reservations"
                                element={<BookingsList variant="all" />}
                            />
                            <Route path="/add-room" element={<AddRoom />} />
                            <Route path="/existing-rooms" element={<ExistingRooms />} />
                            <Route path="/edit-room/:roomId" element={<EditRoom />} />
                        </Route>
                    </Route>
                </Routes>
            </div>
            {!hidePublicChrome && <Footer />}
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <main className="site-main d-flex flex-column min-vh-100">
                    <AppContent />
                </main>
            </Router>
        </AuthProvider>
    );
}

export default App;
