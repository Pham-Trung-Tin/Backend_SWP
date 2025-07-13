import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/global.css';

const Home = () => {
  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Wherever you are on your<br />quitting journey,</h1>
            <h2>Quit is here to help.</h2>
            <div className="button-list">
              <button className="journey-btn"><span className="arrow">›</span> I'm thinking about quitting</button>
              <button className="journey-btn"><span className="arrow">›</span> I'm ready to work out how to quit</button>
              <button className="journey-btn active"><span className="arrow">›</span> I need help to stay on track</button>
              <button className="journey-btn"><span className="arrow">›</span> I'm smoking or vaping again</button>
              <button className="journey-btn"><span className="arrow">›</span> I'm helping someone I know quit</button>
            </div>
          </div>
          <div className="hero-image">
            <img src="/image/hero/z6615164592770_23bb52960aba83a618474dce7ec08eee.jpg" alt="Student with backpack" />
          </div>
        </div>
      </section>
      
      <div className="scroll-down">
        <div className="container">
          <button className="scroll-btn"><i className="fas fa-chevron-down"></i></button>
        </div>
      </div>

      <section className="call-section">
        <div className="container">
          <h2>Call Quitline 13 7848</h2>
          <div className="support-now">
            <h3>Need support now? Contact Quit</h3>
            <p>There are many ways to connect with us wherever you are in Australia.</p>
            <Link to="/support" className="btn btn-primary">Get in touch</Link>
          </div>
        </div>
      </section>

      <section className="focus-section">
        <div className="container">
          <h2>In focus</h2>
          <div className="focus-cards">
            <div className="focus-card">
              <img src="/image/articles/a.jpg" alt="Mobile app" />
              <p>Free Quitbudy app to help you get and stay quit one day at a time.</p>
              <a href="#" className="learn-more">Use My QuitBuddy app <i className="fas fa-chevron-right"></i></a>
            </div>
            <div className="focus-card">
              <img src="/image/articles/b.jpg" alt="Vaping facts" />
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

      <section className="tools-section">
        <div className="container">
          <h2>Tools and resources</h2>
          <div className="tools-grid">
            <a href="#" className="tool-card">
              <div className="tool-icon"><i className="fas fa-file-alt"></i></div>
              <p>Your quit smoking plan</p>
              <div className="tool-dot"></div>
            </a>
            <a href="#" className="tool-card">
              <div className="tool-icon"><i className="fas fa-calculator"></i></div>
              <p>Cost of smoking</p>
              <div className="tool-dot"></div>
            </a>
            <a href="#" className="tool-card">
              <div className="tool-icon"><i className="fas fa-lungs"></i></div>
              <p>Effects of smoking on your body</p>
              <div className="tool-dot"></div>
            </a>
            <a href="#" className="tool-card">
              <div className="tool-icon"><i className="fas fa-file-alt"></i></div>
              <p>Your quit vaping plan</p>
              <div className="tool-dot"></div>
            </a>
            <a href="#" className="tool-card">
              <div className="tool-icon"><i className="fas fa-plus-circle"></i></div>
              <p>Benefits of quitting vaping</p>
              <div className="tool-dot"></div>
            </a>
            <a href="#" className="tool-card">
              <div className="tool-icon"><i className="fas fa-lungs"></i></div>
              <p>Effects of vaping on your body</p>
              <div className="tool-dot"></div>
            </a>
          </div>
        </div>
      </section>
      
      <section className="start-section">
        <div className="container">
          <h2>Start with</h2>
          <div className="start-cards">
            <div className="start-card">
              <img src="https://www.quit.org.au/uploads/images/couple-with-dog-sitting-grass-near-river.jpg" alt="Couple with dog" />
              <div className="card-content">
                <h3>It's hard to quit</h3>
                <p>Listen to your body, it's telling you it's time to quit! Cravings, planning, and knowing your triggers are all important first steps to quitting that...</p>
                <a href="#" className="read-more">Read more <i className="fas fa-chevron-right"></i></a>
              </div>
            </div>
            <div className="start-card">
              <img src="https://www.quit.org.au/uploads/images/happy-woman-smiling-and-looking-camera.jpg" alt="Happy woman" />
              <div className="card-content">
                <h3>Cigarette packaging in Australia has changed. Here's what you need to know.</h3>
                <p>From 1 July 2025 a range of new requirements will apply to tobacco products manufactured for sale in Australia...</p>
                <a href="#" className="read-more">Read more <i className="fas fa-chevron-right"></i></a>
              </div>
            </div>
            <div className="start-card">
              <img src="https://www.quit.org.au/uploads/images/two-young-women-smiling.jpg" alt="Two women smiling" />
              <div className="card-content">
                <h3>Tips to help you quit while vaping</h3>
                <p>Congratulations on deciding to quit vaping! To give you the best chance of success, here are some things to begin to get prepared...</p>
                <a href="#" className="read-more">Read more <i className="fas fa-chevron-right"></i></a>
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

      <section className="explore-section">
        <div className="container">
          <h2>Explore other support options</h2>
          <p>Wherever you are in Australia, there are supports and tools to help you quit.</p>
          <Link to="/support" className="circle-btn"><i className="fas fa-chevron-right"></i></Link>
        </div>
      </section>

      <div className="back-to-top">
        <a href="#top" className="back-link">Back to top of page <i className="fas fa-chevron-up"></i></a>
      </div>

      <footer>
        <div className="container">
          <div className="footer-top">
            <div className="footer-col">
              <h4>Looking for</h4>
              <ul>
                <li><a href="#">Quitting resources</a></li>
                <li><a href="#">In-language resources</a></li>
                <li><a href="#">Quitline referral</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>About Quit</h4>
              <ul>
                <li><a href="#">Our story</a></li>
                <li><a href="#">Newsroom</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Contact Quit</h4>
              <ul>
                <li><a href="#">Contact us</a></li>
                <li><a href="#">Media</a></li>
              </ul>
            </div>
            <div className="footer-col quitline">
              <img src="https://www.quit.org.au/images/default-source/default-album/call-quitlne.png" alt="Quitline 13 7848" />
              <div className="social-icons">
                <a href="#"><i className="fab fa-facebook-f"></i></a>
                <a href="#"><i className="fab fa-linkedin-in"></i></a>
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-youtube"></i></a>
                <a href="#"><i className="fab fa-instagram"></i></a>
              </div>
            </div>
          </div>

          <div className="footer-middle">
            <p>Quit acknowledges the traditional custodians of the lands on which we live and work. We pay our respects to Elders past, present, and emerging and extend that respect to all Aboriginal and Torres Strait Islander peoples.</p>
            <div className="aboriginal-flags">
              <img src="https://www.quit.org.au/images/default-source/default-album/aboriginal-flag.png" alt="Aboriginal Flag" />
              <img src="https://www.quit.org.au/images/default-source/default-album/torres-strait-island-flag.png" alt="Torres Strait Island Flag" />
              <img src="https://www.quit.org.au/images/default-source/default-album/aboriginal-torres-strait-island-flag.png" alt="Aboriginal and Torres Strait Island Flag" />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;