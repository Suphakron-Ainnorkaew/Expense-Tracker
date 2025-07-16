# Expense Tracker (โปรแกรมติดตามรายรับรายจ่ายและการลงทุน)

## ภาพรวมโปรเจค
Expense Tracker เป็นเว็บแอปพลิเคชันสำหรับบริหารจัดการรายรับ รายจ่าย การออมเงิน และการลงทุน เหมาะสำหรับผู้ที่ต้องการวางแผนการเงินส่วนบุคคล สามารถบันทึกธุรกรรม ดูสรุปยอดเงิน กำหนดเป้าหมายออมเงิน แปลงสกุลเงิน ดูข้อมูลการลงทุน และมีเกมจำลองการเงินเพื่อฝึกทักษะการวางแผน

## ฟีเจอร์หลัก
- **บันทึกรายรับ/รายจ่าย/การลงทุน**: เพิ่ม แก้ไข ลบ และดูประวัติธุรกรรม
- **สรุปยอดและกราฟ**: แสดงรายงานสรุปยอดเงินเข้า-ออก กราฟเปรียบเทียบรายเดือน/ปี
- **เป้าหมายการออมเงิน**: ตั้งเป้าหมายออมเงินและติดตามความคืบหน้า
- **แปลงสกุลเงิน**: ดูอัตราแลกเปลี่ยนและคำนวณแปลงสกุลเงินต่างประเทศ
- **ข้อมูลการลงทุน**: ดูข้อมูลคริปโต (Bitcoin, Ethereum ฯลฯ) และตัวเลือกการลงทุนแบบต่าง ๆ
- **เกมจำลองการเงิน**: เกม Wealth Builder ฝึกวางแผนการเงินและการลงทุน
- **ระบบสมาชิก**: สมัครสมาชิก, ล็อกอิน, จัดการข้อมูลผู้ใช้
- **หน้าผู้ดูแลระบบ**: สำหรับแอดมินดูรายชื่อสมาชิกทั้งหมด

## สถาปัตยกรรมและโครงสร้างระบบ
- **Frontend**: React (SPA) เชื่อมต่อ API ด้วย fetch/axios, UI ทันสมัย รองรับมือถือ
- **Backend**: Node.js + Express.js ให้บริการ REST API เชื่อมต่อฐานข้อมูล MySQL
- **Database**: MySQL (ใช้ connection pool)
- **API**: RESTful API สำหรับธุรกรรม, ผู้ใช้, อัตราแลกเปลี่ยน, การลงทุน ฯลฯ
- **Authentication**: ระบบล็อกอิน/สมัครสมาชิก (ยังไม่มี JWT/Token)
- **การเชื่อมต่อข้อมูลลงทุน/อัตราแลกเปลี่ยน**: ดึงข้อมูลจาก CoinGecko API และฐานข้อมูล

## เทคโนโลยีที่ใช้
### Frontend
- React 19, React Router, Chart.js, react-chartjs-2
- Tailwind CSS (ผ่าน className)
- axios, lucide-react (icon)

### Backend
- Node.js, Express.js
- MySQL2 (promise), dotenv, cors, nodemon

### อื่น ๆ
- CoinGecko API (ข้อมูลคริปโต)
- RESTful API

## วิธีติดตั้งและใช้งาน
### 1. Clone โปรเจค
```bash
git clone <repo-url>
cd expense-tracker
```

### 2. ติดตั้งและรัน Backend
```bash
cd backend
npm install
# ตั้งค่า .env สำหรับ MySQL (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
npm run dev
# หรือ npm start
```

### 3. ติดตั้งและรัน Frontend
```bash
cd ../frontend
npm install
npm start
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## โครงสร้างโฟลเดอร์
```
expense-tracker/
  backend/           # โค้ดฝั่งเซิร์ฟเวอร์ (Node.js/Express)
    config/          # การเชื่อมต่อฐานข้อมูล
    routes/          # API endpoint (auth, transactions, currency, investor, users)
    public/          # ไฟล์ static
    server.js        # จุดเริ่มต้น backend
  frontend/          # โค้ดฝั่งผู้ใช้ (React)
    src/
      pages/         # หน้าแต่ละฟีเจอร์ (Home, Login, Register, Graph, Investor, Currency, Admin, Game)
      components/    # UI component ย่อย
      App.js         # Routing หลัก
```

## เครดิตและหมายเหตุ
- พัฒนาเพื่อการศึกษา/ฝึกฝนการเขียนเว็บแอปพลิเคชัน
- **หมายเหตุ:** ตัวอย่างนี้ยังไม่มีระบบเข้ารหัสรหัสผ่าน/Token ที่ปลอดภัยสำหรับ production
- สามารถนำไปต่อยอด เพิ่มฟีเจอร์ หรือปรับปรุงความปลอดภัยได้
