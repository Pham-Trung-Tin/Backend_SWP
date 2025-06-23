import React from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaEye, FaHeart, FaComment } from "react-icons/fa";
import "./Blog.css";

export default function Blog() {
  // Dữ liệu mẫu cho bài viết blog
  //yeye
  const blogPosts = [
    {
      id: 1,
      image: "/image/articles/OIP.jpg",
      title: "7 ngày đầu không thuốc lá – Làm thế nào để vượt qua?",
      excerpt:
        "Tuần đầu tiên luôn là giai đoạn khó khăn nhất. Hãy tìm hiểu những phương pháp hiệu quả để vượt qua cơn thèm thuốc và duy trì quyết tâm cai thuốc lá của bạn.",
      author: "BS. Nguyễn Minh",
      date: "22 tháng 5, 2023",
      views: "10.304",
      likes: "826",
      comments: "58",
      category: "experience",
      url: "/blog/7-ngay-dau",
    },
    {
      id: 2,
      image: "/image/articles/r.jpg",
      title: "Chia sẻ từ một người đã bỏ thuốc 1 năm",
      excerpt:
        "Câu chuyện cảm động về hành trình 365 ngày không thuốc lá và những thay đổi tích cực trong cuộc sống, sức khỏe và mối quan hệ của một người đã thành công.",
      author: "Lê Thu Thảo",
      date: "3 tháng 4, 2023",
      views: "8.214",
      likes: "650",
      comments: "47",
      category: "success",
      url: "/blog/chia-se-1-nam",
    },
    {
      id: 3,
      image: "/image/hero/quit-smoking-2.png",
      title: "Thói quen thay thế giúp bạn không tái nghiện",
      excerpt:
        "Khám phá 10 thói quen lành mạnh có thể thay thế việc hút thuốc và giúp bạn duy trì lối sống không khói thuốc trong thời gian dài.",
      author: "Trần An Nhiên",
      date: "20 tháng 3, 2023",
      views: "9.827",
      likes: "712",
      comments: "39",
      category: "tips",
      url: "/blog/thoi-quen-thay-the",
    },
    {
      id: 4,
      image: "/image/articles/th.jpg",
      title: "Tác hại của thuốc lá điện tử - Sự thật bạn nên biết",
      excerpt:
        "Nhiều người nghĩ rằng thuốc lá điện tử an toàn hơn thuốc lá thông thường. Hãy cùng tìm hiểu sự thật về những tác hại của chúng.",
      author: "BS. Nguyễn Văn Chung",
      date: "15 tháng 3, 2023",
      views: "12.102",
      likes: "945",
      comments: "86",
      category: "health",
      url: "/blog/tac-hai-thuoc-la-dien-tu",
    },
    {
      id: 5,
      image: "/image/articles/d.jpg",
      title: "Lợi ích sức khỏe khi bỏ thuốc lá - Từng ngày một",
      excerpt:
        "Cơ thể bạn bắt đầu hồi phục ngay từ 20 phút đầu tiên sau khi bỏ thuốc lá. Hãy xem những thay đổi tích cực qua từng mốc thời gian.",
      author: "BS. Lê Thị Mai",
      date: "1 tháng 3, 2023",
      views: "15.487",
      likes: "1.203",
      comments: "92",
      category: "health",
      url: "/blog/loi-ich-suc-khoe",
    },
    {
      id: 6,
      image: "/image/articles/c.jpg",
      title: "Hỗ trợ người thân cai thuốc - Điều bạn nên và không nên làm",
      excerpt:
        "Khi người thân đang cố gắng cai thuốc lá, sự hỗ trợ từ gia đình rất quan trọng. Bài viết này sẽ giúp bạn biết cách đồng hành hiệu quả.",
      author: "Phạm Hữu Phước",
      date: "15 tháng 2, 2023",
      views: "7.325",
      likes: "518",
      comments: "45",
      category: "support",
      url: "/blog/ho-tro-nguoi-than",
    },
    {
      id: 7,
      image: "/image/articles/e.jpg",
      title: "Ứng dụng thiền và yoga trong quá trình cai thuốc lá",
      excerpt:
        "Thiền và yoga không chỉ giúp giảm stress mà còn hỗ trợ đáng kể trong việc kiểm soát cơn thèm thuốc. Tìm hiểu cách áp dụng hiệu quả.",
      author: "Nguyễn Minh Tùng",
      date: "28 tháng 1, 2023",
      views: "6.843",
      likes: "492",
      comments: "37",
      category: "tips",
      url: "/blog/thien-yoga-cai-thuoc",
    },
    {
      id: 8,
      image: "/image/hero/quit-smoking-2.png",
      title: "Chế độ dinh dưỡng giúp giảm cơn thèm thuốc lá",
      excerpt:
        "Một số thực phẩm có thể giúp giảm cơn thèm thuốc và hỗ trợ cơ thể thải độc. Tìm hiểu chế độ ăn phù hợp cho người đang cai thuốc lá.",
      author: "BS. Trần Thị Hồng",
      date: "5 tháng 1, 2023",
      views: "9.123",
      likes: "756",
      comments: "63",
      category: "tips",
      url: "/blog/dinh-duong-cai-thuoc",
    },
  ];

  // Component bài viết nổi bật
  const FeaturedPost = ({ post }) => (
    <div className="featured-post">
      <div className="featured-image">
        <img src={post.image} alt={post.title} />
        <div className="post-category">{getCategoryName(post.category)}</div>
      </div>
      <div className="featured-content">
        <h2>{post.title}</h2>
        <p className="post-excerpt">{post.excerpt}</p>
        <div className="post-meta">
          <span className="post-author">{post.author}</span>
          <span className="post-date">
            <FaCalendarAlt /> {post.date}
          </span>
          <span className="post-views">
            <FaEye /> {post.views} lượt đọc
          </span>
        </div>
        <Link to={post.url} className="read-more-btn">
          Đọc tiếp
        </Link>
      </div>
    </div>
  );

  // Component bài viết thông thường
  const BlogPostCard = ({ post }) => (
    <div className="blog-post-card">
      <div className="post-image">
        <img src={post.image} alt={post.title} />
        <div className="post-category">{getCategoryName(post.category)}</div>
      </div>
      <div className="post-content">
        <h3>{post.title}</h3>
        <p className="post-excerpt">{post.excerpt}</p>
        <div className="post-meta">
          <span className="post-date">
            <FaCalendarAlt /> {post.date}
          </span>
          <div className="post-stats">
            <span>
              <FaEye /> {post.views}
            </span>
            <span>
              <FaHeart /> {post.likes}
            </span>
            <span>
              <FaComment /> {post.comments}
            </span>
          </div>
        </div>
        <Link to={post.url} className="read-more-link">
          Đọc tiếp
        </Link>
      </div>
    </div>
  );

  // Lấy tên hiển thị cho danh mục
  function getCategoryName(category) {
    const categories = {
      health: "Sức khỏe",
      tips: "Mẹo hay",
      experience: "Kinh nghiệm",
      success: "Câu chuyện thành công",
      support: "Hỗ trợ cai thuốc",
    };
    return categories[category] || "Chung";
  }
  return (
    <div className="blog-page">
      <div className="container blog-container">
        {/* Bài viết nổi bật */}
        <div className="featured-section">
          <h2 className="section-title">Bài viết nổi bật</h2>
          <FeaturedPost post={blogPosts[0]} />
        </div>

        {/* Bài viết mới nhất */}
        <div className="latest-posts-section">
          <h2 className="section-title">Bài viết mới nhất</h2>

          <div className="blog-posts-grid">
            {blogPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>

          <div className="pagination">
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn">2</button>
            <button className="pagination-btn">3</button>
            <span>...</span>
            <button className="pagination-btn">10</button>
            <button className="pagination-btn next">Tiếp theo</button>
          </div>
        </div>

        {/* Phần cộng đồng */}
        <div className="community-section">
          <h2 className="section-title">Chia sẻ từ cộng đồng</h2>
          <div className="community-box">
            <div className="share-post">
              <div className="user-avatar">
                <img src="/image/hero/quit-smoking-2.png" alt="User Avatar" />
              </div>
              <div className="share-input">
                <input
                  type="text"
                  placeholder="Chia sẻ hành trình hôm nay của bạn..."
                />
              </div>
              <button className="share-btn">Viết bài chia sẻ đầy đủ</button>
            </div>

            <div className="community-posts">
              {/* Bài đăng cộng đồng 1 */}
              <div className="community-post">
                <div className="post-header">
                  <div className="user-info">
                    <img
                      src="/image/hero/quit-smoking-2.png"
                      alt="Trần An Nhiên"
                      className="avatar"
                    />
                    <div className="user-details">
                      <h3 className="user-name">Trần An Nhiên</h3>
                      <span className="post-time">2 ngày trước</span>
                    </div>
                  </div>
                  <div className="achievement-badge">
                    <span className="badge">7 ngày không hút thuốc</span>
                  </div>
                </div>
                <div className="post-content">
                  <p>
                    "Hôm nay mình đã cưỡng lại cảm dỗ khi bạn bè rủ hút, cảm
                    giác thật tự hào và mạnh mẽ!"
                  </p>
                </div>
                <div className="post-actions">
                  <button className="action-btn">
                    <FaHeart /> 43 cảm ơn
                  </button>
                </div>
              </div>

              {/* Bài đăng cộng đồng 2 */}
              <div className="community-post">
                <div className="post-header">
                  <div className="user-info">
                    <img
                      src="/image/hero/quit-smoking-2.png"
                      alt="Lê Thu Thảo"
                      className="avatar"
                    />
                    <div className="user-details">
                      <h3 className="user-name">Lê Thu Thảo</h3>
                      <span className="post-time">2 giờ trước</span>
                    </div>
                  </div>
                  <div className="achievement-badge">
                    <span className="badge">21 ngày không hút thuốc</span>
                  </div>
                </div>
                <div className="post-content">
                  <p>
                    Hôm nay mình tự thưởng cho bản thân một món quà nhỏ sau 3
                    tuần không hút thuốc! Cảm giác tự hào thật sự.
                  </p>
                  <div className="post-image">
                    <img src="/image/articles/a.jpg" alt="Phong cảnh" />
                  </div>
                </div>
                <div className="post-actions">
                  <button className="action-btn">
                    <FaHeart /> 22 cảm ơn
                  </button>
                  <button className="action-btn">
                    <FaComment /> 5 bình luận
                  </button>
                </div>
              </div>

              {/* Bài đăng cộng đồng 3 */}
              <div className="community-post">
                <div className="post-header">
                  <div className="user-info">
                    <img
                      src="/image/hero/quit-smoking-2.png"
                      alt="Nguyễn Minh Tùng"
                      className="avatar"
                    />
                    <div className="user-details">
                      <h3 className="user-name">Nguyễn Minh Tùng</h3>
                      <span className="post-time">3 giờ trước</span>
                    </div>
                  </div>
                  <div className="achievement-badge">
                    <span className="badge">7 ngày không hút thuốc</span>
                  </div>
                </div>
                <div className="post-content">
                  <p>
                    Sáng nay tỉnh dậy thấy khỏe hẳn, có thêm động lực tiếp tục
                    hành trình này!
                  </p>
                </div>
                <div className="post-actions">
                  <button className="action-btn">
                    <FaHeart /> 12 cảm ơn
                  </button>
                  <button className="action-btn">
                    <FaComment /> 1 bình luận
                  </button>
                </div>
              </div>

              {/* Bài đăng cộng đồng 4 */}
              <div className="community-post">
                <div className="post-header">
                  <div className="user-info">
                    <img
                      src="/image/hero/quit-smoking-2.png"
                      alt="Phạm Hữu Phước"
                      className="avatar"
                    />
                    <div className="user-details">
                      <h3 className="user-name">Phạm Hữu Phước</h3>
                      <span className="post-time">5 giờ trước</span>
                    </div>
                  </div>
                </div>
                <div className="post-content">
                  <p>
                    Hôm nay có hơi khó chịu, nhưng mình tin mình sẽ vượt qua.
                    Cảm ơn mọi người đã luôn đồng viên!
                  </p>
                </div>
                <div className="post-actions">
                  <button className="action-btn">
                    <FaHeart /> 7 cảm ơn
                  </button>
                  <button className="action-btn">
                    <FaComment /> 0 bình luận
                  </button>
                </div>
              </div>
            </div>

            <div className="view-more">
              <button className="view-more-btn">
                Xem thêm bài viết cộng đồng
              </button>
            </div>
          </div>
        </div>

        {/* Tham gia cộng đồng */}
        <div className="join-community-section">
          <div className="join-content">            <h2>Tham gia cộng đồng NoSmoke</h2>
            <p>
              Chia sẻ hành trình cai thuốc, nhận hỗ trợ và động viên từ đội ngũ huấn luyện viên chuyên nghiệp
            </p>
            <Link to="/membership" className="join-btn">Trở thành thành viên</Link>
          </div>
          <div className="join-image">
            <img src="/image/hero/quit-smoking-2.png" alt="Cộng đồng NoSmoke" />
          </div>
        </div>
      </div>
    </div>
  );
}
