// import express from 'express';
// const app = express();
// import qs from 'qs';

// import axios from 'axios'; // npm install axios
// import CryptoJS from 'crypto-js'; // npm install crypto-js
// import moment from 'moment'; // npm install moment

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));


// // APP INFO
// const config = {
//     app_id: "2553",
//     key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
//     key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
//     endpoint: "https://sb-openapi.zalopay.vn/v2/create"
// };

// app.post("/payment", async (req, res) => {
//     console.log("Payment request received:", req.body);
    
//     const embed_data = {
//         redirecturl: req.body.redirectUrl || "http://localhost:5175/"
//     };
    
//     const items = [{}];
//     const transID = Math.floor(Math.random() * 1000000);
//     const order = {
//         app_id: config.app_id,
//         app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
//         app_user: req.body.userId || "user123",
//         app_time: Date.now(),
//         item: JSON.stringify(items),
//         embed_data: JSON.stringify(embed_data),
//         amount: req.body.amount || 99000,
//     description: `NoSmoke - Payment for the order #${transID}`,
//     bank_code: "",
//     callback_url: "http://localhost:5000/callback"
// };

// // appid|app_trans_id|appuser|amount|apptime|embeddata|item
// const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
// order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

//     try {
//         const result = await axios.post(config.endpoint, null, { params: order });
//         console.log(result.data);
//         // Trả về kết quả cho client
//         res.json({
//             success: true,
//             data: result.data,
//             order_url: result.data.order_url // URL thanh toán ZaloPay
//         });
//     } catch (error) {
//         console.log(error.message);
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

// app.post('/callback', async (req, res) => {
//   let result = {};

//   try {
//     let dataStr = req.body.data;
//     let reqMac = req.body.mac;

//     let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
//     console.log("mac =", mac);


//     // kiểm tra callback hợp lệ (đến từ ZaloPay server)
//     if (reqMac !== mac) {
//       // callback không hợp lệ
//       result.return_code = -1;
//       result.return_message = "mac not equal";
//     }
//     else {
//       // thanh toán thành công
//       // merchant cập nhật trạng thái cho đơn hàng
//       let dataJson = JSON.parse(dataStr, config.key2);
//       console.log("update order's status = success where app_trans_id =", dataJson["app_trans_id"]);

//       result.return_code = 1;
//       result.return_message = "success";
//     }
//   } catch (ex) {
//     result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
//     result.return_message = ex.message;
//   }

//   // thông báo kết quả cho ZaloPay server
//   res.json(result);
// });

// // Thêm endpoint GET để dễ dàng kiểm tra trạng thái
// app.get("/order-status/:app_trans_id", async (req, res) => {
//     const app_trans_id = req.params.app_trans_id;
//     let postData = {
//         app_id: config.app_id,
//         app_trans_id: app_trans_id
//     };
    
//     let data = postData.app_id + "|" + postData.app_trans_id + "|" + config.key1; // appid|app_trans_id|key1
//     postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
    
//     let postConfig = {
//         method: 'post',
//         url: "https://sb-openapi.zalopay.vn/v2/query",
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded'
//         },
//         data: qs.stringify(postData)
//     };
    
//     try {
//         const result = await axios(postConfig);
//         console.log("Query result for", app_trans_id, ":", result.data);
//         res.status(200).json(result.data);
//     } catch (error) {
//         console.log(error.message);
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

// app.post("/order-status", async (req, res) => {
//     const app_trans_id = req.body.app_trans_id;
//     let postData = {
//         app_id: config.app_id,
//         app_trans_id: app_trans_id, // Input your app_trans_id
// }

// let data = postData.app_id + "|" + postData.app_trans_id + "|" + config.key1; // appid|app_trans_id|key1
// postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();


// let postConfig = {
//     method: 'post',
//     url: "https://sb-openapi.zalopay.vn/v2/query",
//     headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//     },
//     data: qs.stringify(postData)
// };

// try {
//     const result = await axios(postConfig);
//     res.status(200).json(result.data);
// } catch (error) {
//     console.log(error.message);
//     res.status(500).json({ success: false, error: error.message });
// }
// });


// // Phục vụ file HTML đơn giản để test
// app.get('/', (req, res) => {
//     res.send(`
//     <!DOCTYPE html>
//     <html>
//     <head>
//         <title>ZaloPay Test</title>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <style>
//             body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
//             .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
//             button { background: #2196F3; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
//             input, select { padding: 8px; margin: 5px 0; width: 100%; box-sizing: border-box; }
//             .qr-code { text-align: center; margin: 20px 0; }
//             .qr-code img { max-width: 200px; }
//             pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
//             .hidden { display: none; }
//         </style>
//     </head>
//     <body>
//         <h1>ZaloPay Sandbox Test</h1>
        
//         <div class="card">
//             <h2>1. Tạo đơn hàng</h2>
//             <div>
//                 <label>Số tiền:</label>
//                 <input type="number" id="amount" value="50000">
//             </div>
//             <div>
//                 <button id="createOrder">Tạo đơn hàng</button>
//             </div>
//             <div class="qr-code hidden" id="qrCodeContainer">
//                 <h3>Quét mã QR để thanh toán</h3>
//                 <img id="qrCodeImage" src="" alt="ZaloPay QR Code">
//                 <p>hoặc <a id="orderUrl" href="#" target="_blank">Mở trang thanh toán</a></p>
//                 <p>Mã giao dịch: <span id="transID"></span></p>
//             </div>
//             <div>
//                 <h3>Kết quả:</h3>
//                 <pre id="createResult"></pre>
//             </div>
//         </div>
        
