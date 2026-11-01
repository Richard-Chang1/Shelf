import { Link } from "react-router-dom";

// Shown when the URL doesn't match any page
const NotFound = () => {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p className="muted">This page isn't on the shelf.</p>
      <Link to="/">Back to Home</Link>
    </div>
  );
};

export default NotFound;