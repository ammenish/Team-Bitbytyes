# PARIVESH 3.0 🌿
**Next-Generation Environmental Clearance Management System**

PARIVESH 3.0 is a comprehensive web portal designed to streamline, track, and scrutinize environmental, forest, wildlife, and CRZ clearances. Built for the modern web with a focus on ease of use, artificial intelligence, and real-time monitoring.

## 🚀 Key Features

* **Multi-Role Dashboards:** Dedicated workspaces for Proponents (filing), Scrutiny Officers (review), and MoM Creators (meeting minutes).
* **AI-Powered Scrutiny:** Integrates with Gemini AI to automatically assess submitted documents against sector-specific checklists and calculate completeness scores.
* **Auto MoM Generation:** Generates highly structured, professional Meeting Gists and Minutes of Meetings using AI or fallback templates.
* **Smart Workflow & EDS:** Full lifecycle tracking from submission to final clearance, including Essential Documents Sought (EDS) flags and resolutions.
* **Real-time SLAs & Escalations:** Automated background scheduler tracks pending applications and flags those approaching service level agreement deadlines.
* **Payment Integration:** Cashfree integration framework installed, complete with an elegant fallback Simulator for smooth demonstrations.

## 🛠 Tech Stack

* **Frontend:** React + Vite (Fast, modular UI)
* **Backend:** Python + Flask (REST APIs, background schedulers)
* **Database:** SQLite (SQLAlchemy ORM)
* **AI Integration:** Google Generative AI (Gemini 2.0)
* **Payments:** Cashfree SDK
* **Styling:** Vanilla CSS & Inline Styling (Design System)

## 📦 Local Setup Instructions

### 1. Backend Setup
```bash
cd backend

# Create a virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install Flask Flask-SQLAlchemy Flask-JWT-Extended Flask-Cors python-dotenv python-dateutil APScheduler google-generativeai requests qrcode pillow python-docx

# Run the server
python app.py
```
*The backend runs on `http://127.0.0.1:5000`*

### 2. Frontend Setup
```bash
# In the root directory (HUU-main)
npm install

# Start the dev server
npm run dev
```
*The frontend runs on `http://localhost:5173`*

### 3. Environment Variables
Create a `.env` file in the `backend/` folder:
```
SECRET_KEY=super-secret-key-123
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
CASHFREE_APP_ID=cf_test_PLACEHOLDER
CASHFREE_SECRET_KEY=PLACEHOLDER_SECRET
CASHFREE_ENV=TEST
```

## 👥 Demo Users

You can log in and test different system roles using these credentials:

| Role | Username (Email) | Password |
|------|-----------------|----------|
| **Proponent** | `sharma@infraltd.com` | `pass123` |
| **Scrutiny** | `rohit.s@gov.in` | `pass123` |
| **MoM Creator** | `admin.mom@gov.in`| `pass123` |
| **Admin** | `admin@cecb.gov.in` | `admin123` |

## 🎨 UI & Design Ethos
Incorporates deep green palettes, subtle hover animations, glassmorphism elements, and traditional Kalamkari background textures to reflect India's rich environmental heritage.

---
*Built for the Hackathon by Team Bitbytyes.*