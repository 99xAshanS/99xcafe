Here is the **README.md** file content formatted properly:

### **99X Cafe - Management POS**

# **99X Cafe Management System**  
🚀 A **full-stack** **POS & customer ordering system** for 99X Cafe, built using **Node.js (Express.js)**, **HTML, CSS and JavaScript (for POS Management)** and **Tailwind CSS** for UI.

---

## **📌 Features**

### 🔹 **Admin/Management POS** (Runs on `localhost:3000/`)
- **Secure Login** (Admin only)
- **Dashboard** (Sales overview, inventory, recent orders)
- **Orders Management** (View, update, complete orders in real-time)
- **Inventory Management** (Add/edit food items, manage stock)
- **Bookings Management** (View, accept, or cancel table reservations)
- **Sales Reports** (Daily, weekly, and monthly revenue charts)

---

## **📂 Project Structure**
```bash
99xcafe/
 ├── server.js          # Express.js backend (port 3000)
 ├── index.html         # Landing page for the POS
 ├── app/               # POS Management system (port 3000)
 │   ├── index.html     # Management System
 ├── package.json       # Dependencies & scripts
 ├── README.md          # Project documentation
```

---

## **💻 Installation & Setup**

### 1️⃣ **Clone the Repository**
```bash
git clone https://github.com/99xAshanS/99xcafe.git
cd 99xcafe
```

### 2️⃣ **Install Dependencies**
```bash
npm install
```

### 4️⃣ **Run the Server (`localhost:3000/`)**
```bash
node server.js
```

### 5️⃣ **Run the POS Management (`localhost:3000/app/`)**
```bash
cd app
npm run dev
```

---
## **📡 API Endpoints (Express Server at `localhost:3000`)**
| Method | Endpoint | Description |
|--------|---------|------------|
| **GET** | `/api/categories` | Get all menu categories |
| **GET** | `/api/items` | Get all food items |
| **GET** | `/api/seats` | Get available vs reserved seats |
| **POST** | `/api/orders` | Place a new customer order |
| **POST** | `/api/bookings` | Reserve a table |

---

## **🔗 Technologies Used**
- **Frontend:** HTML, Tailwind CSS, JavaScript (Client-side)
- **Backend:** Node.js, Express.js, MySQLite3 (Server-side)
- **Database:** MySQLite3

---

## **🚀 Future Enhancements**
- **Payment Integration** (Stripe, PayPal, Pay at the cafe)
- **Customer Loyalty System** (Discounts for returning customers)
- **Mobile App Support** (PWA or Flutter app)

---

## **🛠 Troubleshooting**
❌ **Database connection error?**  
✅ Make sure MySQL is running and `.env` is correctly configured.

❌ **Server not starting?**  
✅ Check for **port conflicts** (use `netstat -ano | findstr :3000`).

❌ **Customer site not loading?**  
✅ Ensure **server.js is running** (`localhost:3000/api` should be accessible).

---

## **📢 Credits**
Developed by **Ashan Senadheera** for 99X Cafe.  
For inquiries, email **ashans@99x.io**.

---

🔹 *"Making futuristic dining a reality!"* 🍽🚀
```