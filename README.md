# 📱 KK Mobile OS

KK Mobile OS is a customized Android-based mobile operating system
designed to provide a modern, personalized, secure, and intelligent
smartphone experience.

## 🚀 Features

- 🎨 Custom KK OS UI/UX
- 🏠 Custom Launcher
- 🔐 Security & Privacy
- 🤖 KK AI Assistant
- 🔔 Notification Management
- 🔋 Battery Management
- 📱 App Management
- 🌙 Dark & Light Mode
- 🆘 Emergency SOS
- ⚙️ Custom System Settings
- 🔄 System Update Support

## 🛠️ Technologies

- Android Open Source Project (AOSP)
- Android Framework
- Java
- Kotlin
- C/C++
- Linux Kernel
- Android SDK

## 🎯 Goal

The goal of KK Mobile OS is to build a personalized Android-based
operating system combining modern UI, security, AI, and smart
mobile features.

## 👨‍💻 Developer

**KRISHNAKUMAR (KK)**


**Madhumitha Murali**

---
## 🔗 Connect With Me

### 💼 LinkedIn

https://www.linkedin.com/in/pkrishnakumar-kk

### 🐙 GitHub

https://github.com/KRISHNAKUMARP20

### 📧 Email

[kk6308608@gmail.com](mailto:kk6308608@gmail.com)

## 🔗 Connect With Me

### 💼 LinkedIn

https://www.linkedin.com/in/madhumitha-murali2006

### 🐙 GitHub

https://github.com/Madhu4579

### 📧 Email

[tharanimurali94@gmail.com](mailto:tharanimurali94@gmail.com)
## 🔗 Connect With Me

### 💼 LinkedIn

https://www.linkedin.com/in/kales-wari

### 🐙 GitHub

https://github.com/kales-10

### 📧 Email

[kaleswari84@gmail.com](mailto:kaleswari84@gmail.com)

---

⭐ This project is under active development.



# 📱 KK OS - The Next-Generation Smart Mobile Simulator with Parental Controls

Welcome to **KK OS**, a highly realistic and fully functional mobile operating system simulator built entirely with web technologies (React + Vite). This OS isn't just a UI mockup; it features an expansive ecosystem of apps, AI integration, and a sophisticated remote parental monitoring system.

## ✨ Features

- **70+ Interactive Apps**: From basic utilities (Calculator, Calendar, Weather) to complex applications, mini-games, and an integrated AI Assistant (powered by Google Gemini).
- **Beautiful UI/UX**: Designed with smooth animations (Framer Motion), glassmorphism effects, a dynamic boot sequence, and a fully functional lock screen.
- **Parental Dashboard**: A dedicated, real-time monitoring dashboard accessible via a separate web portal.
- **Real-time Telemetry**: Powered by Firebase Firestore, every action (app opens, searches, AI queries) on the child's device is instantly beamed to the parent dashboard.
- **Setup & Onboarding**: A realistic device onboarding flow featuring simulated SMS notifications and real Email integration (via EmailJS) to dispatch the dashboard installation link directly to the parent's inbox.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- A Firebase project (for the real-time Parental Dashboard telemetry)
- An EmailJS account (for sending automated setup emails)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KRISHNAKUMARP20/KK-MOBILE-OS.git
   cd KK-MOBILE-OS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add your keys:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
   VITE_EMAILJS_ACTIVITY_TEMPLATE_ID=your_emailjs_activity_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
   ```
   *(Note: Ensure your `firebase-applet-config.json` is properly configured for Firestore).*

4. **Start the Development Server**
   ```bash
   npm run dev
   ```

## 📱 Usage

- **Child Device Simulator**: Open `http://localhost:5173/` to enter the simulated phone OS. If it's your first time, you will go through the Device Setup Screen.
- **Parent Dashboard**: Open `http://localhost:5173/parent` and log in with the phone number you registered during device setup to monitor the phone's live activity feed.

## 🛠 Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Animations**: Framer Motion
- **Backend/Database**: Firebase Firestore (Real-time NoSQL)
- **AI Integration**: Google Gemini API
- **Notifications**: EmailJS

## 📝 License
This project is for educational and portfolio purposes.

---
*Built with ❤️ by Krishna Kumar*
