export const siteStats = {
  totalStudents: 240,
  activeGroups: 24,
  upcomingClassesCount: 3,
};

export type Announcement = {
  id: number;
  title: string;
  category: "Urgent" | "Academic" | "Administrative" | "Social";
  date: string;
  excerpt: string;
};

export const announcements: Announcement[] = [
  {
    id: 1,
    title: "COMP 103 Assignment Deadline Extended",
    category: "Academic",
    date: "28 Sept 2026",
    excerpt: "Following requests from group leaders, the deadline has been extended to Monday.",
  },
  {
    id: 2,
    title: "Class Representative Elections Results",
    category: "Administrative",
    date: "24 Sept 2026",
    excerpt: "Thank you to everyone who voted. Full results are posted on the announcements page.",
  },
  {
    id: 3,
    title: "Welcome Back Social This Friday",
    category: "Social",
    date: "22 Sept 2026",
    excerpt: "Join your classmates for snacks and games in the common room at 5pm.",
  },
  {
    id: 4,
    title: "PHIL 104 Online Session Rescheduled",
    category: "Urgent",
    date: "20 Sept 2026",
    excerpt: "This week's Thursday session has moved to 2pm due to a lecturer conflict.",
  },
  {
    id: 5,
    title: "Group Allocation List Now Available",
    category: "Administrative",
    date: "15 Sept 2026",
    excerpt: "Check the Groups page to confirm your group number and leader contact.",
  },
  {
    id: 6,
    title: "MATH 112 Revision Session",
    category: "Academic",
    date: "12 Sept 2026",
    excerpt: "An optional revision session will be held before the upcoming CAT. Details on the resources page.",
  },
];

export type ClassSession = {
  id: number;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  time: string;
  unit: string;
  lecturer: string;
  venue: string;
  mode: "In-Person" | "Online";
};

export const timetable: ClassSession[] = [
  { id: 1, day: "Monday", time: "9:00 AM - 11:00 AM", unit: "COMP 103 A", lecturer: "Mr. Benjamin", venue: "KSU C22", mode: "In-Person" },
  { id: 2, day: "Tuesday", time: "7:00 AM - 9:00 AM", unit: "COMP 107", lecturer: "Mdm Rebecca", venue: "KSU T V3", mode: "Online" },
  { id: 3, day: "Tuesday", time: "1:00 PM - 3:00 PM", unit: "MATH 112 (COMP)", lecturer: "Mr. Geoffrey", venue: "KSU LH 20", mode: "In-Person" },
  { id: 4, day: "Wednesday", time: "12:00 PM - 1:00 PM", unit: "COMP 103", lecturer: "Mr. Benjamin", venue: "KSU T V6", mode: "Online" },
  { id: 5, day: "Wednesday", time: "1:00 PM - 2:00 PM", unit: "COMP 107", lecturer: "Mdm Rebecca", venue: "KSU T V7", mode: "Online" },
  { id: 6, day: "Wednesday", time: "5:00 PM - 7:00 PM", unit: "COMS 101 - SIST", lecturer: "Mdm. Veronica", venue: "KSU T V1", mode: "Online" },
  { id: 7, day: "Thursday", time: "9:00 AM - 11:00 AM", unit: "PHIL 104 - SIST", lecturer: "Dr. Ichiluo", venue: "KSU T V1", mode: "Online" },
  { id: 8, day: "Thursday", time: "3:00 PM - 5:00 PM", unit: "COMP 103 B", lecturer: "Mr. Benjamin", venue: "COMP LAB 6", mode: "In-Person" },
  { id: 9, day: "Friday", time: "12:00 PM - 1:00 PM", unit: "MATH 112 - COMP", lecturer: "Mr. Geoffrey", venue: "KSU TC23", mode: "In-Person" },
];

export const timetableNote =
  "ZOOL 143 is no longer included. Based on the Final Teaching Timetable for August-December 2026, dated 18 September 2026.";

export const timetableLastUpdated = "29 September 2026";

export const quickLinks = [
  { label: "Timetable", href: "/timetable" },
  { label: "Announcements", href: "/announcements" },
  { label: "Resources", href: "/resources" },
  { label: "Groups", href: "/groups" },
  { label: "Contact Class Rep", href: "/contact" },
  { label: "eLearning Portal", href: "https://elearning.example.edu" },
];


export type Resource = {
  id: number;
  unit: string;
  title: string;
  type: "Notes" | "Slides" | "Past Paper" | "Textbook" | "Link";
  url: string;
};

export const resources: Resource[] = [
  { id: 1, unit: "COMP 103", title: "Introduction to Programming - Lecture Notes", type: "Notes", url: "https://drive.google.com/your-folder-link" },
  { id: 2, unit: "COMP 103", title: "Week 1-4 Slides", type: "Slides", url: "https://drive.google.com/your-folder-link" },
  { id: 3, unit: "COMP 103", title: "2025 Past Paper", type: "Past Paper", url: "https://drive.google.com/your-folder-link" },
  { id: 4, unit: "COMP 107", title: "Data Structures - Lecture Notes", type: "Notes", url: "https://drive.google.com/your-folder-link" },
  { id: 5, unit: "COMP 107", title: "Lab Manual", type: "Slides", url: "https://drive.google.com/your-folder-link" },
  { id: 6, unit: "MATH 112", title: "Calculus Formula Sheet", type: "Notes", url: "https://drive.google.com/your-folder-link" },
  { id: 7, unit: "MATH 112", title: "2025 Past Paper", type: "Past Paper", url: "https://drive.google.com/your-folder-link" },
  { id: 8, unit: "PHIL 104", title: "Critical Thinking - Reading List", type: "Textbook", url: "https://drive.google.com/your-folder-link" },
  { id: 9, unit: "COMS 101", title: "Communication Skills - Slides", type: "Slides", url: "https://drive.google.com/your-folder-link" },
];

export const resourceUnits = ["COMP 101", "COMP 102", "COMP 103", "COMP 107", "MATH 112", "PHIL 104", "COMS 101"];
