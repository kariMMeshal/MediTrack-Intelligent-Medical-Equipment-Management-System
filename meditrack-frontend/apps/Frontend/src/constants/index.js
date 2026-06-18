import dashboardIcon from '../assets/Dashboard.svg'
import aiIcon from '../assets/AI-Sparkles.svg';
import searchIcon from '../assets/Gray-Search.svg';
import inboxIcon from '../assets/Inbox.svg';
import analysisIcon from '../assets/Analysis.svg';
import reportsIcon from '../assets/Report.svg';
import inventoryIcon from '../assets/Inventory.svg';
import settingsIcon from '../assets/Settings.svg';
import aboutIcon from '../assets/About.svg';

const userData = JSON.parse(localStorage.getItem("user"));
/* const userRole = userData.roles[0] === "ROLE_USER" ? "userrole" : userData.roles[0] === "ROLE_ADMIN" ? "adminrole" : "biorole" ;  */

export const mainPages = [
    {
        key: 1,
        icon: dashboardIcon,
        title: 'Dashboard',
        url: `dashboard/adminrole`,
        status: false,
    },
    {
        key: 2,
        icon: aiIcon,
        title: 'MedicalEqu AI',
        url: 'chatbot',
        status: false,
    },
    {
        key: 3,
        icon: inboxIcon,
        title: 'Inbox',
        url: 'inbox',
        status: false,
    },
]

export const recordsPages = [
    {
        key: 1,
        icon: analysisIcon,
        title: 'Analysis',
        url: 'analysis',
        status: false,
    },
    {
        key: 2,
        icon: reportsIcon,
        title: 'Reports',
        url: 'reports',
        status: false,
    },
    {
        key: 3,
        icon: inventoryIcon,
        title: 'Inventory',
        url: 'inventory',
        status: false,
    },
]

export const settingAboutPages = [
    {
        key: 1,
        icon: settingsIcon,
        title: 'Settings',
        url: 'settings',
        status: false,
    },
    {
        key: 2,
        icon: aboutIcon,
        title: 'About',
        url: 'about',
        status: false,
    }
]

export const adminRoleCards = [
    {
        title: 'Total Devices',
        number: 45,
        status: true,
        increaseNum: 15
    },
    {
        title: 'Total Users',
        number: 30,
        status: false,
        increaseNum: 12
    },
    {
        title: 'Active Departments',
        number: 21,
        status: true,
        increaseNum: 1
    },
    {
        title: 'Pending Approvals',
        number: 21,
        status: false,
        increaseNum: 1
    },
]

export const categoriesConditionData = [
  {
    id: 0,
    categoryName: "CT Scanners",
    percentage: 90,
    working: 45,
    issues: 5,
    status: "Healthy",
    statusColor: 1,
  },
  {
    id: 1,
    categoryName: "X-Ray Machines",
    percentage: 65,
    working: 13,
    issues: 7,
    status: "Warning",
    statusColor: 2,
  },
  {
    id: 2,
    categoryName: "Ventilators",
    percentage: 30,
    working: 15,
    issues: 35,
    status: "Critical",
    statusColor: 3,
  },
  {
    id: 3,
    categoryName: "Ultrasound Machines",
    percentage: 98,
    working: 50,
    issues: 1,
    status: "Healthy",
    statusColor: 1,
  },
  {
    id: 4,
    categoryName: "ECG Monitors",
    percentage: 80,
    working: 32,
    issues: 8,
    status: "Healthy",
    statusColor: 1,
  }
];

export const notificationsData = [
  {
    id: 1,
    title: "Maintenance Scheduled",
    description: "CT Scanner #02 will undergo routine maintenance tomorrow at 10:00 AM.",
    time: "5 min ago",
    isRead: false,
  },
  {
    id: 2,
    title: "Repair Completed",
    description: "MRI Machine #01 has been repaired and is now operational.",
    time: "20 min ago",
    isRead: true,
  },
  {
    id: 3,
    title: "Low Battery Alert",
    description: "Portable X-Ray Device battery level dropped below 15%.",
    time: "1 hour ago",
    isRead: false,
  },
  {
    id: 4,
    title: "Calibration Required",
    description: "Ultrasound Device #03 requires calibration check.",
    time: "3 hours ago",
    isRead: true,
  },
  {
    id: 5,
    title: "System Error Detected",
    description: "Ventilator #07 reported a sensor communication issue.",
    time: "Yesterday",
    isRead: false,
  },
  {
    id: 6,
    title: "Inspection Reminder",
    description: "Monthly inspection for ECG Monitor #04 is due today.",
    time: "2 days ago",
    isRead: true,
  },
];

export const adminAlerts = [
  {
    id: 1,
    alertName: "Device Contamination",
    alertDescription: "Ventilator used for infected patient – sterilization required",
    type: "CONTAMINATION",
    severity: "high"
  },
  {
    id: 2,
    alertName: "Sterilization Delay",
    alertDescription: "Sterilization overdue by 2 hours",
    type: "STERILIZATION_DELAY",
    severity: "medium"
  },
  {
    id: 3,
    alertName: "Multiple Patient Usage",
    alertDescription: "Device assigned to multiple patients without cleaning",
    type: "MULTI_PATIENT_USAGE",
    severity: "high"
  },
  {
    id: 4,
    alertName: "High Infection Risk",
    alertDescription: "Device exposed to infectious case",
    type: "INFECTION_RISK",
    severity: "low"
  },
  {
    id: 5,
    alertName: "Missing Cleaning Record",
    alertDescription: "No cleaning record found after last usage",
    type: "MISSING_CLEANING_LOG",
    severity: "medium"
  },
  {
    id: 6,
    alertName: "Extended Usage",
    alertDescription: "Device used for long duration without sterilization",
    type: "LONG_USAGE",
    severity: "low"
  }
];