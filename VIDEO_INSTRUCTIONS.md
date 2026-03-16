# AI Complaint Intelligence Platform — Video Script

> **Total Duration:** ~8–10 minutes  
> **Tone:** Professional, confident, demo-style walkthrough  
> **Target Audience:** Judges, reviewers, stakeholders, or anyone evaluating this project

---

## 🎬 INTRO (0:00 – 0:30)

**[Screen: Landing Page at `/`]**

> "Welcome to AI Complaint Intelligence — a full-stack, AI-powered banking operations platform that transforms how financial institutions handle customer complaints. From the moment a customer raises an issue to the point of crisis detection and resolution, every step is powered by artificial intelligence. Let me walk you through every feature."

---

## 1️⃣ LANDING PAGE (0:30 – 1:00)

**[Screen: Landing Page `/`]**

> "This is the public-facing landing page. It provides four clear entry points for users:
>
> 1. **AI Issue Assistant** — An intelligent chatbot for instant issue resolution.
> 2. **Raise a Complaint** — A formal complaint submission form for unresolved issues.
> 3. **Track Complaint** — Look up and monitor the status of a previously submitted complaint.
> 4. **Admin Login** — Secure access to the analytics dashboard for bank staff.
>
> The design follows a dark-themed, glassmorphism aesthetic with animated elements powered by Framer Motion."

**[Action: Hover over each card to show hover effects]**

---

## 2️⃣ AI ISSUE ASSISTANT (1:00 – 2:30)

**[Action: Click "AI Issue Assistant" → Navigate to `/ai-assistant`]**

> "This is the AI Issue Assistant — a real-time chatbot designed to resolve customer banking issues instantly without needing to file a formal complaint.
>
> The chatbot is powered by Google Gemini via our backend Edge Function. It has full context about banking operations — ATM issues, UPI failures, credit card problems, loan queries, and more."

**[Action: Click one of the suggestion chips, e.g., "My ATM card is stuck in the machine"]**

> "Users can either type their own question or click one of the pre-built suggestion chips for common banking issues."

**[Wait for AI response]**

> "Notice how the response appears almost instantly. The AI provides empathetic, professional, and actionable guidance — including step-by-step instructions."

**[Action: Type a follow-up question, e.g., "What if the bank is closed?"]**

> "The conversation maintains full context. Follow-up questions are understood in the context of the previous messages, creating a natural dialogue flow."

**[Action: Point out the "Raise a Complaint" banner at the bottom]**

> "If the AI can't fully resolve the issue, users are guided to raise a formal complaint — creating a seamless escalation path."

---

## 3️⃣ RAISE A COMPLAINT (2:30 – 3:30)

**[Action: Navigate to `/raise-complaint`]**

> "This is the formal complaint submission form. It's designed for customers whose issues weren't resolved by the AI Assistant."

**[Point out the AI Assistant nudge banner at the top]**

> "Notice the banner at the top encouraging users to try the AI Assistant first — this reduces unnecessary complaint volume."

**[Action: Fill out the form]**
- **Name:** John Doe  
- **Email:** john@example.com  
- **Complaint:** "I tried to withdraw ₹10,000 from the ATM at MG Road branch but the machine debited the amount without dispensing cash. Transaction ID: TXN789456."  
- **Product Type:** ATM  
- **Location:** Mumbai  

**[Action: Click "Submit Complaint"]**

> "The submission is lightning-fast. Behind the scenes, we use a non-blocking architecture — the complaint is saved to the database immediately while AI analysis runs in parallel with a 1.2-second timeout. If the AI takes too long, the complaint still gets saved instantly."

**[Screen: Success confirmation with Complaint ID]**

> "The user receives a unique Complaint ID which they can use to track their complaint status."

---

## 4️⃣ TRACK COMPLAINT (3:30 – 4:15)

**[Action: Click "Track Complaint" or navigate to `/track-complaint`]**

> "Customers can look up any complaint using their Complaint ID."

**[Action: Paste the complaint ID from the previous step and click Search]**

> "The system fetches the complaint details including:
> - Current **status** (New, Investigating, Resolved, Escalated)
> - **AI-detected category** and **sentiment analysis**
> - **Frustration score** and **priority score** on a 1-10 scale
> - **Escalation risk** percentage
> - **AI-generated root cause** analysis
> - **AI-drafted response** for the customer
>
> All of this was generated automatically by our AI analysis engine at the time of submission."

---

## 5️⃣ ADMIN LOGIN (4:15 – 4:45)

