import React from "react";
import { Link } from "react-router-dom";

export default function BlogSection() {
  const blogPosts = [
    {
      id: 1,
      image: "/image/articles/OIP.jpg",
      date: "22 tháng 5, 2023",
      views: "10.304",
      title: "7 ngày đầu không thuốc lá – Làm thế nào để vượt qua?",
      excerpt:
        "Tuần đầu tiên luôn là giai đoạn khó khăn nhất. Hãy tìm hiểu những phương pháp hiệu quả để vượt qua cơn thèm thuốc...",
      url: "/blog/7-ngay-dau",
    },
    {
      id: 2,
      image: "/image/articles/th.jpg",
      date: "3 tháng 4, 2023",
      views: "8.214",
      title: "Chia sẻ từ một người đã bỏ thuốc 1 năm",
      excerpt:
        "Câu chuyện cảm động về hành trình 365 ngày không thuốc lá và những thay đổi tích cực trong cuộc sống...",
      url: "/blog/chia-se-1-nam",
    },
    {
      id: 3,
      image: "/image/hero/quit-smoking-2.png",
      date: "20 tháng 3, 2023",
      views: "9.827",
      title: "Thói quen thay thế giúp bạn không tái nghiện",
      excerpt:
        "Khám phá 10 thói quen lành mạnh có thể thay thế việc hút thuốc và giúp bạn duy trì lối sống không khói thuốc...",
      url: "/blog/thoi-quen-thay-the",
    },
  ];

  return (
    <section className="blog-section">
      {" "}
      <div className="container">
        <h2>Blog chia sẻ kinh nghiệm</h2>
        <p className="blog-subtitle">
          Khám phá những bài viết hữu ích từ cộng đồng người cai thuốc thành
          công
        </p>

        <div className="blog-grid">
          {blogPosts.map((post) => (
            <div key={post.id} className="blog-card">
              <div className="blog-image">
                <img src={post.image} alt={post.title} />
                <div className="blog-meta">
                  <span className="date">
                    <i className="far fa-calendar-alt"></i> {post.date}
                  </span>
                  <span className="views">
                    <i className="far fa-eye"></i> {post.views} lượt đọc
                  </span>
                </div>
              </div>
              <div className="blog-content">
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <Link to={post.url} className="read-more">
                  Đọc thêm <i className="fas fa-chevron-right"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="view-all-blogs">
          <Link to="/blog" className="btn btn-outline-blue">
            Xem tất cả bài viết <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}
