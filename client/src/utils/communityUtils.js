/**
 * Utility functions để quản lý tính năng chia sẻ cộng đồng
 */

// Format thời gian hiển thị cho bài viết
export function formatTime(timestamp) {
  if (!timestamp) return '';
  
  const now = new Date();
  const postTime = new Date(timestamp);
  const diffInMs = now - postTime;
  const diffInSec = Math.floor(diffInMs / 1000);
  const diffInMin = Math.floor(diffInSec / 60);
  const diffInHour = Math.floor(diffInMin / 60);
  const diffInDay = Math.floor(diffInHour / 24);
  const diffInMonth = Math.floor(diffInDay / 30);
  
  if (diffInSec < 60) {
    return `Vừa xong`;
  } else if (diffInMin < 60) {
    return `${diffInMin} phút trước`;
  } else if (diffInHour < 24) {
    return `${diffInHour} giờ trước`;
  } else if (diffInDay < 30) {
    return `${diffInDay} ngày trước`;
  } else {
    return `${diffInMonth} tháng trước`;
  }
}

// Cắt ngắn văn bản nếu quá dài
export function truncateText(text, maxLength = 200) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Lấy dữ liệu bài viết từ localStorage
export function getSavedPosts() {
  try {
    const savedPosts = localStorage.getItem('communityPosts');
    return savedPosts ? JSON.parse(savedPosts) : [];
  } catch (error) {
    console.error('Lỗi khi đọc dữ liệu bài đăng từ localStorage:', error);
    return [];
  }
}

// Lưu dữ liệu bài viết vào localStorage
export function savePosts(posts) {
  try {
    localStorage.setItem('communityPosts', JSON.stringify(posts));
  } catch (error) {
    console.error('Lỗi khi lưu dữ liệu bài đăng vào localStorage:', error);
  }
}

// Xử lý chức năng thích bài viết
export function toggleLikePost(posts, postId, userId) {
  return posts.map(post => {
    if (post.id === postId) {
      // Kiểm tra xem user đã thích bài này chưa
      const likes = post.likedBy || [];
      const isLiked = likes.includes(userId);
      
      if (isLiked) {
        return {
          ...post,
          likes: Math.max(0, post.likes - 1),
          likedBy: likes.filter(id => id !== userId)
        };
      } else {
        return {
          ...post,
          likes: post.likes + 1,
          likedBy: [...likes, userId]
        };
      }
    }
    return post;
  });
}

// Kiểm tra xem người dùng hiện tại có thích bài viết không
export function isPostLikedByUser(post, userId) {
  if (!post || !userId) return false;
  const likedBy = post.likedBy || [];
  return likedBy.includes(userId);
}

// Hỗ trợ chia sẻ bài viết
export function prepareShareContent(post) {
  return `
🎯 Chia sẻ từ cộng đồng NoSmoke:

${post.content || ''}

${post.achievements?.map(a => `🏆 ${a.name}`).join('\n') || ''}

📱 Tham gia cộng đồng cai thuốc lá tại: ${window.location.origin}
  `;
}

// Lưu bình luận mới cho bài viết
export function addCommentToPost(posts, postId, comment) {
  return posts.map(post => {
    if (post.id === postId) {
      const newComments = post.commentsList ? [...post.commentsList, comment] : [comment];
      return {
        ...post,
        comments: newComments.length,
        commentsList: newComments
      };
    }
    return post;
  });
}
