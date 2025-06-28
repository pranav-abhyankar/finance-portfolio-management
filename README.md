# 📊 Stock Portfolio Dashboard

The **Stock Portfolio Dashboard** is a powerful web-based application built to manage and visualize stock portfolios in real-time—both for individual users and combined family portfolios. It seamlessly integrates with Google Sheets as a backend, making it fast, simple, and cost-effective.

---

## 💡 What is it?

This dashboard provides an intuitive and elegant interface to monitor investments across multiple users, track live portfolio performance, and analyze overall profit & loss (P&L). It transforms spreadsheet data into a fully interactive, real-time financial dashboard.

---

## 🧠 How it Works

- Each family member has a dedicated sheet containing their stock holdings (`Symbol`, `Qty`, `Average Price`).
- A shared `Sprice` sheet holds the latest stock prices.
- The Google Apps Script backend dynamically calculates:
  - Investment Value
  - Current Market Value
  - Overall Profit & Loss (₹ and %)
- The frontend fetches this data, processes it, and displays it with charts, tables, and summary cards—categorized under Overview, Individual, and Combined tabs.

---

## ⚙️ Technologies Used

| Layer | Tech |
|-------|------|
| **Frontend** | HTML5, CSS3 (Responsive Design), Vanilla JavaScript |
| **Backend** | Google Apps Script (JavaScript-based scripting for Google Sheets) |
| **Database** | Google Sheets (acts as a dynamic and editable data store) |
| **UI/UX** | Modern cards, tab layout, loading animations, mobile responsiveness |

---

## 🧱 Core Functionalities

- 🔄 Real-time data refresh
- 👤 User-wise portfolio management
- 🌐 Combined portfolio analysis
- 📈 Visual indicators for profit/loss
- 📊 Tab-based navigation (Overview, Individual, Combined)
- ❌ Error handling for invalid data
- 💻 Mobile and desktop optimized design

---

## 🔗 Live Deployment


👉 [Click here to open the dashboard](https://script.google.com/macros/s/AKfycbwzdusTPKgP7b5MDrwE1d453oTIVgImTkTsWcR_QkwB0Lihn7i5lv8vpgVDymNd1Yze/exec)


---

## 🧩 Why this project?

- ✅ Replaces cluttered spreadsheets with an organized dashboard
- ✅ No need for external APIs—prices managed via editable `Sprice` sheet
- ✅ Easily expandable for more users or additional metrics
- ✅ Ideal for families or investment groups managing portfolios together

---


