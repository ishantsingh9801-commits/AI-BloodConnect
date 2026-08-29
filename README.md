<img width="1911" height="972" alt="Screenshot 2026-08-29 183554" src="https://github.com/user-attachments/assets/0b1970e4-6acc-4302-8c7a-4f18a2817900" />
<img width="1917" height="971" alt="Screenshot 2026-08-29 183451" src="https://github.com/user-attachments/assets/44ebe929-d7bb-4828-90c1-7ce42d9cbddb" />
<img width="1917" height="957" alt="Screenshot 2026-08-29 183414" src="https://github.com/user-attachments/assets/3b01f636-cfd1-4c7f-a26c-66ea439daf16" />
<img width="1916" height="960" alt="Screenshot 2026-08-29 183344" src="https://github.com/user-attachments/assets/b82af45d-26c6-44f3-8db2-5305ea8978fb" />
🩸 AI BloodConnect

AI-powered emergency blood availability and smart donor matching platform.

AI BloodConnect is a social-impact web application designed to help patients and their families quickly find compatible blood donors and nearby hospitals with available blood stock during emergencies.

⚠️ Disclaimer: This is an educational prototype using demo hospital, donor, and blood-inventory data. It is not connected to real-time hospital blood-bank systems. Blood availability and donor eligibility must always be verified with authorized hospitals or blood banks.

🚨 Problem

During medical emergencies, finding the required blood group quickly can be difficult. Patients may need to contact multiple hospitals or donors manually, which can waste valuable time.

AI BloodConnect aims to simplify this process by bringing patients, donors, and hospitals onto a single platform.

💡 Solution

The platform allows:

Patients to search for required blood
Hospitals to manage blood inventory
Donors to register their blood group and availability
Emergency requests to be created and tracked
Compatible donors to be identified automatically
Donors to be ranked using a smart matching system
Users to search for blood requirements using natural language

✨ Key Features

👤 Patient
Patient registration and login
Search for required blood group
Emergency blood requests
Select required number of units
Emergency priority levels
Nearby hospital availability
Compatible donor search
Request status tracking

🩸 Donor
Donor registration
Blood-group information
Availability status
Last donation information
View compatible emergency requests
Accept/decline requests
Donation history

🏥 Hospital / Blood Bank
Hospital registration
Hospital dashboard
Blood inventory management
Update available units
View incoming requests
Accept/reject requests
Fulfill blood requests
Request history

🤖 AI Features
Natural-language blood search
Smart donor ranking
Emergency request prioritization
Blood-demand analytics
Intelligent matching based on compatibility, availability and distance

🧬 Blood Compatibility

The application uses a predefined blood compatibility system rather than allowing an AI model to make medical decisions.

For example:

Recipient	Compatible Donor Groups
O+	O+, O−
A+	A+, A−, O+, O−
B+	B+, B−, O+, O−
AB+	All blood groups

This ensures that the compatibility logic remains deterministic and transparent.

🧠 Smart Donor Matching

Compatible donors are ranked using multiple factors such as:

Blood compatibility
Approximate distance
Donor availability
Eligibility information
Response history

Example:

Donor: Demo Donor 01
Blood Group: O+
Distance: 2.1 km
Availability: Available

Match Score: 92/100
Status: Recommended

The score is intended as a software matching mechanism, not medical advice.

🏥 Hospital Blood Inventory

Hospitals can maintain their inventory for:

A+    A-
B+    B-
AB+   AB-
O+    O-

When a blood request is fulfilled, the corresponding inventory is updated.

Example:

O+ Stock: 15 units

Request:
2 units

Updated Stock:
13 units
🏗️ System Architecture
                    AI BloodConnect
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
     Patient            Donor           Hospital
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                     Application
                          │
                ┌─────────┴─────────┐
                │                   │
             Database           AI Services
                │                   │
        Blood Inventory      Smart Matching
        Blood Requests       AI Search
        Donor Data            Analytics
🛠️ Technology Stack

Depending on the final implementation, the project uses technologies such as:

Frontend: React / TypeScript
Backend: Node.js / TypeScript
Database: Application database / demo data
AI: Google Gemini API
Styling: CSS / modern responsive UI
Development: Google AI Studio
Version Control: Git & GitHub
📂 Project Structure
AI-BloodConnect/
│
├── src/
│   ├── App.tsx
│   ├── components/
│   ├── analytics/
│   └── ...
│
├── server/
│   ├── services/
│   │   ├── compatibility.ts
│   │   ├── distance.ts
│   │   └── gemini.ts
│   ├── db.ts
│   └── server.ts
│
├── assets/
├── public/
├── .env.example
├── .gitignore
├── package.json
└── README.md
🔐 Security

API keys and environment variables are not included in the repository.

Example:

GEMINI_API_KEY=your_api_key_here

Actual API keys should be stored securely in environment variables and never committed to GitHub.

🚀 Future Improvements

The prototype can be expanded into a real-world platform by adding:

Real hospital/blood-bank partnerships
Verified hospital accounts
Real-time blood inventory APIs
SMS/WhatsApp emergency notifications
GPS-based live location
Donor verification
Multi-language support
Mobile application
Blood shortage prediction
Hospital-to-hospital blood transfer coordination
Stronger privacy and security controls
🎯 Social Impact

AI BloodConnect aims to reduce the time required to locate compatible blood during emergencies by connecting:

Patients → Hospitals → Blood Banks → Donors

The long-term goal is to make emergency blood discovery faster, more organized, and easier to access.

👨‍💻 Project

Project Name: AI BloodConnect
Category: Social Impact / Artificial Intelligence / Healthcare Technology
Type: Educational Prototype

🔗 Live Prototype
https://ai-blood-connect.vercel.app/