//         <div class="card">
//             <h2>2. Kiểm tra trạng thái đơn hàng</h2>
//             <div>
//                 <label>Mã giao dịch:</label>
//                 <input type="text" id="appTransId" placeholder="Ví dụ: 230725_123456">
//             </div>
//             <div>
//                 <button id="checkStatus">Kiểm tra</button>
//             </div>
//             <div>
//                 <h3>Kết quả:</h3>
//                 <pre id="statusResult"></pre>
//             </div>
//         </div>
        
//         <script>
//             document.getElementById('createOrder').addEventListener('click', async () => {
//                 const amount = document.getElementById('amount').value;
//                 try {
//                     const response = await fetch('/payment', {
//                         method: 'POST',
//                         headers: { 'Content-Type': 'application/json' },
//                         body: JSON.stringify({ amount })
//                     });
//                     const result = await response.json();
//                     document.getElementById('createResult').textContent = JSON.stringify(result, null, 2);
                    
//                     if (result.success && result.data && result.data.qr_code) {
//                         document.getElementById('qrCodeContainer').classList.remove('hidden');
//                         document.getElementById('qrCodeImage').src = result.data.qr_code;
//                         document.getElementById('orderUrl').href = result.order_url || result.data.order_url;
//                         document.getElementById('transID').textContent = result.data.app_trans_id || '';
//                         document.getElementById('appTransId').value = result.data.app_trans_id || '';
//                     }
//                 } catch (error) {
//                     document.getElementById('createResult').textContent = 'Error: ' + error.message;
//                 }
//             });
            
//             document.getElementById('checkStatus').addEventListener('click', async () => {
//                 const appTransId = document.getElementById('appTransId').value;
//                 if (!appTransId) {
//                     alert('Vui lòng nhập mã giao dịch');
//                     return;
//                 }
                
//                 try {
//                     const response = await fetch(\`/order-status/\${appTransId}\`);
//                     const result = await response.json();
//                     document.getElementById('statusResult').textContent = JSON.stringify(result, null, 2);
//                 } catch (error) {
//                     document.getElementById('statusResult').textContent = 'Error: ' + error.message;
//                 }
//             });
//         </script>
//     </body>
//     </html>
//     `);
// });

// // Thêm tuyến đường để xử lý CORS và preflight requests
// app.options('*', (req, res) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     res.sendStatus(200);
// });

// // Thêm middleware để xử lý CORS
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     next();
// });

// app.listen(5000, () => {
//     console.log("ZaloPay server is running on port 5000");
//     console.log("Test interface available at http://localhost:5000/");
// });

import express from 'express';
const app = express();
import qs from 'qs';

import axios from 'axios';
import CryptoJS from 'crypto-js';
import moment from 'moment';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const config = {
    app_id: "2553",
    key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
    key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
    endpoint: "https://sb-openapi.zalopay.vn/v2/create"
};

app.post("/payment", async (req, res) => {
    console.log("Payment request received:", req.body);

    const { redirectUrl = "http://localhost:5175/", amount = 99000, packageName = "Premium", userId = "user123" } = req.body;

    const embed_data = { redirecturl: redirectUrl, packageName };
    const items = [{ name: packageName, quantity: 1, price: amount }];

    const transID = Math.floor(Math.random() * 1000000);
    const app_trans_id = `${moment().format('YYMMDD')}_${transID}`;

    const order = {
        app_id: config.app_id,
        app_trans_id,
        app_user: userId,
        app_time: Date.now(),
        item: JSON.stringify(items),
        embed_data: JSON.stringify(embed_data),
        amount,
        description: `NoSmoke - Gói ${packageName} [${app_trans_id}]`,
        bank_code: "",
        callback_url: "http://localhost:5001/callback"
    };

    const data = `${order.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    try {
        const result = await axios.post(config.endpoint, null, { params: order });
        console.log(result.data);
        res.json({ success: true, data: result.data, order_url: result.data.order_url });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/callback', async (req, res) => {
    let result = {};

    try {
        let dataStr = req.body.data;
        let reqMac = req.body.mac;

        let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
        console.log("mac =", mac);

        if (reqMac !== mac) {
            result.return_code = -1;
            result.return_message = "mac not equal";
        } else {
            let dataJson = JSON.parse(dataStr);
            console.log("update order's status = success where app_trans_id =", dataJson["app_trans_id"]);

            result.return_code = 1;
            result.return_message = "success";
        }
    } catch (ex) {
        result.return_code = 0;
        result.return_message = ex.message;
    }

    res.json(result);
});

app.get("/order-status/:app_trans_id", async (req, res) => {
    const app_trans_id = req.params.app_trans_id;
    let postData = { app_id: config.app_id, app_trans_id };
    let data = `${postData.app_id}|${postData.app_trans_id}|${config.key1}`;
    postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    try {
        const result = await axios.post("https://sb-openapi.zalopay.vn/v2/query", qs.stringify(postData), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        res.status(200).json(result.data);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post("/order-status", async (req, res) => {
    const { app_trans_id } = req.body;
    let postData = { app_id: config.app_id, app_trans_id };
    let data = `${postData.app_id}|${postData.app_trans_id}|${config.key1}`;
    postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    try {
        const result = await axios.post("https://sb-openapi.zalopay.vn/v2/query", qs.stringify(postData), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        res.status(200).json(result.data);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.listen(5001, () => {
    console.log("ZaloPay server is running on port 5001");
    console.log("Test interface available at http://localhost:5001/");
});
