const departments = [
  { id: "dept-001", name: "Finance", region: "North America", headcount: 120 },
  { id: "dept-002", name: "Information Technology", region: "Global", headcount: 340 },
  { id: "dept-003", name: "Human Resources", region: "North America", headcount: 85 },
  { id: "dept-004", name: "Operations", region: "Europe", headcount: 290 },
  { id: "dept-005", name: "Marketing", region: "North America", headcount: 150 },
  { id: "dept-006", name: "Supply Chain", region: "Asia Pacific", headcount: 210 },
  { id: "dept-007", name: "Legal & Compliance", region: "Global", headcount: 60 },
  { id: "dept-008", name: "Customer Success", region: "North America", headcount: 180 },
];

const initiatives = [
  {
    id: "init-001",
    name: "ERP Migration",
    phase: "in-progress",
    owner: "Sarah Chen",
    deadline: "2026-09-30",
    description: "Full migration from legacy ERP to SAP S/4HANA",
    category: "Technology",
  },
  {
    id: "init-002",
    name: "Vendor Onboarding Redesign",
    phase: "planning",
    owner: "James Okafor",
    deadline: "2026-12-15",
    description: "Streamline vendor onboarding to reduce cycle time by 40%",
    category: "Process",
  },
  {
    id: "init-003",
    name: "Workforce Upskilling",
    phase: "in-progress",
    owner: "Priya Nair",
    deadline: "2026-07-01",
    description: "Digital skills program across all departments",
    category: "People",
  },
  {
    id: "init-004",
    name: "Data Governance Framework",
    phase: "in-progress",
    owner: "Marcus Webb",
    deadline: "2026-08-31",
    description: "Establish enterprise-wide data policies and ownership",
    category: "Compliance",
  },
  {
    id: "init-005",
    name: "Agile Transformation",
    phase: "planning",
    owner: "Lisa Tanaka",
    deadline: "2027-03-01",
    description: "Shift to agile delivery model across product and tech teams",
    category: "Process",
  },
  {
    id: "init-006",
    name: "GDPR Compliance Refresh",
    phase: "completed",
    owner: "Robert Klein",
    deadline: "2026-04-30",
    description: "Annual review and refresh of GDPR controls",
    category: "Compliance",
  },
  {
    id: "init-007",
    name: "Customer Portal Launch",
    phase: "in-progress",
    owner: "Ana Rodrigues",
    deadline: "2026-10-15",
    description: "Self-service customer portal for orders and invoices",
    category: "Technology",
  },
];

