import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import Support from './components/Support';
import './App.css';
import './styles/global.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header>
          <div className="container">
            <div className="logo">
              <Link to="/">
                <img src="/image/logo/quit-logo.png" alt="Quit Logo" />
              </Link>
            </div>
            <div className="nav-actions">
              <a href="tel:137848" className="phone-link">CALL QUITLINE 13 7848</a>
              <button className="search-btn"><i className="fas fa-search"></i></button>
              <button className="info-btn"><i className="fas fa-info-circle"></i></button>
            </div>
          </div>
        </header>
        
        <nav>
          <div className="container">
            <ul className="main-menu">
              <li className={window.location.pathname === '/' ? 'active' : ''}>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/im-here-because">I'm here because...</Link>
              </li>
              <li className={window.location.pathname === '/support' ? 'active' : ''}>
                <Link to="/support">Get Support</Link>
              </li>
              <li>
                <Link to="/tools">Tools</Link>
              </li>
              <li>
                <Link to="/resources">Resources</Link>
              </li>
              <li>
                <Link to="/health-professionals">For Health Professionals</Link>
              </li>
              <li>
                <Link to="/communities">For Communities & Places</Link>
              </li>
            </ul>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/support" element={<Support />} />
          {/* Thêm các route khác ở đây khi cần */}
        </Routes>
        
        <button className="chat-btn"><i className="fas fa-comments"></i></button>
      </div>
    </Router>
  );
}

export default App;
