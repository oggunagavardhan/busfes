// import { useState } from "react";
// import "../App.css";

// export default function Login({ onLogin }) {

//   const [role, setRole] = useState("user");
//   const [page, setPage] = useState("login"); // login | register | otp

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");

//   /* ===== SEND OTP ===== */
//   const sendOtp = async () => {

//     if (!email) {
//       alert("Enter email");
//       return;
//     }

//     try {
//       const res = await fetch(
//         `http://localhost:8080/api/auth/send-otp?email=${email}&role=${role}`,
//         { method: "POST" }
//       );

//       const msg = await res.text();
//       alert(msg);
//       setPage("otp");

//     } catch {
//       alert("Failed to send OTP");
//     }
//   };

//   /* ===== REGISTER USER ===== */
//   const registerUser = async () => {

//     if (!name || !email) {
//       alert("Fill all fields");
//       return;
//     }

//     try {

//       const res = await fetch(
//         "http://localhost:8080/api/auth/register",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             name: name,
//             email: email,
//             role: "user"
//           })
//         }
//       );

//       const msg = await res.text();

//       if (msg === "REGISTERED_SUCCESSFULLY") {
//         alert("🎉 Registration Success");
//         setPage("login");
//         setName("");
//         setEmail("");
//       }
//       else if (msg === "EMAIL_EXISTS") {
//         alert("Email already registered");
//       }
//       else {
//         alert(msg);
//       }

//     } catch {
//       alert("Registration failed");
//     }
//   };

//   /* ===== VERIFY OTP ===== */
//   const verifyOtp = async () => {

//     try {

//       const res = await fetch(
//         `http://localhost:8080/api/auth/verify-otp?email=${email}&otp=${otp}`,
//         { method: "POST" }
//       );

//       const result = await res.text();

//       if (result === "SUCCESS") {
//         onLogin(role);
//       } else {
//         alert("Invalid OTP");
//       }

//     } catch {
//       alert("OTP verification failed");
//     }
//   };

//   return (

//     <div className="center-screen">
//       <div className="login-card">

//         <h2 className="title">Online Bus Reservation</h2>

//         {/* ROLE */}
//         <div className="tab-buttons">

//           <button
//             className={role === "user" ? "active" : ""}
//             onClick={() => { setRole("user"); setPage("login"); }}
//           >
//             User
//           </button>

//           <button
//             className={role === "admin" ? "active" : ""}
//             onClick={() => { setRole("admin"); setPage("login"); }}
//           >
//             Admin
//           </button>

//         </div>

//         <hr />

//         {/* ===== LOGIN ===== */}
//         {page === "login" && (
//           <>
//             <h3>{role === "user" ? "User Login" : "Admin Login"}</h3>

//             <input
//               type="email"
//               placeholder="Enter Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />

//             <button onClick={sendOtp}>Send OTP</button>

//             {role === "user" && (
//               <p className="link" onClick={() => setPage("register")}>
//                 Create New Account?
//               </p>
//             )}
//           </>
//         )}

//         {/* ===== REGISTER ===== */}
//         {page === "register" && (
//           <>
//             <h3>User Register</h3>

//             <input
//               placeholder="Enter Name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//             />

//             <input
//               type="email"
//               placeholder="Enter Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />

//             <button onClick={registerUser}>Register</button>

//             <p className="link" onClick={() => setPage("login")}>
//               ← Back to Login
//             </p>
//           </>
//         )}

//         {/* ===== OTP ===== */}
//         {page === "otp" && (
//           <>
//             <h3>Enter OTP</h3>

//             <input
//               placeholder="Enter OTP"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//             />

//             <button onClick={verifyOtp}>Verify OTP</button>

//             <p className="link" onClick={() => setPage("login")}>
//               ← Back
//             </p>
//           </>
//         )}

//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { Container, Card, Button, Form, ToggleButton, ButtonGroup } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import "./login.css";


export default function Login({ onLogin }) {
  const [role, setRole] = useState("user");
  const [page, setPage] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  /* ===== SEND OTP ===== */
  const sendOtp = async () => {

  if (!email) return alert("Enter email");

  try {

    const res = await fetch(
      "http://localhost:8080/api/auth/send-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          role: role
        })
      }
    );

    alert(await res.text());
    setPage("otp");

  } catch {
    alert("Failed to send OTP");
  }
};


  /* ===== REGISTER ===== */
  const registerUser = async () => {
    if (!name || !email) return alert("Fill all fields");

    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role: "user" })
      });

      const msg = await res.text();
      if (msg === "REGISTERED_SUCCESSFULLY") {
        alert("🎉 Registration Success");
        setPage("login");
        setName(""); setEmail("");
      } else alert(msg);
    } catch {
      alert("Registration failed");
    }
  };

  /* ===== VERIFY OTP ===== */
  const verifyOtp = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/auth/verify-otp?email=${email}&otp=${otp}`,
        { method: "POST" }
      );
      if ((await res.text()) === "SUCCESS") onLogin(role);
      else alert("Invalid OTP");
    } catch {
      alert("OTP verification failed");
    }
  };

  return (
    <Container fluid className="login-bg">
      <motion.div
        className="login-3d-wrapper"
        whileHover={{ rotateY: 10, rotateX: -8 }}
        transition={{ type: "spring", stiffness: 120 }}
      >
        <Card className="login-card-3d">
          <Card.Body>

            <h3 className="text-center mb-3">🚌 Online Bus Reservation</h3>

            {/* ROLE SWITCH */}
            <ButtonGroup className="w-100 mb-3">
              {["user", "admin"].map(r => (
                <ToggleButton
                  key={r}
                  type="radio"
                  variant={role === r ? "primary" : "outline-primary"}
                  checked={role === r}
                  onClick={() => { setRole(r); setPage("login"); }}
                >
                  {r.toUpperCase()}
                </ToggleButton>
              ))}
            </ButtonGroup>

            <AnimatePresence mode="wait">

              {/* LOGIN */}
              {page === "login" && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                >
                  <Form>
                    <Form.Control
                      type="email"
                      placeholder="Enter Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mb-3"
                    />

                    <Button className="w-100" onClick={sendOtp}>
                      Send OTP
                    </Button>

                    {role === "user" && (
                      <div className="text-center mt-3 link3d"
                        onClick={() => setPage("register")}>
                        Create New Account?
                      </div>
                    )}
                  </Form>
                </motion.div>
              )}

              {/* REGISTER */}
              {page === "register" && (
                <motion.div
                  key="register"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  <Form>
                    <Form.Control
                      placeholder="Enter Name"
                      className="mb-2"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <Form.Control
                      type="email"
                      placeholder="Enter Email"
                      className="mb-3"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button className="w-100" onClick={registerUser}>
                      Register
                    </Button>
                    <div className="text-center mt-3 link3d"
                      onClick={() => setPage("login")}>
                      ← Back to Login
                    </div>
                  </Form>
                </motion.div>
              )}

              {/* OTP */}
              {page === "otp" && (
                <motion.div
                  key="otp"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                >
                  <Form>
                    <Form.Control
                      placeholder="Enter OTP"
                      className="mb-3"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <Button className="w-100" onClick={verifyOtp}>
                      Verify OTP
                    </Button>
                  </Form>
                </motion.div>
              )}

            </AnimatePresence>

          </Card.Body>
        </Card>
      </motion.div>
    </Container>
  );
}
