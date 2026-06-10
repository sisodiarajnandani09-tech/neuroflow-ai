export default function Sidebar({
  email,
  logout
}) {

  return (

    <div
      style={{
        width: "260px",
        background: "white",
        borderRadius: "20px",
        padding: "25px",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.08)"
      }}
    >

      <h2>
        NeuroFlow AI
      </h2>

      <hr />

      <p>
        Logged In As
      </p>

      <b>
        {email}
      </b>

      <button
        onClick={logout}
        style={{
          width: "100%",
          marginTop: "20px",
          padding: "12px",
          border: "none",
          borderRadius: "12px",
          cursor: "pointer"
        }}
      >
        Logout
      </button>

    </div>

  );
}