import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = { household: 'Household', collector: 'Collector', recycling_company: 'Recycling Co.', business: 'Business', admin: 'Admin' };

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/dashboard" className="navbar-brand">GreenLoop</NavLink>
        <div className="navbar-links">
          <NavLink to="/dashboard" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Dashboard</NavLink>
          <NavLink to="/marketplace" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Marketplace</NavLink>
          <NavLink to="/history" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>History</NavLink>
          <NavLink to="/ecopoints" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>EcoPoints</NavLink>
          <NavLink to="/rewards" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Rewards</NavLink>
          <NavLink to="/impact" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Impact</NavLink>
          <NavLink to="/goals" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Goals</NavLink>
          <NavLink to="/certificates" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Certificates</NavLink>
          <NavLink to="/material-guide" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Material Guide</NavLink>
          {['household','business','admin'].includes(user.role) && (
            <NavLink to="/my-listings" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>My Listings</NavLink>
          )}
          {user.role === 'admin' && (
            <NavLink to="/admin/categories" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Categories</NavLink>
          )}
          {user.role === 'admin' && (
            <NavLink to="/admin/rewards" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Rewards Mgmt</NavLink>
          )}
        </div>
        <div className="navbar-right">
          <span className="eco-badge">{user.ecoPoints || 0} pts</span>
          <span className="user-info">{user.name} <small>({ROLE_LABELS[user.role] || user.role})</small></span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
