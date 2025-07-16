// Manual progress clear utility
import progressService from './client/src/services/progressService.js';

export const manualClearProgress = async () => {
    try {
        console.log('🔍 Manual progress clearing initiated...');
        
        const result = await progressService.forceCleanAllProgress();
        
        if (result) {
            console.log('✅ Manual progress clear completed successfully');
            return {
                success: true,
                message: 'Tất cả dữ liệu tiến trình đã được xóa thành công'
            };
        } else {
            console.log('⚠️ Manual progress clear partially completed');
            return {
                success: false,
                message: 'Xóa dữ liệu tiến trình có một số vấn đề'
            };
        }
        
    } catch (error) {
        console.error('❌ Error in manual progress clear:', error);
        return {
            success: false,
            message: 'Lỗi khi xóa dữ liệu tiến trình: ' + error.message
        };
    }
};

// Call this function if needed
// manualClearProgress().then(result => console.log(result));
