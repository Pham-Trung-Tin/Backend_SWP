export default function ScrollDown() {
  const scrollToNextSection = () => {
    // Tìm phần tử đầu tiên sau hero section
    const heroSection = document.querySelector('.nosmoke-hero');
    if (heroSection) {
      const nextSection = heroSection.nextElementSibling;
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="scroll-down">
      <div className="container">
        <button className="scroll-btn" onClick={scrollToNextSection}>
          <i className="fas fa-chevron-down"></i>
        </button>
      </div>
    </div>
  );
}
