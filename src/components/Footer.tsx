function Footer() {
  return (
    <footer style={{ textAlign: "center", padding: "1rem", marginTop: "2rem", background: "#f5f5f5" }}>
      <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>
        © {new Date().getFullYear()} Built by <strong>Shafi</strong> and <strong>IUB Team</strong>
      </p>
    </footer>
  );
}

export default Footer;