const cells = [
  // Finance
  { departmentId: "dept-001", initiativeId: "init-001", impactScore: 92, readinessScore: 45, status: "in-progress", notes: "Critical financial module migration pending sign-off", lastUpdated: "2026-05-10" },
  { departmentId: "dept-001", initiativeId: "init-002", impactScore: 60, readinessScore: 70, status: "in-progress", notes: "AP team engaged in pilot", lastUpdated: "2026-05-08" },
  { departmentId: "dept-001", initiativeId: "init-003", impactScore: 40, readinessScore: 80, status: "completed", notes: "Finance analysts completed Excel → Python training", lastUpdated: "2026-04-20" },
  { departmentId: "dept-001", initiativeId: "init-004", impactScore: 85, readinessScore: 55, status: "in-progress", notes: "Financial data taxonomy under review", lastUpdated: "2026-05-12" },
  { departmentId: "dept-001", initiativeId: "init-005", impactScore: 30, readinessScore: 50, status: "not-started", notes: "", lastUpdated: "2026-04-01" },
  { departmentId: "dept-001", initiativeId: "init-006", impactScore: 75, readinessScore: 90, status: "completed", notes: "All financial records compliant", lastUpdated: "2026-04-28" },
  { departmentId: "dept-001", initiativeId: "init-007", impactScore: 20, readinessScore: 60, status: "not-started", notes: "", lastUpdated: "2026-04-01" },

  // IT
  { departmentId: "dept-002", initiativeId: "init-001", impactScore: 98, readinessScore: 60, status: "in-progress", notes: "IT owns migration workstream; infra build-out 60% complete", lastUpdated: "2026-05-13" },
  { departmentId: "dept-002", initiativeId: "init-002", impactScore: 70, readinessScore: 75, status: "in-progress", notes: "API layer design approved", lastUpdated: "2026-05-09" },
  { departmentId: "dept-002", initiativeId: "init-003", impactScore: 55, readinessScore: 85, status: "completed", notes: "Cloud training completed for all engineers", lastUpdated: "2026-04-15" },
  { departmentId: "dept-002", initiativeId: "init-004", impactScore: 95, readinessScore: 50, status: "blocked", notes: "Waiting on data steward appointments from business units", lastUpdated: "2026-05-11" },
  { departmentId: "dept-002", initiativeId: "init-005", impactScore: 88, readinessScore: 40, status: "not-started", notes: "Scrum training budget not yet approved", lastUpdated: "2026-04-01" },
  { departmentId: "dept-002", initiativeId: "init-006", impactScore: 80, readinessScore: 95, status: "completed", notes: "Security controls verified and documented", lastUpdated: "2026-04-29" },
  { departmentId: "dept-002", initiativeId: "init-007", impactScore: 96, readinessScore: 65, status: "in-progress", notes: "Backend APIs 80% complete; frontend QA in progress", lastUpdated: "2026-05-14" },

  // HR
  { departmentId: "dept-003", initiativeId: "init-001", impactScore: 50, readinessScore: 70, status: "in-progress", notes: "HRIS integration dependency tracked", lastUpdated: "2026-05-07" },
  { departmentId: "dept-003", initiativeId: "init-002", impactScore: 35, readinessScore: 65, status: "not-started", notes: "", lastUpdated: "2026-04-01" },
  { departmentId: "dept-003", initiativeId: "init-003", impactScore: 90, readinessScore: 55, status: "in-progress", notes: "HR owns program delivery; 3 cohorts running", lastUpdated: "2026-05-10" },
  { departmentId: "dept-003", initiativeId: "init-004", impactScore: 45, readinessScore: 60, status: "in-progress", notes: "Employee data classification underway", lastUpdated: "2026-05-06" },
  { departmentId: "dept-003", initiativeId: "init-005", impactScore: 65, readinessScore: 45, status: "not-started", notes: "HR org structure review needed first", lastUpdated: "2026-04-01" },
  { departmentId: "dept-003", initiativeId: "init-006", impactScore: 88, readinessScore: 92, status: "completed", notes: "Employee consent forms and HR data policies updated", lastUpdated: "2026-04-27" },
  { departmentId: "dept-003", initiativeId: "init-007", impactScore: 15, readinessScore: 75, status: "not-started", notes: "", lastUpdated: "2026-04-01" },

  // Operations
  { departmentId: "dept-004", initiativeId: "init-001", impactScore: 80, readinessScore: 35, status: "blocked", notes: "Plant floor systems integration not scoped", lastUpdated: "2026-05-12" },
  { departmentId: "dept-004", initiativeId: "init-002", impactScore: 95, readinessScore: 50, status: "in-progress", notes: "Operations is primary stakeholder; PO workflow overhaul", lastUpdated: "2026-05-13" },
  { departmentId: "dept-004", initiativeId: "init-003", impactScore: 60, readinessScore: 65, status: "in-progress", notes: "Ops supervisors enrolled in digital tools training", lastUpdated: "2026-05-05" },
  { departmentId: "dept-004", initiativeId: "init-004", impactScore: 70, readinessScore: 40, status: "not-started", notes: "Data steward not yet assigned", lastUpdated: "2026-04-01" },
  { departmentId: "dept-004", initiativeId: "init-005", impactScore: 75, readinessScore: 30, status: "not-started", notes: "Agile not yet piloted in ops context", lastUpdated: "2026-04-01" },
  { departmentId: "dept-004", initiativeId: "init-006", impactScore: 55, readinessScore: 85, status: "completed", notes: "GDPR controls applied to supplier data", lastUpdated: "2026-04-30" },
  { departmentId: "dept-004", initiativeId: "init-007", impactScore: 45, readinessScore: 55, status: "in-progress", notes: "Order tracking module under UAT", lastUpdated: "2026-05-08" },

  // Marketing
  { departmentId: "dept-005", initiativeId: "init-001", impactScore: 30, readinessScore: 80, status: "not-started", notes: "Low direct impact; monitor for downstream reporting changes", lastUpdated: "2026-04-01" },
  { departmentId: "dept-005", initiativeId: "init-002", impactScore: 20, readinessScore: 85, status: "not-started", notes: "", lastUpdated: "2026-04-01" },
  { departmentId: "dept-005", initiativeId: "init-003", impactScore: 50, readinessScore: 75, status: "completed", notes: "MarTech training completed ahead of schedule", lastUpdated: "2026-04-10" },
  { departmentId: "dept-005", initiativeId: "init-004", impactScore: 55, readinessScore: 65, status: "in-progress", notes: "Campaign data classification in progress", lastUpdated: "2026-05-04" },
  { departmentId: "dept-005", initiativeId: "init-005", impactScore: 60, readinessScore: 55, status: "not-started", notes: "", lastUpdated: "2026-04-01" },
  { departmentId: "dept-005", initiativeId: "init-006", impactScore: 70, readinessScore: 88, status: "completed", notes: "Cookie consent and email opt-out updated", lastUpdated: "2026-04-26" },
  { departmentId: "dept-005", initiativeId: "init-007", impactScore: 85, readinessScore: 60, status: "in-progress", notes: "Marketing content for portal launch in production", lastUpdated: "2026-05-09" },

  // Supply Chain
  { departmentId: "dept-006", initiativeId: "init-001", impactScore: 88, readinessScore: 40, status: "in-progress", notes: "Procurement module is on critical path", lastUpdated: "2026-05-11" },
  { departmentId: "dept-006", initiativeId: "init-002", impactScore: 98, readinessScore: 55, status: "in-progress", notes: "Supply Chain leads vendor segmentation effort", lastUpdated: "2026-05-13" },
  { departmentId: "dept-006", initiativeId: "init-003", impactScore: 65, readinessScore: 60, status: "in-progress", notes: "Logistics team enrolled in Q3 cohort", lastUpdated: "2026-05-06" },
  { departmentId: "dept-006", initiativeId: "init-004", impactScore: 78, readinessScore: 45, status: "blocked", notes: "Third-party data sharing agreements under legal review", lastUpdated: "2026-05-10" },
  { departmentId: "dept-006", initiativeId: "init-005", impactScore: 40, readinessScore: 35, status: "not-started", notes: "", lastUpdated: "2026-04-01" },
  { departmentId: "dept-006", initiativeId: "init-006", impactScore: 65, readinessScore: 80, status: "completed", notes: "Supplier data processing agreements signed", lastUpdated: "2026-04-29" },
  { departmentId: "dept-006", initiativeId: "init-007", impactScore: 60, readinessScore: 50, status: "in-progress", notes: "Inventory visibility module scoped for portal", lastUpdated: "2026-05-07" },

  // Legal
  { departmentId: "dept-007", initiativeId: "init-001", impactScore: 40, readinessScore: 75, status: "in-progress", notes: "Contract management module review ongoing", lastUpdated: "2026-05-08" },
  { departmentId: "dept-007", initiativeId: "init-002", impactScore: 70, readinessScore: 80, status: "in-progress", notes: "Legal reviewing updated vendor T&Cs", lastUpdated: "2026-05-12" },
  { departmentId: "dept-007", initiativeId: "init-003", impactScore: 25, readinessScore: 90, status: "completed", notes: "Legal tech training completed", lastUpdated: "2026-04-05" },
  { departmentId: "dept-007", initiativeId: "init-004", impactScore: 98, readinessScore: 65, status: "in-progress", notes: "Legal drafting data governance policies", lastUpdated: "2026-05-13" },
  { departmentId: "dept-007", initiativeId: "init-005", impactScore: 20, readinessScore: 70, status: "not-started", notes: "", lastUpdated: "2026-04-01" },
  { departmentId: "dept-007", initiativeId: "init-006", impactScore: 99, readinessScore: 95, status: "completed", notes: "Legal owns GDPR compliance; all controls signed off", lastUpdated: "2026-04-30" },
  { departmentId: "dept-007", initiativeId: "init-007", impactScore: 30, readinessScore: 85, status: "not-started", notes: "", lastUpdated: "2026-04-01" },

  // Customer Success
  { departmentId: "dept-008", initiativeId: "init-001", impactScore: 25, readinessScore: 85, status: "not-started", notes: "Minimal direct impact", lastUpdated: "2026-04-01" },
  { departmentId: "dept-008", initiativeId: "init-002", impactScore: 55, readinessScore: 70, status: "in-progress", notes: "CS team providing vendor feedback loop inputs", lastUpdated: "2026-05-09" },
  { departmentId: "dept-008", initiativeId: "init-003", impactScore: 70, readinessScore: 65, status: "in-progress", notes: "CS reps in digital communication training", lastUpdated: "2026-05-05" },
  { departmentId: "dept-008", initiativeId: "init-004", impactScore: 50, readinessScore: 70, status: "in-progress", notes: "Customer data classification underway", lastUpdated: "2026-05-07" },
  { departmentId: "dept-008", initiativeId: "init-005", impactScore: 55, readinessScore: 45, status: "not-started", notes: "", lastUpdated: "2026-04-01" },
  { departmentId: "dept-008", initiativeId: "init-006", impactScore: 80, readinessScore: 90, status: "completed", notes: "Customer consent records updated across CRM", lastUpdated: "2026-04-28" },
  { departmentId: "dept-008", initiativeId: "init-007", impactScore: 97, readinessScore: 55, status: "in-progress", notes: "CS is primary user; conducting UAT", lastUpdated: "2026-05-14" },
];

module.exports = { departments, initiatives, cells };
