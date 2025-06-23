import { Link } from 'react-router-dom';

export default function StartSection() {
  return (
    <section className="start-section">
      <div className="container">
        <h2>Start with</h2>
        <div className="start-cards">
          <div className="start-card">
            <img src="https://www.quit.org.au/uploads/images/couple-with-dog-sitting-grass-near-river.jpg" alt="Couple with dog" />
            <div className="card-content">
              <h3>It's hard to quit</h3>
              <p>Listen to your body, it's telling you it's time to quit! Cravings, planning, and knowing your triggers are all important first steps to quitting that...</p>
              <Link to="/resources" className="read-more">Read more <i className="fas fa-chevron-right"></i></Link>
            </div>
          </div>
          <div className="start-card">
            <img src="https://www.quit.org.au/uploads/images/happy-woman-smiling-and-looking-camera.jpg" alt="Happy woman" />
            <div className="card-content">
              <h3>Cigarette packaging in Australia has changed. Here's what you need to know.</h3>
              <p>From 1 July 2025 a range of new requirements will apply to tobacco products manufactured for sale in Australia...</p>              <Link to="/resources" className="read-more">Read more <i className="fas fa-chevron-right"></i></Link>
            </div>
          </div>
          <div className="start-card">
            <img src="https://www.quit.org.au/uploads/images/two-young-women-smiling.jpg" alt="Two women smiling" />
            <div className="card-content">
              <h3>Tips to help you quit while vaping</h3>
              <p>Congratulations on deciding to quit vaping! To give you the best chance of success, here are some things to begin to get prepared...</p>
              <Link to="/resources" className="read-more">Read more <i className="fas fa-chevron-right"></i></Link>
            </div>
          </div>
        </div>

        <div className="start-cards">
          <div className="start-card">
            <img src="https://www.quit.org.au/uploads/images/nicotine-replacement-therapy-nrt-products.jpg" alt="NRT products" />
            <div className="card-content">
              <h3>The health benefits of quitting smoking</h3>
              <p>When you quit, your body starts to repair. Find out about all the health benefits of quitting.</p>
              <a href="#" className="read-more">Read more <i className="fas fa-chevron-right"></i></a>
            </div>
          </div>
          <div className="start-card">
            <img src="https://www.quit.org.au/uploads/images/close-up-person-typing-laptop.jpg" alt="Person typing" />
            <div className="card-content">
              <h3>Cutting down to quit smoking</h3>
              <p>You may find the idea of quitting all at once overwhelming. Breaking it down into smaller steps is your way to quitting for good.</p>
              <a href="#" className="read-more">Read more <i className="fas fa-chevron-right"></i></a>
            </div>
          </div>
          <div className="start-card">
            <img src="https://www.quit.org.au/uploads/images/two-young-women-hugging.jpg" alt="Women hugging" />
            <div className="card-content">
              <h3>The cost of vaping: 4 ways quitting will improve your life</h3>
              <p>Quitting vaping can improve your health and wellbeing in unexpected ways. Here are 4 key ways quitting vaping will improve your life.</p>
              <a href="#" className="read-more">Read more <i className="fas fa-chevron-right"></i></a>
            </div>
          </div>
        </div>

        <div className="browse-all">
          <a href="#" className="btn btn-outline">Browse all articles</a>
        </div>
      </div>
    </section>
  );
}
