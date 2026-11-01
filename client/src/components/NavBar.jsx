import { Link, NavLink } from "react-router-dom";

// The bar at the top of every page.
// NavLink is like Link, but it adds the class "active" to the link
// for the page you're on, so we can underline it in index.css.
const NavBar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        Shelf
      </Link>

      <div className="nav-links">
        {/* "end" means Home is only active on exactly "/" */}
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/search">Search</NavLink>
        <NavLink to="/shelf">My Shelf</NavLink>
      </div>
    </nav>
  );
};

export default NavBar;
