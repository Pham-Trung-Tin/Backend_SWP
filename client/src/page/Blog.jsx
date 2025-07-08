import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaEye, FaHeart, FaComment, FaCheckCircle, FaTimes, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import CommunityPostCreator, { EmptyState } from "../components/CommunityPostCreator.jsx";
import CommunityPost from "../components/CommunityPost.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { calculateDaysWithoutSmoking, generateAchievements } from "../utils/achievementUtils.js";
import { getSavedPosts, savePosts, toggleLikePost, prepareShareContent } from "../utils/communityUtils.js";
import "./Blog.css";
import "../styles/Toast.css";

export default function Blog() {  const { user } = useAuth();
  const [communityPosts, setCommunityPosts] = useState([]);
  const [toasts, setToasts] = useState([]);
  
  // Quản lý toast notification
  const showToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
    // Lấy thông tin huy hiệu sử dụng utility function đồng bộ
  const getUserAchievements = () => {
    // Lấy activePlan từ localStorage (giống như trong Profile.jsx)
    let activePlan = null;
    try {
      const completionData = localStorage.getItem('quitPlanCompletion');
      if (completionData) {
        const parsedData = JSON.parse(completionData);
        activePlan = parsedData.userPlan;
      } else {
        const savedPlan = localStorage.getItem('activePlan');
        if (savedPlan) {
          activePlan = JSON.parse(savedPlan);
        }
      }
    } catch (error) {
      console.error('Lỗi khi đọc kế hoạch cai thuốc trong Blog:', error);
    }
    
    // Nếu không có kế hoạch cai thuốc, không có huy hiệu nào
    if (!activePlan || !activePlan.startDate) {
      console.log('Không có kế hoạch cai thuốc hợp lệ để tính huy hiệu');
      return [];
    }
    
    // Tính số ngày cai thuốc sử dụng utility function
    const daysWithoutSmoking = calculateDaysWithoutSmoking(activePlan, user);
    
    // Nếu chưa đủ một ngày thì không có huy hiệu nào
    if (daysWithoutSmoking <= 0) {
      console.log('Chưa đủ 1 ngày cai thuốc (daysWithoutSmoking =', daysWithoutSmoking, ') → không có huy hiệu');
      return [];
    }
    
    // Tạo danh sách huy hiệu sử dụng utility function
    const allAchievements = generateAchievements(daysWithoutSmoking);
    
    // Lọc và chỉ trả về những huy hiệu thực sự đã hoàn thành
    const completedAchievements = allAchievements.filter(achievement => achievement.completed === true);
    console.log('Tìm thấy', completedAchievements.length, 'huy hiệu đã hoàn thành');
    
    return completedAchievements;
  };
  
  // Load bài viết từ localStorage khi component mount
  useEffect(() => {
    const savedPosts = getSavedPosts();
    if (savedPosts && savedPosts.length > 0) {
      setCommunityPosts(savedPosts);
    } else {
      // Khởi tạo dữ liệu mẫu nếu chưa có bài viết nào
      const initialPosts = [
        {
          id: 1,
          user: {
            name: "Lê Thu Thảo",
            avatar: "/image/hero/quit-smoking-2.png",
            id: "user_1"
          },
          content: "Hôm nay mình tự thưởng cho bản thân một món quà nhỏ sau 3 tuần không hút thuốc! Cảm giác tự hào thật sự.",
          images: [{ id: "img_1", url: "/image/articles/a.jpg" }],
          achievements: [{ id: 2, name: "1 tuần không hút", icon: "🏅", completed: true }],
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 giờ trước
          likes: 22,
          comments: 5,
          shares: 2,
          likedBy: []
        },
        {
          id: 2,
          user: {
            name: "Trần An Nhiên",
            avatar: "/image/hero/quit-smoking-2.png",
            id: "user_2"
          },
          content: "Hôm nay mình đã cưỡng lại cảm dỗ khi bạn bè rủ hút, cảm giác thật tự hào và mạnh mẽ!",
          achievements: [{ id: 1, name: "24 giờ đầu tiên", icon: "⭐", completed: true }],
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 ngày trước
          likes: 43,
          comments: 8,
          shares: 1,
          likedBy: []
        }
      ];
      setCommunityPosts(initialPosts);
      savePosts(initialPosts);
    }
  }, []);
    // Xử lý khi người dùng tạo bài viết mới
  const handlePostCreated = (newPost) => {
    const updatedPosts = [newPost, ...communityPosts];
    setCommunityPosts(updatedPosts);
    savePosts(updatedPosts);
    showToast('Đã đăng bài viết thành công!', 'success');
  };

  // Xử lý khi người dùng thích bài viết
  const handleLike = (postId, isLiked) => {
    const userId = user?.id || 'anonymous';
    const updatedPosts = toggleLikePost(communityPosts, postId, userId);
    setCommunityPosts(updatedPosts);
    savePosts(updatedPosts);
  };

  // Xử lý khi người dùng muốn xem/thêm bình luận
  const handleComment = (postId) => {
    console.log('Open comments for post:', postId);
    // Hiện tại chỉ log, sau này có thể mở modal bình luận
    showToast('Tính năng bình luận sẽ sớm được cập nhật!', 'info');
  };
  
  // Xử lý khi người dùng xóa bài viết của họ
  const handleDelete = (postId) => {
    const updatedPosts = communityPosts.filter(post => post.id !== postId);
    setCommunityPosts(updatedPosts);
    savePosts(updatedPosts);
    showToast('Đã xóa bài viết thành công!', 'success');
  };
  // Quản lý toast notification được định nghĩa ở trên

  // Xử lý khi người dùng chia sẻ bài viết
  const handleShare = (post) => {
    const shareContent = prepareShareContent(post);

    if (navigator.share) {
      navigator.share({
        title: 'Chia sẻ từ cộng đồng NoSmoke',
        text: shareContent,
      })
      .then(() => {
        showToast('Đã chia sẻ thành công!', 'success');
      })
      .catch((error) => {
        console.log('Lỗi khi chia sẻ:', error);
      });
    } else {
      try {
        navigator.clipboard.writeText(shareContent);
        showToast('Đã sao chép nội dung! Bạn có thể dán và chia sẻ ngay bây giờ.', 'success');
      } catch (err) {
        console.log('Lỗi khi sao chép:', err);
        showToast('Không thể sao chép tự động. Vui lòng thử lại.', 'error');
      }
    }
  };
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
    },  ];

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
  }  return (
    <div className="blog-page">
      <div className="container blog-container">
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
        </div>        {/* Phần cộng đồng */}
        <div className="community-section">
          <h2 className="section-title">Chia sẻ từ cộng đồng</h2>
          <div className="community-box">            {/* Component tạo bài viết */}
            {user ? (
              <CommunityPostCreator 
                achievements={getUserAchievements()}
                onPostCreated={handlePostCreated}
              />
            ) : (
              <div className="login-to-post">
                <p>Vui lòng đăng nhập để chia sẻ hành trình của bạn</p>
                <Link to="/login" className="login-btn">Đăng nhập</Link>
              </div>
            )}

            {/* Danh sách bài viết */}
            <div className="community-posts">
              {communityPosts.length > 0 ? (
                communityPosts.map(post => (
                  <CommunityPost
                    key={post.id}
                    post={post}
                    currentUserId={user?.id}
                    onLike={handleLike}
                    onComment={handleComment}
                    onShare={() => handleShare(post)}
                    onDelete={handleDelete}
                    canDelete={post.user?.id === user?.id || user?.role === 'admin'}
                  />
                ))
              ) : (
                <EmptyState 
                  title="Chưa có bài viết nào trong cộng đồng"
                  description="Hãy là người đầu tiên chia sẻ câu chuyện cai thuốc lá của bạn!"
                  actionText="Tạo bài viết đầu tiên"
                  onAction={() => document.querySelector('.post-input')?.focus()}
                />
              )}
            </div>

            {communityPosts.length > 5 && (
              <div className="view-more">
                <button className="view-more-btn">
                  Xem thêm bài viết cộng đồng
                </button>
              </div>
            )}

            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
          </div>
        </div>

      </div>
    </div>
  );
}

/**
 * Component hiển thị thông báo toast
 */
const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose && onClose(), 300); // Chờ animation kết thúc
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle />;
      case 'error':
        return <FaExclamationTriangle />;
      case 'info':
        return <FaInfoCircle />;
      default:
        return <FaCheckCircle />;
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose && onClose(), 300);
  };

  return (
    <div className={`toast toast-${type} ${isVisible ? 'toast-enter' : 'toast-exit'}`}>
      <div className="toast-icon">
        {getIcon()}
      </div>
      <div className="toast-content">
        <p className="toast-message">{message}</p>
      </div>
      <button className="toast-close" onClick={handleClose}>
        <FaTimes />
      </button>
    </div>
  );
};

/**
 * Container quản lý các toast
 */
const ToastContainer = ({ toasts = [], removeToast }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

/**
 * Dữ liệu mẫu cho bài viết blog
 */
const sampleBlogPosts = [
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
