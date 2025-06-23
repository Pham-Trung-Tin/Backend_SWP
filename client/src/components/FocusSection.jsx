export default function FocusSection() {
  return (
    <section className="focus-section">
      <div className="container">
        <h2>In focus</h2>
        <div className="focus-cards">
          <div className="focus-card">
            <img src="image/articles/a.jpg" alt="Mobile app" />
            <p>Free Quitbudy app to help you get and stay quit one day at a time.</p>
            <a href="#" className="learn-more">Use My QuitBuddy app <i className="fas fa-chevron-right"></i></a>
          </div>
          <div className="focus-card">
            <img src="image/articles/b.jpg" alt="Vaping facts" />
            <p>Get the facts on vaping and the truth on vaping.</p>
            <a href="#" className="learn-more">Visit vapingfacts.org.au <i className="fas fa-chevron-right"></i></a>
          </div>
          <div className="focus-card">
            <img src="https://www.quit.org.au/uploads/images/beautiful-indian-family-mumy-daddy-home.jpg" alt="Family" />
            <p>Free support from Quitline. Supporting you when you quit and the people in support.</p>
            <a href="#" className="learn-more">Learn more <i className="fas fa-chevron-right"></i></a>
          </div>
          <div className="focus-card">
            <img src="https://www.quit.org.au/uploads/images/woman-vaping-image.jpg" alt="Woman vaping" />
            <p>Download resources and information to help free from smoking and vaping.</p>
            <a href="#" className="learn-more">Learn more <i className="fas fa-chevron-right"></i></a>
          </div>
        </div>
      </div>
    </section>
  );
}
