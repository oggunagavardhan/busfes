import { useState } from "react";
import User from "./user/users.jsx";
import Admin from "./admin/admin.jsx";
import Login from "./components/login.jsx";
// import "../src/App.css";



export default function App() {
  const [role, setRole] = useState(null);

  if (!role) {
    return <Login onLogin={setRole} />;
  }

  if (role === "admin") {
    return <Admin />;
  }

  return <User />;
}
