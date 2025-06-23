import { Link } from 'react-router-dom';

export default function ToolsSection() {
  return (
    <section className="tools-section">
      <div className="container">
        <h2>Tools and resources</h2>
        <div className="tools-grid">
          <Link to="/tools" className="tool-card">
            <div className="tool-icon"><i className="fas fa-file-alt"></i></div>
            <p>Your quit smoking plan</p>
            <div className="tool-dot"></div>
          </Link>
          <Link to="/tools" className="tool-card">
            <div className="tool-icon"><i className="fas fa-calculator"></i></div>
            <p>Cost of smoking</p>
            <div className="tool-dot"></div>
          </Link>
          <Link to="/tools" className="tool-card">
            <div className="tool-icon"><i className="fas fa-lungs"></i></div>
            <p>Effects of smoking on your body</p>
            <div className="tool-dot"></div>
          </Link>
          <Link to="/tools" className="tool-card">
            <div className="tool-icon"><i className="fas fa-file-alt"></i></div>
            <p>Your quit vaping plan</p>
            <div className="tool-dot"></div>
          </Link>
          <Link to="/tools" className="tool-card">
            <div className="tool-icon"><i className="fas fa-plus-circle"></i></div>
            <p>Benefits of quitting vaping</p>
            <div className="tool-dot"></div>
          </Link>
          <Link to="/tools" className="tool-card">
            <div className="tool-icon"><i className="fas fa-lungs"></i></div>
            <p>Effects of vaping on your body</p>
            <div className="tool-dot"></div>
          </Link>
        </div>
      </div>
    </section>
  );
}
