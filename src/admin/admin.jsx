import { useState, useEffect } from "react";
import "../App.css";

export default function Admin() {

  const [tab, setTab] = useState("dashboard");
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [seats, setSeats] = useState([]);
  const [busId, setBusId] = useState("");

  useEffect(() => {
    loadBookings();
    loadUsers();
  }, []);

  /* ================= LOAD DATA ================= */

  const loadBookings = async () => {
    const res = await fetch("/api/admin/bookings");
    setBookings(await res.json());
  };

  const loadUsers = async () => {
    const res = await fetch("/api/admin/users");
    setUsers(await res.json());
  };

  const loadSeats = async () => {
    if (!busId) return;

    const res = await fetch(`/api/admin/seats/${busId}`);
    setSeats(await res.json());
  };

  /* ================= APPROVE PAYMENT ================= */
  const approve = async (id) => {

    await fetch(`/api/booking/approve/${id}`, {
      method: "POST"
    });

    loadBookings();
  };

  /* ================= BLOCK USER ================= */
  const blockUser = async (id) => {

    await fetch(`/api/admin/block-user/${id}`, {
      method: "PUT"
    });

    loadUsers();
  };

  /* ================= TOGGLE SEAT ================= */
  const toggleSeat = async (seat) => {

    await fetch(`/api/admin/update-seat/${seat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booked: !seat.booked })
    });

    loadSeats();
  };

  /* ================= REVENUE ================= */
  const revenue = bookings
    .filter(b => b.status === "APPROVED")
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="app-body">

      <h2>Admin Dashboard</h2>

      {/* NAV */}
      <div className="admin-nav">
        <button onClick={() => setTab("dashboard")}>Dashboard</button>
        <button onClick={() => setTab("payments")}>Payments</button>
        <button onClick={() => setTab("seats")}>Seat Editor</button>
        <button onClick={() => setTab("users")}>Users</button>
      </div>

      {/* ================= DASHBOARD ================= */}
      {tab === "dashboard" && (
        <div>
          <div className="card">
            <h3>Total Revenue</h3>
            <p>₹{revenue}</p>
          </div>

          <div className="card">
            <h3>Total Bookings</h3>
            <p>{bookings.length}</p>
          </div>

          <div className="card">
            <h3>Pending Payments</h3>
            <p>{bookings.filter(b => b.status === "PENDING").length}</p>
          </div>
        </div>
      )}

      {/* ================= PAYMENT APPROVAL ================= */}
      {tab === "payments" && (
        <div>

          <h3>Payment Verification</h3>

          {bookings.map(b => (
            <div key={b.id} className="card">

              <p><b>Email:</b> {b.email}</p>
              <p><b>Seats:</b> {b.seats}</p>
              <p><b>Amount:</b> ₹{b.amount}</p>
              <p><b>Status:</b> {b.status}</p>

              {b.status === "PENDING" && (
                <button onClick={() => approve(b.id)}>
                  Approve Payment
                </button>
              )}

            </div>
          ))}

        </div>
      )}

      {/* ================= SEAT EDITOR ================= */}
      {tab === "seats" && (
        <div>

          <h3>Seat Layout Editor</h3>

          <input
            value={busId}
            onChange={e => setBusId(e.target.value)}
            placeholder="Enter Bus ID"
          />

          <button onClick={loadSeats}>Load Seats</button>

          <div className="seat-grid">
            {seats.map(seat => (
              <div
                key={seat.id}
                className={`seat-box ${seat.booked ? "is-booked" : ""}`}
                onClick={() => toggleSeat(seat)}
              >
                {seat.seatCode}
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ================= USERS ================= */}
      {tab === "users" && (
        <div>

          <h3>User Management</h3>

          {users.map(u => (
            <div key={u.id} className="card">

              <p><b>Name:</b> {u.name}</p>
              <p><b>Email:</b> {u.email}</p>
              <p><b>Status:</b> {u.status}</p>

              {u.status !== "BLOCKED" && (
                <button onClick={() => blockUser(u.id)}>
                  Block User
                </button>
              )}

            </div>
          ))}

        </div>
      )}

    </div>
  );
}
