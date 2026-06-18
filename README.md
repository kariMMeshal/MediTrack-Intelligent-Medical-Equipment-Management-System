# 🏥 MediTrack: Intelligent Medical Equipment Management System

MediTrack is a production-grade, AI-assisted biomedical equipment management platform. It combines a secure **Spring Boot enterprise backend**, a **Python Flask ML API** for predictive maintenance, a **React + Vite + Tailwind CSS frontend dashboard**, and real-time Server-Sent Events (SSE) to monitor, manage, and predict medical device lifecycles and failures.

Developed by **Kareem Hamdy Meshal** as an AI-assisted biomedical equipment management graduation project.

---
## 🚀 MediTrack is Live!

The MediTrack system has been successfully deployed and is publicly accessible.

🌐 **Try the application here:**

👉 **https://medicalequ.vercel.app/**

---


### Features Available in the Live Version

✅ Equipment Management  
✅ Maintenance Scheduling  
✅ Alert Generation  
✅ AI Risk Assessment  
✅ JWT Authentication & Authorization  
✅ Audit Logging  
✅ Responsive User Interface

## 🏗️ Project Architecture & Components

The workspace is organized as a unified monorepo divided into three specialized service components:

```text
Final_Project_Compined/
├── meditrack-frontend/      # React + Vite frontend dashboard client
│   └── apps/Frontend/       # Main React codebase (Runs on Port 5173)
├── meditrack-backend/       # Spring Boot 3 enterprise application (Runs on Port 8080)
│   └── src/                 # Java source code (MVC structure)
└── ai-services/             # Python Flask ML services (Runs on Port 5000)
    ├── ml_api/              # Random Forest & LSTM inference API
    └── notebooks/           # Model training Jupyter Notebooks
```

### 1. 🔐 Enterprise Backend (`meditrack-backend`)
- **Core Tech**: Java 21, Spring Boot 3, Spring Security, Spring Data JPA, Hibernate.
- **Database**: MySQL, with automated schema migrations managed via Flyway.
- **Security**: JWT Authentication (Access + Refresh tokens with rotation/revocation), per-IP rate-limiting using Bucket4j, secure headers (HSTS, CSP, XSS protection), and password hashing (BCrypt strength 12).
- **AI Security Layer**: Prompts are sanitized with safety guards against prompt injection, jailbreaking, and oversized payload limits before reaching LLM endpoints.
- **AI Integrations**: Integrated with Groq (Primary) and OpenRouter (Fallback) for chatbot support and automated medical equipment report generation.

### 2. 🤖 Predictive ML Service (`ai-services`)
- **Core Tech**: Python 3.10+, Flask, TensorFlow/Keras, Scikit-Learn, Pandas, Numpy.
- **Models**:
  - **LSTM Failure Predictor**: Analyzes 30-step time-series sequences of sensor data (temperature, voltage, vibration) to forecast equipment failure.
  - **Random Forest Risk Classifier**: Assesses technical device details, age, maintenance history, and MTBF to categorize risk classes (Low, Medium, High).
- **Integration**: The Spring Boot backend acts as a gateway proxying requests to this service.

### 3. 💻 Admin Dashboard (`meditrack-frontend`)
- **Core Tech**: React 19, Vite 8, Tailwind CSS, Framer Motion, Chart.js.
- **Features**: Highly interactive UI with support for light/dark themes, responsive charts, automated report creation, real-time alert notifications (SSE), inventory tracking, and Role-Based Access Control (RBAC) supporting **ADMIN**, **BIOMED**, and **USER** dashboard portals.

---

## ⚙️ Quick Start (Docker Containerized)

The absolute easiest way to run the entire system is using Docker. Ensure you have Docker and Docker Compose installed.

### Step 1: Set Up Environment Variables
Create a `.env` file in the `meditrack-backend` directory based on the `local.env.example` template:
```bash
cp meditrack-backend/local.env.example meditrack-backend/.env
```
Ensure you fill in your database credentials and API keys (e.g., `GROQ_API_KEY`, `OPENROUTER_API_KEY`).

