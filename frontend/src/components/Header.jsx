import { useNavigate } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();

    return (
        <header className="navbar navbar-dark bg-dark px-4 py-3 shadow-sm">
            <div className="d-flex align-items-center">
                <h5 className="text-white mb-0">Dashboard Overview</h5>
            </div>
            <div className="d-flex align-items-center">
                <button onClick={() => navigate('/profile')} className="btn btn-outline-light btn-sm me-2">
                    Luth (Staff)
                </button>
                <button className="btn btn-danger btn-sm">Logout</button>
            </div>
        </header>
    );
}

export default Header;