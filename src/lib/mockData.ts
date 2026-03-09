export interface Complaint {
  id: string;
  text: string;
  date: string;
  productType: string;
  channel: string;
  location: string;
  category: string;
  sentiment: "positive" | "negative" | "neutral";
  frustrationScore: number;
  priorityScore: number;
  escalationRisk: number;
  status: "new" | "processing" | "resolved" | "escalated";
  clusterId?: string;
  duplicateOf?: string;
}

const complaints: Complaint[] = [
  { id: "C001", text: "ATM swallowed my card and no one at the branch could help. I've been waiting 3 days for a replacement.", date: "2026-03-08", productType: "ATM", channel: "Email", location: "Mumbai", category: "ATM", sentiment: "negative", frustrationScore: 8, priorityScore: 85, escalationRisk: 0.72, status: "new" },
  { id: "C002", text: "Unauthorized transaction of ₹15,000 on my credit card. I need immediate reversal.", date: "2026-03-08", productType: "Credit Card", channel: "Phone", location: "Delhi", category: "Credit Cards", sentiment: "negative", frustrationScore: 9, priorityScore: 95, escalationRisk: 0.88, status: "escalated" },
  { id: "C003", text: "UPI payment failed but amount was debited. Transaction ID: UPI2026030812345.", date: "2026-03-07", productType: "UPI", channel: "App", location: "Bangalore", category: "UPI", sentiment: "negative", frustrationScore: 7, priorityScore: 78, escalationRisk: 0.55, status: "processing" },
  { id: "C004", text: "Home loan interest rate was increased without prior notice. This is unacceptable.", date: "2026-03-07", productType: "Loan", channel: "Email", location: "Chennai", category: "Loans", sentiment: "negative", frustrationScore: 8, priorityScore: 82, escalationRisk: 0.65, status: "new" },
  { id: "C005", text: "Internet banking portal has been down for 2 days. Cannot access my account.", date: "2026-03-07", productType: "Internet Banking", channel: "Social Media", location: "Hyderabad", category: "Internet Banking", sentiment: "negative", frustrationScore: 7, priorityScore: 75, escalationRisk: 0.60, status: "new" },
  { id: "C006", text: "Great experience with the new mobile app update. Very intuitive design.", date: "2026-03-06", productType: "Mobile Banking", channel: "App", location: "Pune", category: "Internet Banking", sentiment: "positive", frustrationScore: 1, priorityScore: 10, escalationRisk: 0.02, status: "resolved" },
  { id: "C007", text: "ATM dispensed wrong denomination notes. Got ₹100 notes instead of ₹500.", date: "2026-03-06", productType: "ATM", channel: "Branch", location: "Mumbai", category: "ATM", sentiment: "negative", frustrationScore: 6, priorityScore: 70, escalationRisk: 0.45, status: "processing" },
  { id: "C008", text: "Multiple UPI failures today. Getting server error every time I try to pay.", date: "2026-03-07", productType: "UPI", channel: "App", location: "Kolkata", category: "UPI", sentiment: "negative", frustrationScore: 8, priorityScore: 80, escalationRisk: 0.58, status: "new", clusterId: "CLU-UPI-01" },
  { id: "C009", text: "Salary account opening took 15 days. Extremely slow process.", date: "2026-03-05", productType: "Account", channel: "Branch", location: "Jaipur", category: "Account Issues", sentiment: "negative", frustrationScore: 5, priorityScore: 50, escalationRisk: 0.25, status: "resolved" },
  { id: "C010", text: "Credit card annual fee charged despite waiver promise during signup.", date: "2026-03-08", productType: "Credit Card", channel: "Phone", location: "Delhi", category: "Credit Cards", sentiment: "negative", frustrationScore: 7, priorityScore: 72, escalationRisk: 0.52, status: "new" },
  { id: "C011", text: "UPI payment stuck in pending for over 24 hours. Money debited but not credited to merchant.", date: "2026-03-08", productType: "UPI", channel: "App", location: "Mumbai", category: "UPI", sentiment: "negative", frustrationScore: 8, priorityScore: 82, escalationRisk: 0.62, status: "new", clusterId: "CLU-UPI-01" },
  { id: "C012", text: "Loan EMI auto-debit failed causing late payment charges. System error on bank's end.", date: "2026-03-06", productType: "Loan", channel: "Email", location: "Chennai", category: "Loans", sentiment: "negative", frustrationScore: 9, priorityScore: 90, escalationRisk: 0.78, status: "escalated" },
];

