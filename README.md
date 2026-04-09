🕰️ **CLOK — Aesthetic Smart Calendar Web App**

CLOK is a modern, interactive calendar web application that combines **productivity, journaling, and visual storytelling** into one seamless experience.
It goes beyond traditional calendars by integrating **events, notes, images, tasks, and holidays** into a single intuitive interface.

---

## ✨ Features

* 📅 **Interactive Calendar**

  * Monthly grid with smooth navigation
  * Page-tear animation with sound effects

* 📝 **Notes System**

  * Add sticky notes per day
  * Persistent storage using Supabase

* 🖼️ **Image per Day**

  * Upload and attach images to specific dates
  * Visual memory tracking

* 📌 **Events Management**

  * Create and display events with time and color coding
  * Highlight important days

* 🎂 **Birthdays Tracking**

  * Add and view birthdays directly in calendar

* ✅ **Task Manager**

  * Add, update, and track tasks from sidebar

* 🌸 **Holiday Integration**

  * Fetch and display public holidays using Calendarific API

* 🔔 **Notifications**

  * Event and reminder alerts using browser notifications

* 🎨 **Aesthetic UI**

  * Inspired by physical wall calendars
  * Soft color palette and responsive design

---
📸 Screenshots

📅 Calendar View

<img width="1909" height="990" alt="image" src="https://github.com/user-attachments/assets/35d17ae0-2a79-4376-9ff3-fab61a4c1d46" />


📝 Notes Feature

<img width="1837" height="995" alt="image" src="https://github.com/user-attachments/assets/539bc713-a29a-4001-90b4-b07f6b7d3a96" />


🖼️ Journaling (Image Upload Feature)

<img width="1840" height="998" alt="image" src="https://github.com/user-attachments/assets/11b9567d-7c8c-4b63-ae6f-de98c3e3a021" />


🎂 Birthday Reminder

<img width="1128" height="990" alt="image" src="https://github.com/user-attachments/assets/1ca8d51e-52da-417b-bbf4-16d717b15015" />


☑️ Task Completion

<img width="1840" height="999" alt="image" src="https://github.com/user-attachments/assets/f44fe2ad-6d03-4313-afd1-dddc528fd461" />

📲 Responsive (Mobile view)

<img width="1867" height="1066" alt="image" src="https://github.com/user-attachments/assets/65c79aaa-dbd4-4635-9ce3-70e5e3a4fe43" />

---

## 🧱 Tech Stack

**Frontend**

* React / Next.js / Vite
* Tailwind CSS
* Framer Motion

**Backend & Services**

* Supabase (Auth, Database, Storage)
* Calendarific API (Holidays)
* Google Calendar API *(optional integration)*

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <YOUR_REPO_LINK_HERE>
cd clok-website
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Setup environment variables

Create a `.env.local` file and add:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Calendarific
NEXT_PUBLIC_CALENDARIFIC_KEY=your_api_key

# Google Calendar (optional)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

---

### 4. Run the development server

```bash
npm run dev
```

---

## 🗄️ Database Schema

### calendar_data

* id (uuid)
* user_id (uuid)
* date (text)
* note (text)
* image_url (text)
* color (text)

### events

* id (uuid)
* user_id (uuid)
* title (text)
* description (text)
* date (text)
* start_time (text)
* end_time (text)
* color (text)

### tasks

* id (uuid)
* user_id (uuid)
* title (text)
* completed (boolean)

### birthdays

* id (uuid)
* user_id (uuid)
* name (text)
* date (text)

---

## 🔗 Integrations

* Supabase → Authentication, Database, Storage
* Calendarific → Holiday data
* Google Calendar API → *(optional sync with user calendars)*

---

## 🎬 UI Highlights

* Page flip animation with sound
* Sticky note modal animations
* Image-based memory calendar
* Clean and minimal design

---

## 📌 Future Enhancements

* Mood tracking and analytics
* AI-based scheduling assistant
* Drag-and-drop event management
* Theme adaptation based on images
* Story mode (timeline view)

---

## 📎 Links

* 🌐 **Live Demo Video Link:** [<ADD_DEPLOYED_LINK_HERE>](https://drive.google.com/file/d/1a18FBdsNeKMLoiWhrKdKX5G9dwp7giAR/view?usp=drivesdk )
* 📂 **GitHub Repo:** https://github.com/GudimallaSujana/clok-website.git
* 🈸**Deployed website link:** https://clokcalendarwebsite.vercel.app

---

## 👤 Author

**Sujana Gudimalla**

* GitHub: https://github.com/GudimallaSujana
* LinkedIn: https://www.linkedin.com/in/sujana-gudimalla/
* Gmail: sujjugud@gmail.com
* Contact Number: 7680844202
