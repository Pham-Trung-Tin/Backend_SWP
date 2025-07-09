/**
 * Script kiểm tra chi tiết tất cả API routes trong hệ thống
 * 
 * Để chạy script:
 * node server/src/scripts/debug-routes.js
 */

import app from '../app.js';
import http from 'http';

// Khởi tạo server tạm thời để kiểm tra route
const PORT = 5999; // Sử dụng port khác để không xung đột với server chính
const server = http.createServer(app);

// Hàm liệt kê chi tiết tất cả routes
function printDetailedRoutes() {
  console.log('\n🔍 DETAILED ROUTES INFORMATION');
  console.log('============================\n');

  // Lấy tất cả stacks từ app
  const stacks = app._router.stack;
  
  // Đếm tổng số routes
  let totalRoutes = 0;
  let paymentRoutes = 0;
  
  // Hàm để in route path đầy đủ
  const getFullPath = (basePath, path) => {
    if (!path) return basePath;
    if (path === '/') return basePath;
    return basePath + (path.startsWith('/') ? path : '/' + path);
  };
  
  // Hàm đệ quy để in tất cả routes
  const printStack = (stack, basePath = '') => {
    stack.forEach(layer => {
      if (layer.route) {
        // Route handler
        const methods = Object.keys(layer.route.methods)
          .filter(m => layer.route.methods[m])
          .map(m => m.toUpperCase())
          .join(',');
          
        const fullPath = getFullPath(basePath, layer.route.path);
        console.log(`[ROUTE] ${methods} ${fullPath}`);
        
        if (fullPath.includes('/payments')) {
          paymentRoutes++;
          console.log(`  → Handler: ${layer.route.stack[0].name || 'anonymous function'}`);
          console.log(`  → Parameters: ${layer.keys.map(k => k.name).join(', ') || 'none'}`);
        }
        
        totalRoutes++;
      } else if (layer.name === 'router') {
        // Router middleware
        let routerPath = '';
        
        if (layer.regexp) {
          routerPath = layer.regexp.toString()
            .replace('/^', '')
            .replace('\\/?(?=\\/|$)', '')
            .replace('/i', '')
            .replace(/\\\//g, '/');
            
          // Clean up the path
          routerPath = routerPath
            .replace(/\(\?:\(\[\^\\\/]\+\?\)\)/g, ':param')
            .replace(/\(\?=\\\/\|\$\)/g, '')
            .replace(/\\/g, '')
            .replace(/\(\[\\\/\]\)\?\(\?\=\\\/\|\$\)/g, '')
            .replace(/\^\//g, '')
            .replace(/\\/g, '')
            .replace(/\?\(\.\*\)/g, '');
        }
        
        console.log(`[ROUTER] ${routerPath}`);
        
        // Process nested routes
        if (layer.handle && layer.handle.stack) {
          printStack(layer.handle.stack, routerPath);
        }
      } else if (layer.name === 'bound dispatch') {
        // Middleware attached to a route
        console.log(`[MIDDLEWARE] ${layer.name}`);
      } else {
        // Application middleware
        console.log(`[MIDDLEWARE] ${layer.name || 'anonymous'}`);
      }
    });
  };
  
  // Print all routes
  printStack(stacks);
  
  console.log(`\nTotal routes: ${totalRoutes}`);
  console.log(`Payment routes: ${paymentRoutes}`);
  
  // Kiểm tra cụ thể route payments/verify
  console.log('\n🔍 Checking specifically for /api/payments/verify route:');
  
  let found = false;
  app._router.stack.forEach(layer => {
    if (layer.name === 'router' && layer.regexp.toString().includes('api')) {
      layer.handle.stack.forEach(innerLayer => {
        if (innerLayer.name === 'router' && innerLayer.regexp.toString().includes('payments')) {
          innerLayer.handle.stack.forEach(routeLayer => {
            if (routeLayer.route && routeLayer.route.path === '/verify') {
              const methods = Object.keys(routeLayer.route.methods).map(m => m.toUpperCase());
              console.log(`✅ FOUND: ${methods} /api/payments/verify`);
              console.log(`  Handler: ${routeLayer.route.stack[0].name || 'anonymous'}`);
              found = true;
            }
          });
        }
      });
    }
  });
  
  if (!found) {
    console.log('❌ Route /api/payments/verify NOT FOUND!');
    console.log('\nPossible issues:');
    console.log('1. Route is not defined correctly in routes/payments.js');
    console.log('2. Module export/import mismatch');
    console.log('3. Router not mounted properly in app.js');
  }
}

// Khởi động server tạm thời để kiểm tra route
server.listen(PORT, () => {
  console.log(`📋 Debug server started on port ${PORT}`);
  console.log('📋 Checking API routes...\n');
  
  // In chi tiết tất cả routes
  printDetailedRoutes();
  
  // Kiểm tra hoàn tất, tắt server
  server.close(() => {
    console.log('\n✅ Routes check complete!');
    process.exit(0);
  });
});