export const getComplaints = () => complaints;

export const getComplaintById = (id: string) => complaints.find(c => c.id === id);

export const getCategoryDistribution = () => {
  const dist: Record<string, number> = {};
  complaints.forEach(c => { dist[c.category] = (dist[c.category] || 0) + 1; });
  return Object.entries(dist).map(([name, value]) => ({ name, value }));
};

export const getSentimentDistribution = () => {
  const dist: Record<string, number> = {};
  complaints.forEach(c => { dist[c.sentiment] = (dist[c.sentiment] || 0) + 1; });
  return Object.entries(dist).map(([name, value]) => ({ name, value }));
};

export const getTrendData = () => [
  { date: "Mar 1", complaints: 5, resolved: 3 },
  { date: "Mar 2", complaints: 8, resolved: 5 },
  { date: "Mar 3", complaints: 12, resolved: 7 },
  { date: "Mar 4", complaints: 7, resolved: 6 },
  { date: "Mar 5", complaints: 15, resolved: 8 },
  { date: "Mar 6", complaints: 22, resolved: 10 },
  { date: "Mar 7", complaints: 18, resolved: 12 },
  { date: "Mar 8", complaints: 25, resolved: 9 },
];

export const getHighPriorityComplaints = () => complaints.filter(c => c.priorityScore >= 75).sort((a, b) => b.priorityScore - a.priorityScore);

export const getClusterData = () => [
  { id: "CLU-UPI-01", name: "UPI Payment Failures", count: 3, avgFrustration: 7.7, rootCause: "Payment gateway server overload during peak hours causing transaction timeouts. The NPCI switch is experiencing higher than normal latency.", recommendation: "Scale payment gateway infrastructure and implement circuit breaker pattern for graceful degradation." },
  { id: "CLU-ATM-01", name: "ATM Dispensing Errors", count: 2, avgFrustration: 7.0, rootCause: "Firmware mismatch in NCR ATM models deployed in Western region. Cash cassette calibration drift after recent software update.", recommendation: "Roll back ATM firmware to v3.2.1 and schedule recalibration of all NCR units." },
  { id: "CLU-CC-01", name: "Credit Card Fee Disputes", count: 2, avgFrustration: 8.0, rootCause: "CRM system not properly flagging fee waiver commitments made during telesales onboarding calls.", recommendation: "Audit telesales CRM integration and implement automated fee waiver tracking." },
];

export const getDailyIntelligence = () => ({
  date: "March 9, 2026",
  summary: "Critical spike in UPI-related complaints detected over the past 48 hours, with a 180% increase compared to the weekly average. Three complaint clusters have been identified requiring immediate attention.",
  crisisAlerts: [
    { severity: "high", message: "UPI transaction failure rate exceeding 15% — 3x normal baseline" },
    { severity: "medium", message: "Credit card unauthorized transaction complaints up 40% week-over-week" },
  ],
  topProducts: [
    { product: "UPI", complaints: 3, trend: "up" },
    { product: "Credit Cards", complaints: 2, trend: "up" },
    { product: "ATM", complaints: 2, trend: "stable" },
  ],
  actions: [
    "Escalate UPI infrastructure team for immediate capacity assessment",
    "Initiate fraud investigation for credit card unauthorized transactions cluster",
    "Schedule ATM firmware rollback across Western region branches",
    "Send proactive communication to affected UPI customers about resolution timeline",
  ],
});

export const addComplaint = (complaint: Omit<Complaint, "id" | "category" | "sentiment" | "frustrationScore" | "priorityScore" | "escalationRisk" | "status">): Complaint => {
  const categories = ["ATM", "UPI", "Credit Cards", "Loans", "Account Issues", "Internet Banking"];
  const sentiments: Complaint["sentiment"][] = ["negative", "neutral", "positive"];
  const newComplaint: Complaint = {
    ...complaint,
    id: `C${String(complaints.length + 1).padStart(3, "0")}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    sentiment: sentiments[Math.floor(Math.random() * 2)],
    frustrationScore: Math.floor(Math.random() * 7) + 3,
    priorityScore: Math.floor(Math.random() * 60) + 30,
    escalationRisk: parseFloat((Math.random() * 0.8 + 0.1).toFixed(2)),
    status: "new",
  };
  complaints.push(newComplaint);
  return newComplaint;
};