### Step 2: Build and Run Services
From the **root directory** of the project, spin up the backend infrastructure (MySQL, Redis, Spring Boot Backend):
```bash
cd meditrack-backend
docker-compose up --build -d
```
Then, spin up the AI services API:
```bash
cd ../ai-services
docker-compose up --build -d
```
The application components will be accessible at:
- **Backend API**: `http://localhost:8080`
- **AI Service API**: `http://localhost:5000`
- **Frontend Dashboard**: (Run the frontend manually, see instructions below)

---

## 🛠️ Manual Step-by-Step Installation

If you prefer running the components directly on your local system without Docker, follow these instructions.

### 1. 🗄️ Database Setup (MySQL)
1. Install and start a **MySQL Server** instance (Port `3306`).
2. Log in and create a new schema named `meditrack`:
   ```sql
   CREATE DATABASE meditrack;
   ```
3. (Optional) Run a Redis server on port `6379` if you wish to use the Redis-backed features.

---

### 2. 🤖 ML Service Setup (`ai-services`)
1. Navigate to the AI directory:
   ```bash
   cd ai-services
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the Flask server:
   ```bash
   python run.py
   ```
   *The ML API will start running at `http://localhost:5000`.*

---

### 3. 🔐 Backend Service Setup (`meditrack-backend`)
1. Navigate to the backend directory:
   ```bash
   cd meditrack-backend
   ```
2. Recreate your `.env` configuration file:
   ```bash
   cp local.env.example .env
   ```
   Open the newly created `.env` file and configure:
   - `DB_URL` (e.g., `jdbc:mysql://localhost:3306/meditrack?useSSL=false&serverTimezone=UTC`)
   - `DB_USERNAME` and `DB_PASSWORD`
   - `GROQ_API_KEY` or `OPENROUTER_API_KEY`
   - Set `AI_SERVICE_URL=http://localhost:5000` (pointing to your local Python API)
3. Run the Spring Boot application using Maven:
   ```bash
   mvnw spring-boot:run
   ```
   *Spring Boot will automatically run Flyway migrations, initialize the database tables, bootstrap an administrator user, and start listening on `http://localhost:8080`.*

---

### 4. 💻 Frontend Setup (`meditrack-frontend`)
1. Navigate to the frontend directory:
   ```bash
   cd meditrack-frontend/apps/Frontend
   ```
2. Install the node packages:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   *The application will boot up at `http://localhost:5173`.*

---

## 🌱 Seeding Initial Database Data
After booting up both the backend and frontend servers, you can seed the database with departments and simulated medical equipment:
1. Navigate to the frontend apps scripting directory:
   ```bash
   cd meditrack-frontend/apps
   ```
2. Run the seeding scripts:
   ```bash
   python insert_deps.py
   python insert_devices.py
   ```
   *Note: Ensure the backend token in the scripts matches your authorization context, or log in to obtain a valid Bearer token.*

---

## 📌 API Endpoint Documentation

### ML API (`ai-services`)
* **Health Check**: `GET http://localhost:5000/health`
* **LSTM Failure Predictor**: `POST http://localhost:5000/api/predict/lstm`
  - Body: `{"sequence": [[0.5, 0.2, 0.1], ..., [0.6, 0.3, 0.2]]}` (Requires exactly 30 timesteps with 3 features each)
* **Random Forest Risk Assessment**: `POST http://localhost:5000/api/predict/rf`
  - Body: `{"features": {"Device_Type": "Ventilator", "Age": 5, "MTBF": 1200, "Maintenance_Class": "Medium"}}`

### Enterprise Backend API (`meditrack-backend`)
For extensive endpoint specs (Authentication, Chatbot, Asset Management, Alert SSE, Auditing), see the online Notion documentation:
🔗 [MediTrack Backend API Docs](https://www.notion.so/MediTrack-Backend-API-Docs-4dd1978d13d2439e873849b50810514f)

---

## 👨‍💻 Developer & Project License
- **Lead Developer**: Kareem Hamdy Meshal
- **License**: MIT License - see the `ai-services/LICENSE` file for details.
