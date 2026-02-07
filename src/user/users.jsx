import { useState, useEffect } from "react";
import "../App.css";

export default function Users() {

  /* OFFERS */
  const offers = [
    { code: "BUS50", desc: "₹50 OFF on first booking" },
    { code: "SAVE100", desc: "₹100 OFF on sleeper buses" },
    { code: "NIGHT20", desc: "20% OFF on night travel" },
    { code: "FEST150", desc: "₹150 Festival Special" },
    { code: "BUSY30", desc: "Flat 30% OFF" }
  ];

  const [screen, setScreen] = useState("search");

  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [buses, setBuses] = useState([]);

  const [selectedBus, setSelectedBus] = useState(null);
  const [lowerSeats, setLowerSeats] = useState([]);
  const [upperSeats, setUpperSeats] = useState([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);

  const [utr, setUtr] = useState("");
  const [email, setEmail] = useState("");

  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState("");

  /* SEARCH BUS */
  const searchBus = async () => {

    if (!fromCity || !toCity) return;

    const res = await fetch(`/api/bus/search?from=${fromCity}&to=${toCity}`);
    setBuses(await res.json());
    setScreen("buslist");
  };

  const openSeats = async (bus) => {

  setSelectedBus(bus);
  setSelectedSeatIds([]);
  setScreen("seats");

  const res = await fetch(`/api/seats/${bus.id}`);
  const data = await res.json();

  // handle BOTH backend formats safely
  if (data.lowerDeck) {
    setLowerSeats(data.lowerDeck);
    setUpperSeats(data.upperDeck);
  } else {
    setLowerSeats(
      data.filter(s => s.deck?.toUpperCase() === "LOWER")
    );

    setUpperSeats(
      data.filter(s => s.deck?.toUpperCase() === "UPPER")
    );
  }
};

  /* TOGGLE SEAT */
  const toggleSeat = (id) => {

    setSelectedSeatIds(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  const selectedSeats = [...lowerSeats, ...upperSeats]
    .filter(s => selectedSeatIds.includes(s.id));

  const totalAmount = selectedSeats.reduce(
    (sum, s) => sum + s.price, 0
  );

  /* PAYMENT */
  const submitPayment = async () => {

    if (!utr || !email) return alert("Enter UTR & Email");

    const payload = {
      busId: selectedBus.id,
      busName: selectedBus.busName,
      source: selectedBus.source,
      destination: selectedBus.destination,
      seats: selectedSeats.map(s => s.seatCode).join(", "),
      amount: totalAmount,
      email,
      upiId: utr
    };

    const res = await fetch("/api/booking/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    setBooking(data);
    setStatus(data.status);
    setScreen("booking");
  };

  /* AUTO REFRESH BOOKING STATUS */
  useEffect(() => {

    if (!booking?.id) return;

    const timer = setInterval(async () => {

      const res = await fetch(`/api/booking/${booking.id}`);
      const updated = await res.json();

      setBooking(updated);
      setStatus(updated.status);

    }, 4000);

    return () => clearInterval(timer);

  }, [booking]);

  return (
    <div className="app-body">

      {/* SEARCH */}
      {screen === "search" && (
        <div>
          <h2>Search Bus</h2>

          <input placeholder="From"
            value={fromCity}
            onChange={e => setFromCity(e.target.value)} />

          <input placeholder="To"
            value={toCity}
            onChange={e => setToCity(e.target.value)} />

          <button onClick={searchBus}>Search</button>
        </div>
      )}

      {/* BUS LIST */}
      {screen === "buslist" && (
        <div>
          <h2>Available Buses</h2>

          {buses.map(bus => (
            <div key={bus.id} className="card">

              <h3>{bus.busName}</h3>
              <p>{bus.source} → {bus.destination}</p>
              <p>₹{bus.price}</p>

              <button onClick={() => openSeats(bus)}>
                Book
              </button>

            </div>
          ))}

          <button onClick={() => setScreen("search")}>⬅ Back</button>
        </div>
      )}

      {/* SEATS */}
      {screen === "seats" && selectedBus && (
        <div className="seats-container">

          <h2>{selectedBus.busName}</h2>

          <h3>Lower Deck</h3>
          <div className="seat-grid">
            {lowerSeats.map(seat => (
              <div key={seat.id}
                className={`seat-box ${
                  seat.booked ? "is-booked" :
                  selectedSeatIds.includes(seat.id) ? "is-selected" : ""
                }`}
                onClick={() => !seat.booked && toggleSeat(seat.id)}
              >
                💺 {seat.seatCode}
                <small>₹{seat.price}</small>
              </div>
            ))}
          </div>

          <h3>Upper Deck</h3>
          <div className="seat-grid">
            {upperSeats.map(seat => (
              <div key={seat.id}
                className={`seat-box ${
                  seat.booked ? "is-booked" :
                  selectedSeatIds.includes(seat.id) ? "is-selected" : ""
                }`}
                onClick={() => !seat.booked && toggleSeat(seat.id)}
              >
                🛏 {seat.seatCode}
                <small>₹{seat.price}</small>
              </div>
            ))}
          </div>

          <div className="seat-summary">

            <p>
              Selected Seats :
              {selectedSeats.map(s => s.seatCode).join(", ") || "None"}
            </p>

            <p>Total : ₹{totalAmount}</p>

            <button
              disabled={!selectedSeatIds.length}
              onClick={() => setScreen("payment")}
            >
              Proceed Payment
            </button>
            {/* BACK BUTTON */}
            <button
  style={{
    marginTop: "10px",
    padding: "10px",
    width: "100%",
    background: "#ccc",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  }}
  onClick={() => setScreen("buslist")}
>
  Back
</button>


          </div>

        </div>
      )}

      {/* PAYMENT */}
{screen === "payment" && (
  <div className="payment">

    <h2>Pay ₹{totalAmount}</h2>

    {/* ===== QR CODE ===== */}
    <div style={{ textAlign: "center", margin: "20px 0" }}>
      
      <img
  src={`https://quickchart.io/qr?text=upi://pay?pa=7396469844@upi&pn=Busyatra&am=${totalAmount}&cu=INR&size=200`}
  alt="UPI QR"
/>


      <p style={{ marginTop: "10px", fontWeight: "bold" }}>
        UPI ID: 7396469844@upi
      </p>

    </div>

    {/* ===== UTR INPUT ===== */}
    <input
      placeholder="Enter UTR Number"
      value={utr}
      onChange={e => setUtr(e.target.value)}
      required
    />

    {/* ===== EMAIL INPUT ===== */}
    <input
      placeholder="Enter Email"
      value={email}
      onChange={e => setEmail(e.target.value)}
      required
    />

    <button
      onClick={() => {
        if (!utr || !email) {
          alert("UTR Number and Email are required!");
          return;
        }

        submitPayment();
      }}
    >
      Submit Payment
    </button>
    <button
      style={{
        marginTop: "10px",
        padding: "10px",
        width: "100%",
        background: "#ccc",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
      }}
      onClick={() => setScreen("seats")}   // change if needed
    >
      Back
    </button>

  </div>
)}


      {/* BOOKING */}
      {screen === "booking" && booking && (
        <div className="card">

          <h3>Status : {status}</h3>

          <p>{booking.busName}</p>
          <p>{booking.source} → {booking.destination}</p>
          <p>Seats : {booking.seats}</p>
          <p>Amount : ₹{booking.amount}</p>

        </div>
      )}

      {/* OFFERS */}
      {screen === "offers" && (
        <div>
          <h2>Offers</h2>

          {offers.map((o, i) => (
            <div key={i} className="card">
              <h3>{o.code}</h3>
              <p>{o.desc}</p>
            </div>
          ))}
        </div>
      )}

     {/* HELP */}
{screen === "help" && (
  
  <div>

    <h2>Raise Ticket</h2>

    <input placeholder="Reason" />
    <input placeholder="Mobile" />
    <input placeholder="Email" />

    <button>Submit Ticket</button>

    {/* SUPPORT CONTACT DIV */}
    <div
      style={{
        marginTop: "20px",
        padding: "15px",
        background: "#f5f5f5",
        borderRadius: "8px",
        textAlign: "center"
      }}
    >
      <h3>Support Contact</h3>

      <p>📧 Email: <b>support@busyatra.com</b></p>

      <p>📞 Phone: <b>+91 7396469844</b></p>

      <p>⏰ Support Time: 9:00 AM – 9:00 PM</p>

    </div>

  </div>
)}


      {/* ACCOUNT */}
      {screen === "account" && (
        <div>

          <div className="card">
            <h3>Personal Details</h3>
            <p>Name: User</p>
            <p>Email: user@gmail.com</p>
          </div>

          <div className="card">
            <h3>Wallet Balance</h3>
            <p>₹0</p>
          </div>

          <button onClick={() => setScreen("booking")}>
            My Booking
          </button>

        </div>
      )}

      {/* ⭐ NAV BAR */}
      <div className="bottom-nav">

        <button onClick={() => setScreen("search")}>🏠</button>

        <button onClick={() =>
          booking ? setScreen("booking") : alert("No Booking")
        }>🧾</button>

        <button onClick={() => setScreen("offers")}>🎁</button>

        <button onClick={() => setScreen("help")}>🛟</button>

        <button onClick={() => setScreen("account")}>👤</button>

      </div>

    </div>
  );
}