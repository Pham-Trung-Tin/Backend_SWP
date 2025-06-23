import { Link } from 'react-router-dom';

export default function ExploreSection() {
  return (
    <section className="explore-section">
      <div className="container">
        <h2>Explore other support options</h2>
        <p>Wherever you are in Australia, there are supports and tools to help you quit.</p>
        <Link to="/support" className="circle-btn"><i className="fas fa-chevron-right"></i></Link>
      </div>
    </section>
  );
}