**[Action: Navigate to `/admin/login`]**

> "The admin portal is protected by authentication. Bank staff log in with their credentials to access the full analytics and management suite."

**[Action: Enter admin credentials and log in]**

> "Authentication is handled securely through our backend. Once logged in, the admin is redirected to the dashboard."

---

## 6️⃣ ADMIN DASHBOARD (4:45 – 5:30)

**[Screen: `/admin/dashboard`]**

> "The admin dashboard provides a bird's-eye view of the entire complaint ecosystem."

**[Point out each section:]**

> "At the top, we have **key metrics** displayed as stat cards:
> - **Total Complaints** with trend indicators
> - **Average Frustration Score** across all complaints
> - **Escalation Risk** percentage
> - **Active Issues** requiring attention
>
> Below that, we have **interactive charts** built with Recharts:
> - **Complaint Volume Over Time** — A line chart showing daily trends
> - **Category Distribution** — A pie chart breaking down complaint types
> - **Sentiment Analysis** — Bar charts showing positive, negative, and neutral sentiment ratios
>
> All data updates in real-time from the database."

---

## 7️⃣ COMPLAINTS LIST & DETAIL (5:30 – 6:15)

**[Action: Click "Complaints" in the sidebar → `/admin/complaints`]**

> "This is the complaints management view. Admins can see all complaints in a searchable, filterable table with color-coded status badges."

**[Action: Use the search bar to filter complaints]**

> "The search filters across complaint text, category, product type, and location."

**[Action: Click on a specific complaint to view its detail page]**

> "The complaint detail page shows the complete analysis:
> - Full complaint text and metadata
> - **AI Category Classification** — Automatically categorized by the AI
> - **Sentiment Analysis** — Positive, Negative, or Neutral
> - **Frustration & Priority Scores** — Rated 1–10
> - **Escalation Risk** — Percentage likelihood of escalation
> - **AI Root Cause Analysis** — Probable cause identified by AI
> - **AI Draft Response** — A suggested response the admin can use or modify
> - **Live Chat History** — If the customer interacted with the chatbot"

---

## 8️⃣ COMPLAINT CLUSTERS (6:15 – 6:45)

**[Action: Click "Clusters" in the sidebar → `/admin/clusters`]**

> "The Clusters page groups similar complaints together using AI categorization. This helps identify systemic issues."

**[Action: Click "Analyze" on a cluster]**

> "When you analyze a cluster, our AI examines all complaints in that group and generates:
> - A **root cause summary**
> - **Common patterns** across complaints
> - **Recommended actions** for resolution
> - **Impact assessment** and affected customer segments
>
> This is critical for identifying widespread issues like a faulty ATM network or a UPI gateway failure."

---

## 9️⃣ ANOMALY DETECTION (6:45 – 7:15)

**[Action: Click "Anomalies" in the sidebar → `/admin/anomalies`]**

> "The Anomaly Detection engine monitors complaint volumes and identifies unusual spikes."

**[Point out the chart with reference lines]**

> "The system calculates a statistical baseline using mean and standard deviation. Any day where complaints exceed the threshold is flagged as an anomaly."

> "It also performs **product-level spike detection** — identifying which specific product categories are experiencing abnormal complaint volumes. This enables proactive intervention before issues escalate into crises."

---

## 🔟 KNOWLEDGE GRAPH (7:15 – 7:45)

**[Action: Click "Knowledge Graph" in the sidebar → `/admin/knowledge-graph`]**

> "The Knowledge Graph provides a visual representation of relationships between complaints, categories, products, locations, and sentiments."

**[Point out the interactive SVG visualization]**

> "Each node represents an entity — a category, product, or location. The edges show how they're connected through complaints. Hovering over a node highlights its connections. This helps admins understand the interconnected nature of issues across the banking ecosystem."

---

## 1️⃣1️⃣ INTELLIGENCE REPORTS (7:45 – 8:15)

**[Action: Click "Intelligence" in the sidebar → `/admin/intelligence`]**

> "The Intelligence page generates comprehensive AI-powered reports on demand."

**[Action: Click "Generate Report"]**

> "The AI analyzes all current complaints and produces:
> - **Executive Summary** — High-level overview
> - **Key Trends** — Emerging patterns
> - **Risk Areas** — High-priority concerns
> - **Strategic Recommendations** — Actionable next steps
> - **Resource Allocation Suggestions** — Where to focus team efforts
>
> These reports can be used for board presentations, regulatory compliance, and strategic planning."

---

