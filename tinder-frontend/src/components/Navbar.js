import { Link } from "react-router-dom";

function Navbar({ user, setUser }) {
  return (
    <nav>
      <Link to="/tinder">Tinder</Link>
      <Link to="/chat">Chat</Link>
      {user ? (
        <button onClick={() => setUser(null)}>Logout</button>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
}

export default Navbar;
