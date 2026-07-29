import { Link } from 'react-router-dom';

function Sidebar() {
    return (
        <aside className="bg-dark text-white d-flex flex-column" style={{ width: '250px' }}>
            <div className="p-3 border-bottom border-secondary" style={{ cursor: 'pointer' }}>
                <h5 className="mb-0">Grand Nusantara</h5>
                <small className="text-muted">Hotel FO</small>
            </div>

            <nav className="p-3 flex-grow-1">
                <p className="text-secondary small mb-2 fw-bold">MAIN</p>
                <ul className="nav flex-column mb-3">
                    <li className="nav-item">
                        <Link to="/" className="nav-link text-white px-2 py-1">Dashboard</Link>
                    </li>
                </ul>

                <p className="text-secondary small mb-2 fw-bold">DATA MASTER</p>
                <ul className="nav flex-column mb-3">
                    <li className="nav-item">
                        <Link to="/rooms" className="nav-link text-white px-2 py-1">Rooms</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/guests" className="nav-link text-white px-2 py-1">Guests</Link>
                    </li>
                </ul>

                <p className="text-secondary small mb-2 fw-bold">TRANSACTIONS</p>
                <ul className="nav flex-column">
                    <li className="nav-item">
                        <Link to="/reservations" className="nav-link text-white px-2 py-1">Reservations</Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
}

export default Sidebar;