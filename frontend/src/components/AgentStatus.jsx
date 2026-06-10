export default function AgentStatus({
  currentAgent
}) {

  return (

    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "16px",
        marginTop: "20px",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.08)"
      }}
    >

      <h3>
        Research Progress
      </h3>

      <p
        style={{
          color: "#64748b"
        }}
      >
        Current Agent:
      </p>

      <h2>
        {currentAgent}
      </h2>

    </div>

  );
}