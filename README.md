# 🌿 EcoTrack — AI Carbon Footprint Tracker

> Understand, track, and reduce your carbon footprint with AI.

[![Firebase Hosting Deploy](https://github.com/yourusername/ecotrack/actions/workflows/deploy.yml/badge.svg)](https://github.com/yourusername/ecotrack/actions/workflows/deploy.yml)
[![Prompt Wars Hack2Skill](https://img.shields.io/badge/Hackathon-Prompt_Wars_by_Hack2Skill-blueviolet?style=for-the-badge)](https://hack2skill.com/)

[**Live Demo (Firebase Hosting)**](https://ecotrack-demo.web.app) *(Replace with actual URL)*

---

## 📸 Screenshots

*(Add screenshots of your application here)*
- Dashboard View
- AI Insights View
- Log Activity Form
- History & Leaderboard

---

## ✨ Features

EcoTrack is a comprehensive, production-ready web application built for the Google-sponsored Prompt Wars hackathon. It includes all 13 required features:

1. **Authentication**: Secure Google Sign-In via Firebase Auth.
2. **Carbon Footprint Calculator**: Granular tracking across Transport, Food, Energy, Water, and Shopping.
3. **Interactive Dashboard**: Real-time stats, streak tracking, charts, and sustainability score.
4. **Log Activity Page**: Multi-step intuitive form with Google Maps Autocomplete for trip distances.
5. **AI Insights Page**: Powered by Gemini 1.5 Flash for weekly summaries, predictions, anomalies, and personalized goals.
6. **History Page**: Paginated, sortable, filterable table of all past activities.
7. **Sustainability Score**: Dynamic 0-100 score graded from Excellent to Poor.
8. **Weekly Leaderboard**: Compete against other eco-warriors for the lowest emissions.
9. **Streak Tracker**: Gamified daily login/logging streaks to build sustainable habits.
10. **Eco Challenges**: 8 rotating weekly challenges to push your boundaries.
11. **Carbon Offset Suggestions**: Actionable offset data calculating the exact number of trees needed.
12. **Comparison to Averages**: Visual comparisons against Indian and global averages.
13. **PDF Report Download**: Generate full monthly reports with charts and AI tips using jsPDF.

---

## Problem Statement Alignment

| Problem Statement Keyword | EcoTrack Feature |
|---|---|
| Understand | Landing page, onboarding quiz, learn page, education tooltips |
| Track | Daily reminder banner, activity logging, carbon calendar, history table |
| Reduce | Reduction journey, smart action cards, weekly comparison, offset suggestions |
| Simple Actions | QuickLog FAB, smart defaults, one-click activity logging |
| Personalized Insights | Gemini tips, daily tip card, AI insights history, smart goals |

---

## 🛠️ Google Services Used

EcoTrack heavily relies on Google Cloud and Firebase ecosystem to deliver a seamless, scalable experience:

1. **Firebase Authentication**: Handles secure user identity via Google Sign-In.
2. **Firebase Firestore**: Real-time NoSQL database storing users, activities, AI cache, profiles, and leaderboards. Uses compound indexes and strict security rules.
3. **Firebase Hosting**: Fast, secure global CDN for the production web app deployment.
4. **Gemini 1.5 Flash API**: Deep integration for analyzing emission data to generate smart summaries, predict future trends, detect spikes, and set dynamic reduction goals.
5. **Google Maps JavaScript API (Places & Distance Matrix)**: Powers the transport logger by allowing users to search origins/destinations and automatically calculating driving distance in kilometers.

---

## 💻 Tech Stack

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)
![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

- **State Management**: TanStack Query (React Query v5)
- **Charts**: Recharts
- **Styling**: Tailwind CSS + Framer Motion
- **PDF Generation**: jsPDF + autoTable
- **Testing**: Vitest + React Testing Library

---

## 🚀 Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ecotrack.git
   cd ecotrack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Fill in the required variables in `.env` (see table below).

4. **Run the development server**
   ```bash
   npm run dev
   ```

---

## 🔐 Environment Variables

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key | Firebase Console > Project Settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | Firebase Console > Project Settings |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | Firebase Console > Project Settings |
| `VITE_FIREBASE_STORAGE_BUCKET`| Firebase Storage | Firebase Console > Project Settings |
| `VITE_FIREBASE_MESSAGING_SENDER_ID`| Firebase Messaging ID | Firebase Console > Project Settings |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | Firebase Console > Project Settings |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase Analytics ID | Firebase Console > Project Settings |
| `VITE_GEMINI_API_KEY` | Google Gemini API Key | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API Key | [Google Cloud Console](https://console.cloud.google.com/) |

*(Note: Enable Places API, Distance Matrix API, and Maps JavaScript API in Google Cloud Console)*

---

## 🧪 Testing

The project includes a robust test suite using Vitest and React Testing Library.

```bash
# Run all tests
npm run test

# Run tests with coverage report
npm run test:coverage
```

---

## 📦 Deployment Instructions

Deployment is automated via GitHub Actions to Firebase Hosting, but you can deploy manually:

1. **Login to Firebase**
   ```bash
   npx firebase login
   ```

2. **Initialize Firebase (if not already done)**
   ```bash
   npx firebase init hosting
   ```

3. **Build the production bundle**
   ```bash
   npm run build
   ```

4. **Deploy**
   ```bash
   npx firebase deploy --only hosting
   ```

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