## 1️⃣2️⃣ AI INCIDENT COMMANDER (8:15 – 9:30)

**[Action: Click "Incident Commander" in the sidebar → `/admin/incident-commander`]**

> "The AI Incident Commander is the crown jewel of this platform — an automated crisis management system."

**[Wait for the report to generate, then walk through each section:]**

### Crisis Forecast Engine
> "The **Crisis Forecast Engine** predicts complaint volumes for the next 24–48 hours, assigns risk levels (Critical, High, Medium, Low), and provides confidence scores for each forecast."

### Complaint Cascade Detection
> "**Cascade Detection** identifies chain-reaction issues — where one failure triggers multiple related complaints. For example, an ATM network outage might cascade into transaction failures, balance discrepancies, and customer frustration across multiple cities."

### Root Cause Confidence Scoring
> "**Root Cause Confidence Scoring** ranks the most probable causes of current issues, with evidence counts and confidence percentages. This eliminates guesswork and focuses the team on the most likely culprits."

### Resolution Recommendation System
> "The **Resolution Recommendation System** provides prioritized action items, each assigned to a specific department with estimated impact percentages. Admins know exactly what to do, who should do it, and what effect it will have."

### Fraud Signal Detection
> "Finally, **Fraud Signal Detection** alerts the team to suspicious patterns that may indicate fraudulent activity — such as unusual transaction patterns, duplicate complaints from the same source, or coordinated complaint campaigns."

**[Action: Click "Refresh Analysis" to show real-time regeneration]**

> "The entire incident report can be regenerated on demand with fresh data, ensuring the team always has the latest intelligence."

---

## 🎬 CLOSING (9:30 – 10:00)

**[Screen: Return to Landing Page `/`]**

> "To summarize, AI Complaint Intelligence provides an end-to-end, AI-powered solution for banking complaint management:
>
> - **Instant AI support** for customers via the chatbot
> - **Smart complaint submission** with real-time AI analysis
> - **Complaint tracking** with full transparency
> - **Admin analytics** with dashboards, charts, and search
> - **Cluster analysis** for systemic issue detection
> - **Anomaly detection** for volume spike alerts
> - **Knowledge graphs** for relationship mapping
> - **AI intelligence reports** for strategic decision-making
> - **Automated incident command** with crisis forecasting, cascade detection, root cause scoring, resolution recommendations, and fraud detection
>
> Built with React, TypeScript, Tailwind CSS, Framer Motion, Recharts, and powered by Google Gemini AI on Lovable Cloud.
>
> Thank you for watching."

---

## 📋 TECHNICAL STACK REFERENCE

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui + Glassmorphism |
| Animations | Framer Motion |
| Charts | Recharts |
| Backend | Lovable Cloud (Supabase) |
| Database | PostgreSQL with RLS |
| AI Models | Google Gemini 2.5 Flash, Gemini 2.5 Flash Lite |
| Edge Functions | Deno Runtime |
| Auth | Email/Password Authentication |
| Markdown | react-markdown for AI responses |

---

## 📁 KEY FILES REFERENCE

| Feature | File(s) |
|---------|---------|
| Landing Page | `src/pages/LandingPage.tsx` |
| AI Assistant | `src/pages/AIAssistantPage.tsx`, `supabase/functions/ai-assistant/index.ts` |
| Raise Complaint | `src/pages/PublicComplaintPage.tsx`, `supabase/functions/analyze-complaint/index.ts` |
| Track Complaint | `src/pages/TrackComplaintPage.tsx` |
| Admin Login | `src/pages/LoginPage.tsx`, `src/lib/authContext.tsx` |
| Dashboard | `src/pages/DashboardPage.tsx` |
| Complaints List | `src/pages/ComplaintsListPage.tsx` |
| Complaint Detail | `src/pages/ComplaintDetailPage.tsx` |
| Clusters | `src/pages/ClustersPage.tsx`, `supabase/functions/analyze-cluster/index.ts` |
| Anomaly Detection | `src/pages/AnomalyDetectionPage.tsx` |
| Knowledge Graph | `src/pages/KnowledgeGraphPage.tsx` |
| Intelligence | `src/pages/IntelligencePage.tsx`, `supabase/functions/generate-intelligence/index.ts` |
| Incident Commander | `src/pages/IncidentCommanderPage.tsx`, `supabase/functions/incident-commander/index.ts` |
| Chat System | `supabase/functions/chat-complaint/index.ts` |
| App Layout | `src/components/AppLayout.tsx` |
| Routing | `src/App.tsx` |
