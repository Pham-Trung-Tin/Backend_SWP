import React, { useState, useEffect } from 'react';
import '../styles/JourneyStepper.css';

export default function JourneyStepper() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [formData, setFormData] = useState({
    cigarettesPerDay: 10,
    packPrice: 25000,
    smokingYears: 5,
    reasonToQuit: 'sức khỏe',
    selectedPlan: null, // Kế hoạch được chọn
  });

  const steps = [
    { id: 1, name: "Thói quen" },
    { id: 2, name: "Quá trình" },
    { id: 3, name: "Lợi ích" },
    { id: 4, name: "Xác nhận" },
  ];

  // Phục hồi kế hoạch từ localStorage khi component được gắn vào
  useEffect(() => {
    const storedCompletionData = localStorage.getItem('quitPlanCompletion');
    const storedActivePlan = localStorage.getItem('activePlan');

    if (storedCompletionData) {
      const completionData = JSON.parse(storedCompletionData);
      console.log('Khôi phục kế hoạch từ localStorage:', completionData);
      setFormData(completionData.formData);
      setIsCompleted(true);
      setShowCompletionScreen(true);
      setCurrentStep(4);
    } else if (storedActivePlan) {
      const activePlan = JSON.parse(storedActivePlan);
      console.log('Khôi phục active plan từ localStorage:', activePlan);
      setFormData((prevData) => ({
        ...prevData,
        selectedPlan: activePlan.id,
        cigarettesPerDay: activePlan.initialCigarettes,
      }));
      setCurrentStep(2);
    }
  }, []);

  const handleContinue = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      // Add animation effect for the progress bar
      animateProgressBar(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Add animation effect for the progress bar when going back
      animateProgressBar(currentStep - 1);
    }
  };  const handleBackToSummary = () => {
    setCurrentStep(4);  // Always go to step 4 (confirmation step)
    setShowCompletionScreen(true);
  };

  // Xử lý khi người dùng muốn chỉnh sửa kế hoạch
  const handleEditPlan = (stepToEdit) => {
    setIsEditing(true);
    setShowCompletionScreen(false);
    setCurrentStep(stepToEdit);
    
    // Nếu chỉnh sửa kế hoạch (step 2), luôn reset về màn hình chọn kế hoạch
    if (stepToEdit === 2) {
      // Lưu thông tin về plan hiện tại trước khi reset
      const currentPlan = formData.selectedPlan;
      console.log('Đang chỉnh sửa kế hoạch, kế hoạch hiện tại:', currentPlan);
      
      // Reset selectedPlan để người dùng có thể chọn lại
      setFormData(prevData => ({
        ...prevData,
        selectedPlan: null
      }));
      
      console.log('Đã reset kế hoạch để người dùng chọn lại');
    }
    
    // Hiệu ứng animation cho progress bar khi quay lại
    animateProgressBar(stepToEdit);
  };

  // Xử lý khi người dùng lưu kế hoạch sau khi chỉnh sửa
  const handleSaveEdit = () => {
    // Lấy kế hoạch đầy đủ dựa vào ID đã chọn
    let completeSelectedPlan = null;
    
    if (formData.selectedPlan) {
      let plans = [];
      if (formData.cigarettesPerDay < 10) {
        plans = generateLightSmokerPlans();
      } else if (formData.cigarettesPerDay <= 20) {
        plans = generateModerateSmokerPlans();
      } else {
        plans = generateHeavySmokerPlans();
      }
      
      // Tìm kế hoạch đầy đủ bằng ID
      const selectedPlanId = typeof formData.selectedPlan === 'object' 
        ? formData.selectedPlan.id 
        : formData.selectedPlan;
      
      completeSelectedPlan = plans.find(plan => plan.id === selectedPlanId);
      
      console.log('Lưu kế hoạch mới được chọn:', completeSelectedPlan);
    }
    
    // Đảm bảo completeSelectedPlan không null
    if (!completeSelectedPlan && typeof formData.selectedPlan === 'object') {
      completeSelectedPlan = formData.selectedPlan;
    }
    
    // Kiểm tra xem có tìm thấy kế hoạch đầy đủ hay không
    if (!completeSelectedPlan) {
      console.error('Không tìm thấy kế hoạch đầy đủ. Có thể người dùng chưa chọn kế hoạch.');
      alert('Vui lòng chọn một kế hoạch trước khi lưu.');
      return;
    }
    
    // Lấy dữ liệu hiện tại từ localStorage để giữ nguyên thời gian tạo ban đầu
    let originalCompletionDate = new Date().toISOString();
    try {
      const savedData = localStorage.getItem('quitPlanCompletion');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData && parsedData.completionDate) {
          originalCompletionDate = parsedData.completionDate;
          console.log('Giữ nguyên thời gian tạo ban đầu:', originalCompletionDate);
        }
      }
    } catch (error) {
      console.error('Lỗi khi đọc dữ liệu cũ:', error);
    }
    
    // Lưu thông tin đã chỉnh sửa vào localStorage
    const completionData = {
      completionDate: originalCompletionDate, // Giữ nguyên thời gian tạo ban đầu
      userPlan: completeSelectedPlan,
      formData: {
        ...formData,
        selectedPlan: completeSelectedPlan // Lưu object kế hoạch đầy đủ thay vì chỉ ID
      },
      lastEdited: new Date().toISOString() // Cập nhật thời gian chỉnh sửa
    };    localStorage.setItem('quitPlanCompletion', JSON.stringify(completionData));
    
    // Cập nhật kế hoạch đang hoạt động
    const activePlan = {
      ...completeSelectedPlan,
      startDate: new Date().toISOString().split('T')[0],
      initialCigarettes: formData.cigarettesPerDay,
      packPrice: formData.packPrice,
      lastEdited: new Date().toISOString()
    };
    localStorage.setItem('activePlan', JSON.stringify(activePlan));
    
    // Hiển thị thông báo thành công
    alert(`Đã cập nhật kế hoạch thành công! Thời gian dự kiến mới: ${completeSelectedPlan.totalWeeks} tuần.`);
    
    // Trở lại màn hình hoàn thành
    setIsEditing(false);
    setCurrentStep(4);
    setShowCompletionScreen(true);
  };
  // Function to update active steps
  const animateProgressBar = (newStep) => {
    // No longer need to animate step-line since it has been removed
    // Only update other elements if necessary
  };const handleSubmit = () => {
    // Add animation to the submit button
    const submitButton = document.querySelector('.btn-submit');
    submitButton.classList.add('loading');
    submitButton.innerHTML = '<div class="loader"></div>';
    
    // Simulate loading/processing
    setTimeout(() => {
      submitButton.classList.remove('loading');
      submitButton.classList.add('success');      submitButton.innerHTML = '<div class="checkmark">✓</div>';
      document.querySelectorAll('.step-item').forEach((item) => {
        item.classList.add('completed');
      });
      
      // Lấy thời gian hiện tại
      const now = new Date().toISOString();
      
      // Kiểm tra xem đã có kế hoạch từ trước chưa để giữ nguyên thời gian tạo ban đầu
      let originalCompletionDate = now;
      try {
        const savedData = localStorage.getItem('quitPlanCompletion');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          if (parsedData && parsedData.completionDate) {
            originalCompletionDate = parsedData.completionDate;
            console.log('Giữ nguyên thời gian tạo ban đầu:', originalCompletionDate);
          }
        }
      } catch (error) {
        console.error('Lỗi khi đọc dữ liệu cũ:', error);
      }
      
      // Lấy kế hoạch đầy đủ dựa vào ID đã chọn
      let completeSelectedPlan = null;
      
      if (formData.selectedPlan) {
        let plans = [];
        if (formData.cigarettesPerDay < 10) {
          plans = generateLightSmokerPlans();
        } else if (formData.cigarettesPerDay <= 20) {
          plans = generateModerateSmokerPlans();
        } else {
          plans = generateHeavySmokerPlans();
        }
        
        // Tìm kế hoạch đầy đủ bằng ID
        const selectedPlanId = typeof formData.selectedPlan === 'object' 
          ? formData.selectedPlan.id 
          : formData.selectedPlan;
        
        completeSelectedPlan = plans.find(plan => plan.id === selectedPlanId);
        console.log('Kế hoạch đầy đủ được chọn khi submit:', completeSelectedPlan);
      }
      
      // Đảm bảo completeSelectedPlan không null
      if (!completeSelectedPlan && typeof formData.selectedPlan === 'object') {
        completeSelectedPlan = formData.selectedPlan;
      }
      
      // Lưu thông tin hoàn thành vào localStorage
      const completionData = {
        completionDate: originalCompletionDate, // Sử dụng thời gian tạo ban đầu hoặc thời gian hiện tại nếu là lần đầu
        userPlan: completeSelectedPlan || formData.selectedPlan,
        formData: {
          ...formData,
          selectedPlan: completeSelectedPlan // Lưu object kế hoạch đầy đủ thay vì chỉ ID
        },
        lastEdited: now // Cập nhật thời gian chỉnh sửa gần nhất
      };
      localStorage.setItem('quitPlanCompletion', JSON.stringify(completionData));
        // Đánh dấu là đã ghé thăm trong phiên này
      sessionStorage.setItem('lastVisit', Date.now().toString());
      
      // Lưu kế hoạch đang hoạt động với startDate
      const activePlan = {
        ...(completeSelectedPlan || formData.selectedPlan),
        startDate: now.split('T')[0],
        initialCigarettes: formData.cigarettesPerDay,
        packPrice: formData.packPrice,
        lastEdited: now
      };
      localStorage.setItem('activePlan', JSON.stringify(activePlan));
      
      // Set completion state after a short delay
      setTimeout(() => {
        setIsCompleted(true);
        setShowCompletionScreen(true);
      }, 1000);
    }, 2000);
  };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  // Kiểm tra nếu có kế hoạch cai thuốc đã lưu trong localStorage
  useEffect(() => {
    const savedPlan = localStorage.getItem('quitPlanCompletion');
    if (savedPlan) {
      try {
        const parsedPlan = JSON.parse(savedPlan);
        // Khôi phục dữ liệu form từ localStorage
        setFormData(parsedPlan.formData);
        // Hiển thị màn hình hoàn thành
        setIsCompleted(true);
        setShowCompletionScreen(true);
        setCurrentStep(4);
        
        // Kiểm tra xem có phải lần đầu ghé thăm trong phiên làm việc này không
        const lastVisit = sessionStorage.getItem('lastVisit');
        if (!lastVisit) {
          setShowWelcomeBack(true);
          // Đánh dấu là đã ghé thăm trong phiên này
          sessionStorage.setItem('lastVisit', Date.now().toString());
          
          // Tự động ẩn thông báo sau 5 giây
          setTimeout(() => {
            setShowWelcomeBack(false);
          }, 5000);
        }
        
        // Đánh dấu tất cả các bước là đã hoàn thành
        setTimeout(() => {
          document.querySelectorAll('.step-line').forEach((line) => {
            line.classList.add('active');
          });
          document.querySelectorAll('.step-item').forEach((item) => {
            item.classList.add('completed');
          });
        }, 100);
      } catch (error) {
        console.error('Lỗi khi khôi phục kế hoạch cai thuốc:', error);
      }
    }
  }, []);

  // Xử lý input số
  const handleNumberInput = (field, e) => {
    const value = parseInt(e.target.value) || 0;
    handleInputChange(field, value);
  };

  // Xử lý nút "Quay lại" trong step 2
  const handleBackInStep2 = () => {
    if (formData.selectedPlan) {
      // Nếu đã chọn kế hoạch, quay lại màn hình chọn kế hoạch
      handleInputChange('selectedPlan', null);
    } else {
      // Nếu chưa chọn kế hoạch, quay lại step trước đó
      handleBack();
    }
  };

  // Xử lý khi người dùng muốn xóa kế hoạch đã lưu
  const handleClearPlan = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa kế hoạch cai thuốc và toàn bộ tiến trình? Hành động này không thể hoàn tác.')) {
      // Xóa thông tin kế hoạch
      localStorage.removeItem('quitPlanCompletion');
      localStorage.removeItem('activePlan');
      
      // Xóa tất cả dữ liệu check-in hàng ngày
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('checkin_')) {
          keysToRemove.push(key);
        }
      }
      
      // Xóa từng key đã thu thập
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`Đã xóa dữ liệu check-in: ${key}`);
      });
      
      // Xóa thống kê dashboard
      localStorage.removeItem('dashboardStats');
      
      // Reset lại trạng thái
      setFormData({
        cigarettesPerDay: 10,
        packPrice: 25000,
        smokingYears: 5,
        reasonToQuit: 'sức khỏe',
        selectedPlan: null,
      });
      setCurrentStep(1);
      setIsCompleted(false);
      setShowCompletionScreen(false);
      setIsEditing(false);
      
      // Reset lại trạng thái UI
      setTimeout(() => {
        document.querySelectorAll('.step-line').forEach((line) => {
          line.classList.remove('active');
        });
        document.querySelectorAll('.step-item').forEach((item) => {
          item.classList.remove('completed');
        });
        document.querySelector('.step-item:first-child').classList.add('active');
      }, 100);
      
      // Thông báo thành công
      alert('Đã xóa toàn bộ kế hoạch cai thuốc và tiến trình của bạn. Bạn có thể bắt đầu lại từ đầu.');
    }
  };

  // Hàm để chia sẻ kế hoạch cai thuốc
  const handleSharePlan = () => {
    // Đảm bảo có kế hoạch đầy đủ để chia sẻ
    let planToShare = formData.selectedPlan;
    
    // Nếu selectedPlan là ID, lấy kế hoạch đầy đủ
    if (typeof planToShare === 'number' || !planToShare?.totalWeeks) {
      let plans = [];
      if (formData.cigarettesPerDay < 10) {
        plans = generateLightSmokerPlans();
      } else if (formData.cigarettesPerDay <= 20) {
        plans = generateModerateSmokerPlans();
      } else {
        plans = generateHeavySmokerPlans();
      }
      
      const planId = typeof planToShare === 'object' ? planToShare.id : planToShare;
      planToShare = plans.find(plan => plan.id === planId) || planToShare;
    }
    
    // Truy xuất thời gian dự kiến từ kế hoạch
    const totalWeeks = planToShare?.totalWeeks || 
                      (planToShare?.weeks ? planToShare.weeks.length : 0);
    
    console.log('Kế hoạch sẽ chia sẻ:', planToShare, 'với tổng tuần:', totalWeeks);
    
    // Tạo text để chia sẻ
    const planDetails = `
🚭 KẾ HOẠCH CAI THUỐC LÁ CỦA TÔI 🚭

👤 Thông tin:
- Số điếu mỗi ngày: ${formData.cigarettesPerDay} điếu
- Giá mỗi gói: ${formData.packPrice.toLocaleString()} VNĐ
- Đã hút thuốc: ${formData.smokingYears} năm
- Lý do cai thuốc: ${formData.reasonToQuit}

📋 Kế hoạch: ${planToShare?.name || "Kế hoạch cai thuốc"}
- Thời gian dự kiến: ${totalWeeks} tuần
- Mô tả: ${planToShare?.description || ""}

💪 Hãy ủng hộ hành trình cai thuốc của tôi!
    `;
    
    // Kiểm tra xem trình duyệt có hỗ trợ Web Share API không
    if (navigator.share) {
      navigator.share({
        title: 'Kế hoạch cai thuốc lá của tôi',
        text: planDetails,
      })
      .catch((error) => console.log('Lỗi khi chia sẻ:', error));
    } else {
      // Fallback cho các trình duyệt không hỗ trợ Web Share API
      try {
        navigator.clipboard.writeText(planDetails);
        alert('Đã sao chép kế hoạch vào clipboard! Bạn có thể dán và chia sẻ ngay bây giờ.');
      } catch (err) {
        console.log('Lỗi khi sao chép vào clipboard:', err);
        // Hiển thị text để người dùng có thể sao chép thủ công
        alert('Không thể sao chép tự động. Vui lòng sao chép text thủ công.');
      }
    }
  };

  // Tính toán các thông số dựa trên dữ liệu người dùng nhập vào
  const dailySpending = (formData.cigarettesPerDay / 20) * formData.packPrice;
  const monthlySpending = dailySpending * 30;
  const yearlySpending = monthlySpending * 12;
  const lifetimeSpending = yearlySpending * formData.smokingYears;
  // Tính toán lợi ích sức khỏe
  const healthBenefits = [
    { time: "20 phút", benefit: "Huyết áp và nhịp tim giảm về mức bình thường" },
    { time: "8 giờ", benefit: "Mức nicotine và carbon monoxide trong máu giảm một nửa" },
    { time: "24 giờ", benefit: "Carbon monoxide được loại bỏ khỏi cơ thể" },
    { time: "48 giờ", benefit: "Nicotine được loại bỏ khỏi cơ thể, vị giác và khứu giác bắt đầu cải thiện" },
    { time: "72 giờ", benefit: "Đường hô hấp thư giãn, năng lượng tăng lên" },
    { time: "2 tuần - 3 tháng", benefit: "Tuần hoàn máu cải thiện, chức năng phổi tăng lên 30%" },
    { time: "1 - 9 tháng", benefit: "Ho, nghẹt mũi, mệt mỏi và khó thở giảm" },
    { time: "1 năm", benefit: "Nguy cơ mắc bệnh tim giảm 50% so với người hút thuốc" }
  ];

  // Tính toán mức độ nghiện theo WHO Tobacco Cessation Guidelines
  const calculateWHODependenceLevel = () => {
    const cigarettesPerDay = formData.cigarettesPerDay;
    const smokingYears = formData.smokingYears;

    // Tính điểm dựa trên số điếu/ngày (WHO Classification)
    let dependenceScore = 0;
    if (cigarettesPerDay < 10) {
      dependenceScore = 1; // Nhẹ
    } else if (cigarettesPerDay < 20) {
      dependenceScore = 2; // Trung bình
    } else if (cigarettesPerDay < 30) {
      dependenceScore = 3; // Nặng
    } else {
      dependenceScore = 4; // Rất nặng
    }

    // Điều chỉnh dựa trên thời gian hút thuốc
    if (smokingYears >= 10) {
      dependenceScore = Math.min(4, dependenceScore + 1);
    } else if (smokingYears >= 5) {
      dependenceScore = Math.min(4, dependenceScore + 0.5);
    }

    return Math.round(dependenceScore);
  };

  // Tạo 2 kế hoạch cho người hút nhẹ (<10 điếu/ngày)
  const generateLightSmokerPlans = () => {
    const cigarettesPerDay = formData.cigarettesPerDay;

    // Kế hoạch 1: 4 tuần - giảm nhanh hơn (30%)
    const plan1 = {
      id: 1,
      name: "Kế hoạch nhanh",
      totalWeeks: 4,
      weeklyReductionRate: 0.30, // Giảm 30% mỗi tuần
      description: "Cai thuốc trong 4 tuần",
      subtitle: "Phù hợp cho người có ý chí mạnh",
      color: "#28a745",
      weeks: []
    };

    // Kế hoạch 2: 6 tuần - giảm từ từ hơn (25%)
    const plan2 = {
      id: 2,
      name: "Kế hoạch từ từ",
      totalWeeks: 6,
      weeklyReductionRate: 0.25, // Giảm 25% mỗi tuần
      description: "Cai thuốc trong 6 tuần",
      subtitle: "Phù hợp cho người muốn từ từ",
      color: "#17a2b8",
      weeks: []
    };

    // Tạo timeline cho từng kế hoạch
    [plan1, plan2].forEach(plan => {
      let currentAmount = cigarettesPerDay;

      for (let i = 1; i <= plan.totalWeeks && currentAmount > 0; i++) {
        let weeklyReduction = Math.max(1, Math.round(currentAmount * plan.weeklyReductionRate));
        const newAmount = Math.max(0, currentAmount - weeklyReduction);

        // Đảm bảo đạt mục tiêu 0 vào tuần cuối
        if (i === plan.totalWeeks) {
          weeklyReduction = currentAmount;
          currentAmount = 0;
        } else {
          currentAmount = newAmount;
        }

        // Xác định giai đoạn
        let phase;
        if (i <= Math.ceil(plan.totalWeeks * 0.3)) {
          phase = "Thích nghi";
        } else if (i <= Math.ceil(plan.totalWeeks * 0.7)) {
          phase = "Ổn định";
        } else {
          phase = "Hoàn thiện";
        }

        plan.weeks.push({
          week: i,
          amount: currentAmount,
          reduction: weeklyReduction,
          phase: phase
        });
      }
    });

    return [plan1, plan2];
  };

  // Tạo 2 kế hoạch cho người hút trung bình (10-20 điếu/ngày)
  const generateModerateSmokerPlans = () => {
    const cigarettesPerDay = formData.cigarettesPerDay;

    // Kế hoạch 1: 6 tuần - giảm nhanh hơn (20%)
    const plan1 = {
      id: 1,
      name: "Kế hoạch nhanh",
      totalWeeks: 6,
      weeklyReductionRate: 0.20, // Giảm 20% mỗi tuần
      description: "Cai thuốc trong 6 tuần",
      subtitle: "Phù hợp cho người quyết tâm cao",
      color: "#ffc107",
      weeks: []
    };

    // Kế hoạch 2: 8 tuần - giảm từ từ hơn (15%)
    const plan2 = {
      id: 2,
      name: "Kế hoạch từ từ",
      totalWeeks: 8,
      weeklyReductionRate: 0.15, // Giảm 15% mỗi tuần
      description: "Cai thuốc trong 8 tuần",
      subtitle: "Phù hợp cho cách tiếp cận ổn định",
      color: "#17a2b8",
      weeks: []
    };

    // Tạo timeline cho từng kế hoạch
    [plan1, plan2].forEach(plan => {
      let currentAmount = cigarettesPerDay;

      for (let i = 1; i <= plan.totalWeeks && currentAmount > 0; i++) {
        let weeklyReduction = Math.max(1, Math.round(currentAmount * plan.weeklyReductionRate));
        const newAmount = Math.max(0, currentAmount - weeklyReduction);

        // Đảm bảo đạt mục tiêu 0 vào tuần cuối
        if (i === plan.totalWeeks) {
          weeklyReduction = currentAmount;
          currentAmount = 0;
        } else {
          currentAmount = newAmount;
        }

        // Xác định giai đoạn
        let phase;
        if (i <= Math.ceil(plan.totalWeeks * 0.25)) {
          phase = "Thích nghi";
        } else if (i <= Math.ceil(plan.totalWeeks * 0.75)) {
          phase = "Ổn định";
        } else {
          phase = "Hoàn thiện";
        }

        plan.weeks.push({
          week: i,
          amount: currentAmount,
          reduction: weeklyReduction,
          phase: phase
        });
      }
    });

    return [plan1, plan2];
  };

  // Tạo 2 kế hoạch cho người hút nặng (>20 điếu/ngày)
  const generateHeavySmokerPlans = () => {
    const cigarettesPerDay = formData.cigarettesPerDay;

    // Kế hoạch 1: 8 tuần - giảm nhanh hơn (15%)
    const plan1 = {
      id: 1,
      name: "Kế hoạch nhanh",
      totalWeeks: 8,
      weeklyReductionRate: 0.15, // Giảm 15% mỗi tuần
      description: "Cai thuốc trong 8 tuần",
      subtitle: "Phù hợp cho người có ý chí mạnh mẽ",
      color: "#fd7e14",
      weeks: []
    };

    // Kế hoạch 2: 12 tuần - giảm từ từ hơn (10%)
    const plan2 = {
      id: 2,
      name: "Kế hoạch từ từ",
      totalWeeks: 12,
      weeklyReductionRate: 0.10, // Giảm 10% mỗi tuần
      description: "Cai thuốc trong 12 tuần",
      subtitle: "Phù hợp cho cách tiếp cận thận trọng",
      color: "#dc3545",
      weeks: []
    };

    // Tạo timeline cho từng kế hoạch
    [plan1, plan2].forEach(plan => {
      let currentAmount = cigarettesPerDay;

      for (let i = 1; i <= plan.totalWeeks && currentAmount > 0; i++) {
        let weeklyReduction = Math.max(1, Math.round(currentAmount * plan.weeklyReductionRate));
        const newAmount = Math.max(0, currentAmount - weeklyReduction);

        // Đảm bảo đạt mục tiêu 0 vào tuần cuối
        if (i === plan.totalWeeks) {
          weeklyReduction = currentAmount;
          currentAmount = 0;
        } else {
          currentAmount = newAmount;
        }

        // Xác định giai đoạn
        let phase;
        if (i <= Math.ceil(plan.totalWeeks * 0.2)) {
          phase = "Thích nghi";
        } else if (i <= Math.ceil(plan.totalWeeks * 0.8)) {
          phase = "Ổn định";
        } else {
          phase = "Hoàn thiện";
        }

        plan.weeks.push({
          week: i,
          amount: currentAmount,
          reduction: weeklyReduction,
          phase: phase
        });
      }
    });

    return [plan1, plan2];
  };

  // Tạo kế hoạch giảm dần dựa trên WHO Tobacco Cessation Guidelines
  const generateReductionPlan = () => {
    const dependenceLevel = calculateWHODependenceLevel();
    console.log('Mức độ phụ thuộc:', dependenceLevel, 'Điếu/ngày:', formData.cigarettesPerDay);

    // Nếu là người hút nhẹ và chưa chọn kế hoạch, trả về null để hiển thị màn hình chọn
    if (dependenceLevel === 1 && formData.cigarettesPerDay < 10 && !formData.selectedPlan) {
      return null;
    }

    // Nếu là người hút trung bình và chưa chọn kế hoạch
    if ((dependenceLevel === 2 || (formData.cigarettesPerDay >= 10 && formData.cigarettesPerDay <= 20)) && !formData.selectedPlan) {
      return null;
    }

    // Nếu là người hút nặng và chưa chọn kế hoạch
    if ((dependenceLevel >= 3 || formData.cigarettesPerDay > 20) && !formData.selectedPlan) {
      return null;
    }

    // Nếu đã chọn kế hoạch
    if (formData.selectedPlan) {
      let plans = [];

      if (formData.cigarettesPerDay < 10) {
        plans = generateLightSmokerPlans();
      } else if (formData.cigarettesPerDay <= 20) {
        plans = generateModerateSmokerPlans();
      } else {
        plans = generateHeavySmokerPlans();
      }

      // Lấy ID kế hoạch dựa trên selectedPlan (có thể là object hoặc số)
      const selectedPlanId = typeof formData.selectedPlan === 'object' 
        ? formData.selectedPlan.id 
        : formData.selectedPlan;
      
      console.log('Tìm kế hoạch với ID:', selectedPlanId, 'từ các kế hoạch:', plans);
      
      const selectedPlan = plans.find(plan => plan.id === selectedPlanId);
      
      // Kiểm tra nếu không tìm thấy kế hoạch phù hợp
      if (!selectedPlan) {
        console.log('Không tìm thấy kế hoạch với ID:', selectedPlanId);
        
        // Nếu selectedPlan là object, sử dụng nó
        if (typeof formData.selectedPlan === 'object' && formData.selectedPlan !== null) {
          console.log('Sử dụng kế hoạch từ formData:', formData.selectedPlan);
          return {
            weeks: formData.selectedPlan.weeks || [],
            strategy: formData.selectedPlan,
            dependenceLevel,
            totalWeeks: formData.selectedPlan.totalWeeks || (formData.selectedPlan.weeks ? formData.selectedPlan.weeks.length : 0)
          };
        }
        
        return null;
      }
      
      console.log('Đã tìm thấy kế hoạch:', selectedPlan);
      return {
        weeks: selectedPlan.weeks,
        strategy: selectedPlan,
        dependenceLevel,
        totalWeeks: selectedPlan.totalWeeks
      };
    }

    // Fallback cho trường hợp không có plan nào được chọn (không nên xảy ra)
    return null;
  };

  const reductionPlan = generateReductionPlan();

  return (
    <div className="journey-container">
      {showWelcomeBack && (
        <div className="welcome-back-notification">
          <div className="notification-content">
            <i className="fas fa-check-circle"></i>
            <div className="notification-text">
              <p className="notification-title">Chào mừng bạn trở lại!</p>
              <p className="notification-message">Kế hoạch cai thuốc lá của bạn đã được khôi phục tự động.</p>
            </div>
          </div>
          <button className="notification-close" onClick={() => setShowWelcomeBack(false)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
      
      <div className="stepper-wrapper">
        <h1 className="stepper-title">Kế Hoạch Cai Thuốc</h1>
        {/* Stepper header */}
        <div className="steps-container">
          {steps.map((step, index) => (            <React.Fragment key={step.id}>
              <div 
                className={`step-item ${currentStep >= step.id ? 'active' : ''} ${currentStep > step.id || isCompleted ? 'completed' : ''}`}
                onClick={() => {
                if (step.id <= currentStep || isCompleted) {
                  // Add animation for progress bar and step changes
                  setCurrentStep(step.id);

                  // Nếu đã hoàn thành, có thể xem lại nhưng không đổi trạng thái hoàn thành
                  if (!isCompleted) {
                    animateProgressBar(step.id);
                  }

                  // Add visual feedback on click
                  const circle = document.querySelector(`.step-item:nth-child(${step.id * 2 - 1}) .step-circle`);
                  if (circle) {
                    circle.classList.add('pulse');
                    setTimeout(() => circle.classList.remove('pulse'), 500);
                  }

                  // Tạm thời ẩn màn hình hoàn thành để xem chi tiết các bước
                  if (isCompleted) {
                    setShowCompletionScreen(false);
                  }
                }
              }}
            >
              <div className="step-circle">
                {currentStep > step.id || isCompleted ? '✓' : step.id}
              </div>              <div className="step-name">{step.name}</div>
            </div>
            </React.Fragment>
          ))}
        </div>        {/* Form content */}
        <div className="stepper-content">          {isCompleted && showCompletionScreen ? (
            <div className="completion-screen">
              <div className="completion-checkmark-container">
                <div className="completion-checkmark">✓</div>
              </div>              <h2 className="completion-title">Chúc mừng bạn đã tạo kế hoạch cai thuốc!</h2>
              <p className="completion-subtitle">Hành trình mới của bạn bắt đầu từ hôm nay</p>

              {/* Tóm tắt kế hoạch */}
              <div className="plan-summary-container">
                <h3 className="summary-title">Kế hoạch của bạn</h3>
                <div className="plan-summary-card">
                  <div className="plan-summary-header" style={{ backgroundColor: formData.selectedPlan?.color || '#2570e8' }}>
                    <h4>{formData.selectedPlan?.name || "Kế hoạch cai thuốc"}</h4>
                    <p>{formData.selectedPlan?.description || ""}</p>
                  </div>
                  <div className="plan-summary-body">
                    <div className="plan-summary-item">
                      <span className="summary-label">Số điếu/ngày:</span>
                      <span className="summary-value">{formData.cigarettesPerDay}</span>
                    </div>
                    <div className="plan-summary-item">
                      <span className="summary-label">Giá mỗi gói:</span>
                      <span className="summary-value">{formData.packPrice.toLocaleString()} VNĐ</span>
                    </div>
                    <div className="plan-summary-item">
                      <span className="summary-label">Số năm hút thuốc:</span>
                      <span className="summary-value">{formData.smokingYears} năm</span>
                    </div>
                    <div className="plan-summary-item">
                      <span className="summary-label">Lý do cai thuốc:</span>
                      <span className="summary-value">{formData.reasonToQuit}</span>
                    </div>                    <div className="plan-summary-item">
                      <span className="summary-label">Thời gian dự kiến:</span>
                      <span className="summary-value">
                        {(() => {
                          // Đảm bảo hiển thị đúng số tuần
                          if (formData.selectedPlan?.totalWeeks) {
                            return `${formData.selectedPlan.totalWeeks} tuần`;
                          } else if (formData.selectedPlan?.weeks) {
                            return `${formData.selectedPlan.weeks.length} tuần`;
                          } else {
                            // Lấy thông tin kế hoạch từ localStorage nếu cần
                            const storedPlan = localStorage.getItem('activePlan');
                            if (storedPlan) {
                              const parsedPlan = JSON.parse(storedPlan);
                              if (parsedPlan.totalWeeks) {
                                return `${parsedPlan.totalWeeks} tuần`;
                              } else if (parsedPlan.weeks) {
                                return `${parsedPlan.weeks.length} tuần`;
                              }
                            }
                            return '0 tuần'; // Fallback nếu không tìm thấy dữ liệu
                          }
                        })()}
                      </span>
                    </div>
                    <div className="plan-summary-item">
                      <span className="summary-label">Kế hoạch được tạo:</span>
                      <span className="summary-value">
                        {(() => {
                          const savedPlan = localStorage.getItem('quitPlanCompletion');
                          if (savedPlan) {
                            const { completionDate } = JSON.parse(savedPlan);
                            const date = new Date(completionDate);
                            return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN')}`;
                          }
                          return new Date().toLocaleString('vi-VN');
                        })()}
                      </span>
                    </div>
                    {(() => {
                      const savedPlan = localStorage.getItem('quitPlanCompletion');
                      if (savedPlan) {
                        const { lastEdited, completionDate } = JSON.parse(savedPlan);
                        // Chỉ hiển thị thời gian cập nhật nếu khác với thời gian tạo
                        if (lastEdited && lastEdited !== completionDate) {
                          const date = new Date(lastEdited);
                          return (
                            <div className="plan-summary-item">
                              <span className="summary-label">Cập nhật lần cuối:</span>
                              <span className="summary-value">
                                {`${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN')}`}
                              </span>
                            </div>
                          );
                        }
                      }
                      return null;
                    })()}
                  </div>                  <div className="plan-edit-options">
                    <button className="btn-edit-plan" onClick={() => handleEditPlan(1)}>
                      <i className="fas fa-pencil-alt"></i> Chỉnh sửa thói quen
                    </button>
                    <button className="btn-edit-plan" onClick={() => handleEditPlan(2)}>
                      <i className="fas fa-list-alt"></i> Chỉnh sửa kế hoạch
                    </button>
                    <button className="btn-edit-plan btn-clear-plan" onClick={handleClearPlan}>
                      <i className="fas fa-trash-alt"></i> Bắt đầu lại
                    </button>
                  </div>
                  <div className="plan-share-container">
                    <button className="btn-share-plan" onClick={handleSharePlan}>
                      <i className="fas fa-share-alt"></i> Chia sẻ kế hoạch của bạn
                    </button>
                  </div>
                  <div className="plan-persistence-notice">
                    <i className="fas fa-info-circle"></i> 
                    Kế hoạch của bạn đã được lưu tự động. Bạn có thể quay lại bất kỳ lúc nào mà không cần tạo lại.
                  </div>
                </div>
              </div>

              <div className="completion-stats">
                <div className="completion-stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-value">{Math.round(yearlySpending).toLocaleString()} VNĐ</div>
                  <div className="stat-label">Tiết kiệm mỗi năm</div>
                </div>
                <div className="completion-stat-card">
                  <div className="stat-icon">🚬</div>
                  <div className="stat-value">{formData.cigarettesPerDay * 365}</div>
                  <div className="stat-label">Điếu thuốc không hút mỗi năm</div>
                </div>
                <div className="completion-stat-card">
                  <div className="stat-icon">⏱️</div>
                  <div className="stat-value">
                    {(() => {
                      // Đảm bảo hiển thị đúng số tháng
                      let totalWeeks = 0;
                      if (formData.selectedPlan?.totalWeeks) {
                        totalWeeks = formData.selectedPlan.totalWeeks;
                      } else if (formData.selectedPlan?.weeks) {
                        totalWeeks = formData.selectedPlan.weeks.length;
                      } else {
                        // Lấy thông tin kế hoạch từ localStorage nếu cần
                        const storedPlan = localStorage.getItem('activePlan');
                        if (storedPlan) {
                          const parsedPlan = JSON.parse(storedPlan);
                          if (parsedPlan.totalWeeks) {
                            totalWeeks = parsedPlan.totalWeeks;
                          } else if (parsedPlan.weeks) {
                            totalWeeks = parsedPlan.weeks.length;
                          }
                        }
                      }
                      return (totalWeeks / 4).toFixed(1);
                    })()}
                  </div>
                  <div className="stat-label">Tháng thực hiện dự kiến</div>
                </div>
              </div>
              <div className="completion-timeline">
                <h3 className="timeline-title">Những lợi ích sức khỏe bạn sẽ nhận được</h3>
                <div className="timeline-container">
                  {healthBenefits.slice(0, 4).map((benefit, index) => (
                    <div className="timeline-milestone" key={index}>
                      <div className="milestone-time">{benefit.time}</div>
                      <div className="milestone-connector"></div>
                      <div className="milestone-benefit">{benefit.benefit}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="completion-actions">
                <h3 className="actions-title">Tiếp theo bạn nên làm gì?</h3>
                <div className="action-buttons">
                  <a href="/dashboard" className="action-button primary">
                    <span className="action-icon">📊</span>
                    <span className="action-text">Theo dõi tiến độ</span>
                  </a>
                  <a href="/community" className="action-button secondary">
                    <span className="action-icon">👥</span>
                    <span className="action-text">Tham gia cộng đồng</span>
                  </a>
                  <a href="/resources" className="action-button secondary">
                    <span className="action-icon">📚</span>
                    <span className="action-text">Tài liệu hỗ trợ</span>
                  </a>
                </div>
              </div>              <div className="completion-motivation">
                <blockquote>
                  "Hành trình ngàn dặm bắt đầu từ một bước chân. Hôm nay bạn đã bước những bước đầu tiên để hướng tới cuộc sống khỏe mạnh hơn."
                </blockquote>
              </div>
              <div className="back-to-plan">
                <p>Bạn có thể chỉnh sửa kế hoạch bất cứ lúc nào bằng cách nhấn vào nút chỉnh sửa tương ứng với từng phần.</p>
                <div className="edit-plan-buttons">
                  <button className="btn-edit-all" onClick={() => handleEditPlan(1)}>
                    <i className="fas fa-edit"></i> Chỉnh sửa toàn bộ kế hoạch
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {currentStep === 1 && (
                <div className="step-form">
                  <div className="form-header">
                    <div className="form-icon">📋</div>
                    <h2 className="form-title">Thông tin thói quen hút thuốc</h2>
                  </div>
                  <p className="form-description">Vui lòng nhập thông tin thực tế để kế hoạch chính xác hơn.</p>
                  <div className="form-group">
                    <label className="form-label">Bạn hút bao nhiêu điếu mỗi ngày?</label>
                    <div className="input-group">
                      <div className="input-icon">🚬</div>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="10 điếu/ngày"
                        value={formData.cigarettesPerDay}
                        onChange={(e) => handleNumberInput('cigarettesPerDay', e)}
                      />
                    </div>
                    <small className="input-tip">Số lượng điếu thuốc trung bình bạn hút mỗi ngày</small>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Một bao thuốc giá trung bình?</label>
                    <div className="input-group">
                      <div className="input-icon">💰</div>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="25000 VNĐ"
                        value={formData.packPrice}
                        onChange={(e) => handleNumberInput('packPrice', e)}
                      />
                    </div>
                    <small className="input-tip">Giá trung bình một bao thuốc bạn thường mua (VNĐ)</small>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bạn đã hút thuốc bao lâu?</label>
                    <div className="input-group">
                      <div className="input-icon">🗓️</div>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="5 năm"
                        value={formData.smokingYears}
                        onChange={(e) => handleNumberInput('smokingYears', e)}
                      />
                    </div>
                    <small className="input-tip">Số năm bạn đã hút thuốc</small>
                  </div>
                  <div className="stats-summary">
                    <div className="stats-card">
                      <div className="stats-value">{Math.round(dailySpending).toLocaleString()} VNĐ</div>
                      <div className="stats-label">Chi phí mỗi ngày</div>
                    </div>
                    <div className="stats-card">
                      <div className="stats-value">{Math.round(monthlySpending).toLocaleString()} VNĐ</div>
                      <div className="stats-label">Chi phí mỗi tháng</div>
                    </div>
                    <div className="stats-card highlight">
                      <div className="stats-value">{Math.round(yearlySpending).toLocaleString()} VNĐ</div>
                      <div className="stats-label">Chi phí mỗi năm</div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Lý do bạn muốn cai thuốc</label>
                    <div className="reasons-container">
                      <div className="reason-option" onClick={() => handleInputChange('reasonToQuit', 'sức khỏe')}>
                        <input
                          type="radio"
                          name="reasonToQuit"
                          checked={formData.reasonToQuit === 'sức khỏe'}
                          onChange={() => { }}
                        />
                        <div className="reason-content">
                          <div className="reason-icon">❤️</div>
                          <div className="reason-text">Vì sức khỏe</div>
                        </div>
                      </div>

                      <div className="reason-option" onClick={() => handleInputChange('reasonToQuit', 'gia đình')}>
                        <input
                          type="radio"
                          name="reasonToQuit"
                          checked={formData.reasonToQuit === 'gia đình'}
                          onChange={() => { }}
                        />
                        <div className="reason-content">
                          <div className="reason-icon">👨‍👩‍👧‍👦</div>
                          <div className="reason-text">Vì gia đình</div>
                        </div>
                      </div>

                      <div className="reason-option" onClick={() => handleInputChange('reasonToQuit', 'tiết kiệm')}>
                        <input
                          type="radio"
                          name="reasonToQuit"
                          checked={formData.reasonToQuit === 'tiết kiệm'}
                          onChange={() => { }}
                        />
                        <div className="reason-content">
                          <div className="reason-icon">💵</div>
                          <div className="reason-text">Tiết kiệm chi phí</div>
                        </div>
                      </div>

                      <div className="reason-option" onClick={() => handleInputChange('reasonToQuit', 'thử thách')}>
                        <input
                          type="radio"
                          name="reasonToQuit"
                          checked={formData.reasonToQuit === 'thử thách'}
                          onChange={() => { }}
                        />
                        <div className="reason-content">
                          <div className="reason-icon">🏆</div>
                          <div className="reason-text">Thử thách bản thân</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">                {isCompleted ? (
                    <button className="btn-back-to-summary" onClick={handleBackToSummary}>
                      Xem tổng quan kế hoạch
                    </button>
                  ) : (
                    <button className="btn-next" onClick={handleContinue}>
                      Tiếp tục <span className="btn-arrow">→</span>
                    </button>
                  )}
                  </div>
                </div>
              )}
              {currentStep === 2 && (
                <div className="step-form">
                  {/* Nếu chưa chọn kế hoạch - hiển thị màn hình chọn kế hoạch */}
                  {!formData.selectedPlan ? (
                    <>
                      <div className="form-header">
                        <div className="form-icon">🎯</div>
                        <h2 className="form-title">Chọn kế hoạch cai thuốc</h2>
                      </div>
                      <p className="form-description">
                        Dựa trên tình trạng hút thuốc của bạn (<strong>{formData.cigarettesPerDay} điếu/ngày</strong>),
                        chúng tôi có 2 kế hoạch khoa học phù hợp để bạn lựa chọn:
                      </p>

                      <div className="smoking-level-info">
                        <div className="level-badge">
                          {formData.cigarettesPerDay < 10 ?
                            <span className="level-light">Mức độ nhẹ (&lt; 10 điếu/ngày)</span> :
                            formData.cigarettesPerDay <= 20 ?
                              <span className="level-moderate">Mức độ trung bình (10-20 điếu/ngày)</span> :
                              <span className="level-heavy">Mức độ nặng (&gt; 20 điếu/ngày)</span>
                          }
                        </div>
                      </div>

                      <div className="plan-options">
                        {(() => {
                          let plans = [];
                          if (formData.cigarettesPerDay < 10) {
                            plans = generateLightSmokerPlans();
                          } else if (formData.cigarettesPerDay <= 20) {
                            plans = generateModerateSmokerPlans();
                          } else {
                            plans = generateHeavySmokerPlans();
                          }

                          return plans.map((plan) => (
                            <div
                              key={plan.id}
                              className={`plan-option ${
                                // Đảm bảo so sánh ID đúng cho cả trường hợp selectedPlan là object hoặc ID
                                (typeof formData.selectedPlan === 'object' 
                                  ? formData.selectedPlan?.id === plan.id 
                                  : formData.selectedPlan === plan.id) 
                                  ? 'selected' : ''
                              }`}
                              onClick={() => {
                                console.log('Đã chọn kế hoạch mới:', plan);
                                handleInputChange('selectedPlan', plan.id);
                                
                                // Nếu đang ở chế độ chỉnh sửa, hiển thị thông báo
                                if (isEditing) {
                                  console.log('Thời gian dự kiến mới:', plan.totalWeeks, 'tuần');
                                }
                              }}
                            >
                              <div className="plan-header">
                                <div className="plan-icon" style={{ backgroundColor: plan.color }}>
                                  {plan.id === 1 ? '⚡' : '🐌'}
                                </div>
                                <div className="plan-info">
                                  <h3 className="plan-name">{plan.name}</h3>
                                  <p className="plan-subtitle">{plan.subtitle}</p>
                                </div>
                                <div className="plan-duration">
                                  <span className="duration-number">{plan.totalWeeks}</span>
                                  <span className="duration-text">tuần</span>
                                </div>
                              </div>

                              <div className="plan-details">
                                <p><strong>Mô tả:</strong> {plan.description}</p>
                                <p><strong>Giảm mỗi tuần:</strong> {Math.round(plan.weeklyReductionRate * 100)}% so với tuần trước</p>

                                <div className="plan-preview">
                                  <h4>Lịch trình:</h4>
                                  <div className="preview-timeline">
                                    {plan.weeks.slice(0, 3).map((week, weekIndex) => (
                                      <div key={weekIndex} className="preview-week">
                                        <span>Tuần {week.week}: {week.amount} điếu</span>
                                      </div>
                                    ))}
                                    {plan.weeks.length > 3 && <div className="preview-more">...</div>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>                      <div className="form-actions">
                        {isEditing ? (
                          <>
                            <button className="btn-back" onClick={() => {
                              setIsEditing(false);
                              setShowCompletionScreen(true);
                              setCurrentStep(4);
                            }}>
                              <span className="btn-arrow">←</span> Hủy chỉnh sửa
                            </button>
                            <button
                              className="btn-save-edit"
                              onClick={handleSaveEdit}
                              disabled={!formData.selectedPlan}
                            >
                              Lưu thay đổi
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="btn-back" onClick={handleBackInStep2}>
                              <span className="btn-arrow">←</span> Quay lại
                            </button>
                            <button
                              className="btn-next"
                              onClick={handleContinue}
                              disabled={!formData.selectedPlan}
                            >
                              Tiếp tục <span className="btn-arrow">→</span>
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    /* Hiển thị kế hoạch đã chọn */
                    <>
                      <div className="form-header">
                        <div className="form-icon">📈</div>
                        <h2 className="form-title">Kế hoạch giảm dần đã chọn</h2>
                      </div>
                      <p className="form-description">
                        Dưới đây là lịch trình giảm dần số điếu thuốc bạn hút mỗi ngày.
                      </p>

                      {reductionPlan && (
                        <>
                          <div className="plan-description">
                            <p>Dựa trên thông tin bạn cung cấp, chúng tôi đã tạo kế hoạch cai thuốc khoa học trong <strong>{reductionPlan.totalWeeks} tuần</strong> cho bạn.
                              Hiện tại bạn hút khoảng <strong>{formData.cigarettesPerDay} điếu mỗi ngày</strong>.</p>
                          </div>

                          <div className="phase-legend">
                            <h4>Các giai đoạn cai thuốc:</h4>
                            <div className="legend-items">
                              <div className="legend-item">
                                <span className="legend-color" style={{ backgroundColor: '#17a2b8' }}></span>
                                <span>Thích nghi</span>
                              </div>
                              <div className="legend-item">
                                <span className="legend-color" style={{ backgroundColor: '#28a745' }}></span>
                                <span>Ổn định</span>
                              </div>
                              <div className="legend-item">
                                <span className="legend-color" style={{ backgroundColor: '#ffc107' }}></span>
                                <span>Hoàn thiện</span>
                              </div>
                            </div>
                          </div>

                          <div className="timeline-container">
                            <div className="timeline-header">
                              <div>Tuần</div>
                              <div>Số điếu/ngày</div>
                              <div>Giảm</div>
                              <div>Giai đoạn</div>
                            </div>

                            {reductionPlan.weeks && reductionPlan.weeks.map((week, index) => (
                              <div className="timeline-item" key={index}>
                                <div className="timeline-week">Tuần {week.week}</div>
                                <div className="timeline-amount">{week.amount} điếu</div>
                                <div className="timeline-reduction">-{week.reduction}</div>
                                <div
                                  className="timeline-phase"
                                  style={{
                                    backgroundColor: week.phase === 'Thích nghi' ? '#17a2b8' :
                                      week.phase === 'Ổn định' ? '#28a745' : '#ffc107',
                                    color: 'white',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {week.phase}
                                </div>
                              </div>
                            ))}

                            <div className="timeline-item complete">
                              <div className="timeline-week">Mục tiêu</div>
                              <div className="timeline-amount">0 điếu</div>
                              <div className="timeline-reduction">✅</div>                              <div
                                className="timeline-phase"
                                style={{ backgroundColor: '#28a745' }}
                              >
                                Mục tiêu đạt được
                              </div>
                            </div>
                          </div>

                          <div className="tips-container">
                            <h3 className="tips-title">Mẹo vượt qua thời kỳ khó khăn:</h3>
                            <ul className="tips-list">
                              <li>Tìm thú vui thay thế như đọc sách, nghe nhạc hoặc tập thể dục</li>
                              <li>Tránh xa những nơi bạn thường hút thuốc</li>
                              <li>Giữ tay bạn bận rộn với một thứ gì đó như bút, tăm hoặc kẹo cao su không đường</li>
                              <li>Uống nhiều nước để giúp cơ thể đào thải độc tố nhanh hơn</li>
                              <li>Tìm sự hỗ trợ từ bạn bè và gia đình</li>
                            </ul>
                          </div>
                        </>
                      )}                      <div className="form-actions">
                        {isEditing ? (
                          <>
                            <button className="btn-back" onClick={() => {
                              setIsEditing(false);
                              setShowCompletionScreen(true);
                              setCurrentStep(4);
                            }}>
                              <span className="btn-arrow">←</span> Hủy chỉnh sửa
                            </button>
                            <button className="btn-next" onClick={handleContinue}>
                              Tiếp tục <span className="btn-arrow">→</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="btn-back" onClick={handleBackInStep2}>
                              <span className="btn-arrow">←</span> Quay lại
                            </button>
                            <button className="btn-next" onClick={handleContinue}>
                              Tiếp tục <span className="btn-arrow">→</span>
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
              {currentStep === 3 && (
                <div className="step-form">
                  <div className="form-header">
                    <div className="form-icon">🌟</div>
                    <h2 className="form-title">Lợi ích khi cai thuốc</h2>
                  </div>
                  <p className="form-description">Những lợi ích tuyệt vời bạn sẽ nhận được khi cai thuốc thành công</p>
                  <div className="benefits-categories">
                    <div className="benefit-category">
                      <div className="category-header">
                        <div className="category-icon">💰</div>
                        <h3 className="category-title">Lợi ích tài chính</h3>
                      </div>
                      <div className="savings-calculator">
                        <div className="savings-item">
                          <span className="savings-label">Tiết kiệm mỗi tháng:</span>
                          <span className="savings-value">{Math.round(monthlySpending).toLocaleString()} VNĐ</span>
                        </div>
                        <div className="savings-item">
                          <span className="savings-label">Tiết kiệm mỗi năm:</span>
                          <span className="savings-value">{Math.round(yearlySpending).toLocaleString()} VNĐ</span>
                        </div>
                        <div className="savings-item total">
                          <span className="savings-label">Tiết kiệm trong 10 năm:</span>
                          <span className="savings-value">{Math.round(yearlySpending * 10).toLocaleString()} VNĐ</span>
                        </div>
                      </div>
                      <div className="savings-suggestion">
                        <p>Với số tiền này bạn có thể:</p>
                        <ul>
                          <li>Đi du lịch nước ngoài mỗi năm</li>
                          <li>Mua sắm những món đồ yêu thích</li>
                          <li>Đầu tư cho tương lai và hưu trí</li>
                        </ul>
                      </div>
                    </div>
                    <div className="benefit-category">
                      <div className="category-header">
                        <div className="category-icon">❤️</div>
                        <h3 className="category-title">Lợi ích sức khỏe</h3>
                      </div>
                      <div className="health-timeline">
                        {healthBenefits.map((benefit, index) => (
                          <div className="health-item" key={index}>
                            <div className="health-time">{benefit.time}</div>
                            <div className="health-connector"></div>
                            <div className="health-benefit">{benefit.benefit}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="benefit-category">
                      <div className="category-header">
                        <div className="category-icon">😊</div>
                        <h3 className="category-title">Lợi ích khác</h3>
                      </div>
                      <div className="other-benefits">
                        <div className="benefit-item">
                          <div className="benefit-icon">👃</div>
                          <div className="benefit-text">
                            <h4>Cải thiện khứu giác và vị giác</h4>
                            <p>Thưởng thức thức ăn và mùi hương tốt hơn</p>
                          </div>
                        </div>
                        <div className="benefit-item">
                          <div className="benefit-icon">🦷</div>
                          <div className="benefit-text">
                            <h4>Răng và nướu khỏe mạnh hơn</h4>
                            <p>Giảm nguy cơ bệnh nha chu và răng ố vàng</p>
                          </div>
                        </div>
                        <div className="benefit-item">
                          <div className="benefit-icon">👕</div>
                          <div className="benefit-text">
                            <h4>Không còn mùi thuốc lá</h4>
                            <p>Quần áo, tóc và hơi thở không còn mùi khó chịu</p>
                          </div>
                        </div>
                        <div className="benefit-item">
                          <div className="benefit-icon">🏃</div>
                          <div className="benefit-text">
                            <h4>Tăng sức bền và năng lượng</h4>
                            <p>Hoạt động thể chất dễ dàng và bền bỉ hơn</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>                  <div className="form-actions">
                    {isEditing ? (
                      <>
                        <button className="btn-back" onClick={() => {
                          setIsEditing(false);
                          setShowCompletionScreen(true);
                          setCurrentStep(4);
                        }}>
                          <span className="btn-arrow">←</span> Hủy chỉnh sửa
                        </button>
                        <button className="btn-next" onClick={handleContinue}>
                          Tiếp tục <span className="btn-arrow">→</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn-back" onClick={handleBack}>
                          <span className="btn-arrow">←</span> Quay lại
                        </button>
                        <button className="btn-next" onClick={handleContinue}>
                          Tiếp tục <span className="btn-arrow">→</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
              {currentStep === 4 && (
                <div className="step-form">
                  <div className="form-header">
                    <div className="form-icon">✅</div>
                    <h2 className="form-title">Xác nhận kế hoạch</h2>
                  </div>
                  <p className="form-description">Xem lại và xác nhận kế hoạch cai thuốc của bạn</p>

                  <div className="summary-container">
                    <h3 className="summary-title">Tóm tắt kế hoạch cai thuốc của bạn</h3>

                    <div className="summary-section">
                      <h4 className="section-title">Thông tin hiện tại</h4>
                      <div className="summary-grid">
                        <div className="summary-item">
                          <div className="summary-label">Số điếu hút mỗi ngày</div>
                          <div className="summary-value">{formData.cigarettesPerDay} điếu</div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-label">Chi phí mỗi ngày</div>
                          <div className="summary-value">{Math.round(dailySpending).toLocaleString()} VNĐ</div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-label">Chi phí mỗi năm</div>
                          <div className="summary-value">{Math.round(yearlySpending).toLocaleString()} VNĐ</div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-label">Thời gian đã hút thuốc</div>
                          <div className="summary-value">{formData.smokingYears} năm</div>
                        </div>
                      </div>
                    </div>
                    <div className="summary-section">
                      <h4 className="section-title">Mục tiêu của bạn</h4>
                      <div className="summary-grid">
                        <div className="summary-item">
                          <div className="summary-label">Thời gian cai thuốc</div>
                          <div className="summary-value">{formData.targetTimeframe} tháng</div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-label">Lý do cai thuốc</div>
                          <div className="summary-value reason">Vì {formData.reasonToQuit}</div>
                        </div>
                      </div>
                    </div>

                    <div className="commitment-section">
                      <h4>Cam kết của bạn</h4>
                      <div className="commitment-text">
                        <p>Tôi cam kết sẽ tuân theo kế hoạch cai thuốc này và nỗ lực để đạt được mục tiêu sống khỏe mạnh hơn.
                          Mỗi ngày tôi sẽ theo dõi tiến độ và không bỏ cuộc dù có khó khăn.</p>
                      </div>

                      <div className="reminder-section">
                        <h4>Nhắc nhở mỗi ngày</h4>
                        <div className="reminder-options">
                          <label className="reminder-option">
                            <input type="checkbox" defaultChecked />
                            <span className="checkmark"></span>
                            <span>Gửi nhắc nhở qua email</span>
                          </label>
                          <label className="reminder-option">
                            <input type="checkbox" defaultChecked />
                            <span className="checkmark"></span>
                            <span>Nhắc nhở trên ứng dụng</span>
                          </label>
                          <label className="reminder-option">
                            <input type="checkbox" />
                            <span className="checkmark"></span>
                            <span>Thông báo thành tích</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="congratulations-message">
                      <div className="congrats-icon">🎉</div>
                      <div className="congrats-text">                        <h3>Chúc mừng bạn đã lập kế hoạch cai thuốc!</h3>
                        <p>Hãy kiên trì thực hiện, chúng tôi sẽ luôn bên cạnh hỗ trợ bạn trong suốt hành trình này.</p>
                      </div>
                    </div>
                    <div className="support-options">
                      <h4>Các hình thức hỗ trợ</h4>
                      <div className="support-grid">
                        <div className="support-item">
                          <div className="support-icon">👥</div>
                          <div className="support-title">Nhóm hỗ trợ</div>
                          <div className="support-desc">Tham gia cộng đồng cùng mục tiêu</div>
                        </div>
                        <div className="support-item">
                          <div className="support-icon">📱</div>
                          <div className="support-title">Ứng dụng di động</div>
                          <div className="support-desc">Theo dõi tiến độ mọi lúc mọi nơi</div>
                        </div>
                        <div className="support-item">
                          <div className="support-icon">📞</div>
                          <div className="support-title">Hotline tư vấn</div>
                          <div className="support-desc">Gọi ngay khi cần giúp đỡ</div>
                        </div>
                      </div>
                    </div>
                  </div>                  <div className="form-actions">
                  {isEditing ? (
                    <>
                      <button className="btn-back" onClick={() => {
                        setIsEditing(false);
                        setShowCompletionScreen(true);
                        setCurrentStep(4);
                      }}>
                        <span className="btn-arrow">←</span> Hủy chỉnh sửa
                      </button>
                      <button className="btn-save-edit" onClick={handleSaveEdit}>
                        Lưu thay đổi
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn-back" onClick={handleBack}>
                        <span className="btn-arrow">←</span> Quay lại
                      </button>                      {isCompleted ? (
                        <button className="btn-back-to-summary" onClick={handleBackToSummary}>
                          Xem tổng quan kế hoạch
                        </button>
                      ) : (
                        <button className="btn-submit" onClick={handleSubmit}>
                          Lập kế hoạch cai thuốc
                        </button>
                      )}
                    </>
                  )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="stepper-footer">
          © 2025 Kế Hoạch Cai Thuốc • Nền tảng hỗ trợ sức khỏe cộng đồng
        </div>      </div>
    </div>
  );
}
