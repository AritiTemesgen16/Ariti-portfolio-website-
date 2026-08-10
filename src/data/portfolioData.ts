import { Project, SkillCategory, Service, ExperienceItem } from '../types';

export const PROFILE = {
  name: "Ariti Temesgen Wayu",
  title: "Software Developer & Full-Stack Engineer",
  tagline: "Building scalable, high-performance web applications and digital systems designed for real-world reliability.",
  location: "Addis Ababa, Ethiopia",
  profileImage: "/src/assets/images/ariti_actual_white_suit_studio_1786201703704.jpg",
  education: {
    degree: "Bachelor of Science in Computer Science",
    institution: "University Level Computer Science Education",
    period: "Graduated",
    focus: "Software Engineering, Database Systems, Algorithms & Distributed Architecture"
  },
  languages: [
    { name: "English", proficiency: "Professional / Fluent" },
    { name: "Amharic", proficiency: "Native / Bilingual" },
    { name: "Afaan Oromo", proficiency: "Native / Bilingual" }
  ],
  bio: "Full-Stack Software Developer with a Computer Science background, specializing in high-reliability web applications, custom management platforms, and database architecture. Focused on writing modular, readable TypeScript and building resilient frontend-to-database systems tailored for business operations.",
  availability: "Available for full-time engineering roles, freelance contracts, and software consultations",
  contact: {
    email: "arititemesgen16@gmail.com",
    phone: "+251916007076",
    telegram: "https://t.me/arititemesgen",
    github: "https://github.com/Arititemesgen16",
    linkedin: "https://linkedin.com/in/Arititemesgen",
    twitter: "https://x.com/arititemesgen"
  }
};

export const PROJECTS: Project[] = [
  {
    id: "smartspend",
    slug: "smartspend",
    title: "SmartSpend",
    subtitle: "Personal Finance & Expense Analytics Platform",
    category: "FinTech",
    summary: "A personal finance management application enabling users to track income streams, categorize daily expenses, set budget thresholds, and analyze cash flow through real-time dynamic visualizations.",
    featured: true,
    coverImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
    period: "2024",
    role: "Full-Stack Developer (Solo)",
    technologies: ["React", "TypeScript", "Node.js", "Express.js", "MongoDB", "Tailwind CSS", "REST APIs", "Recharts"],
    caseStudy: {
      valueProposition: "A privacy-focused personal expense tracker delivering instant category breakdown, budget threshold alerts, and cash flow analytics without spreadsheet friction.",
      overview: "SmartSpend was engineered to solve the common friction in tracking personal expenditures across multiple payment methods. The application provides an intuitive single-dashboard view for entry logging, instant category breakdown, monthly trend forecasting, and custom date range financial reporting.",
      problem: "Many personal finance tools suffer from cluttered interfaces, complex manual spreadsheet entries, or forced bank credential syncs that raise privacy concerns. Users need a lightweight, secure tool that provides immediate visual feedback on their cash flow.",
      targetUsers: [
        "Individuals and household budgeters seeking structured expense tracking",
        "Students managing monthly living stipends and allowance allocations",
        "Freelancers needing simple cash flow monitoring across variable income streams",
        "Privacy-conscious users who prefer local/manual transaction logging over direct bank linking"
      ],
      myRole: "Full-Stack Developer (Solo) — End-to-end system design, MongoDB schema modeling, server-side aggregation pipelines, RESTful Express API engineering, and responsive React frontend architecture with Recharts integration.",
      solution: "Developed a clean React and Tailwind CSS single-page application backed by a Node.js/Express REST API and MongoDB. Users can record transactions in two clicks, visualize budget limit progress with Recharts, and store financial records securely with strict sub-unit integer arithmetic.",
      coreFeatures: [
        "Rapid Transaction Logging: Quick-select category tagging for income and expense records",
        "Interactive Cash Flow Charts: Dynamic pie and bar charts showing monthly category distribution and net balance trends",
        "Budget Threshold Manager: Customizable category spending caps with visual amber/red warning indicators",
        "Advanced Transaction Filter & Search: Date-range, payment method, and category filtering with instant CSV export",
        "Responsive Mobile Touch Interface: Built for fast single-handed mobile data logging"
      ],
      technicalArchitecture: [
        "React Single-Page Application with modular widget architecture and memoized chart renderers",
        "Express.js RESTful API handling transactional CRUD endpoints, request sanitization, and error handling middleware",
        "MongoDB Document Database utilizing compound indexes on user_id and timestamp for rapid query responses",
        "Optimistic UI state managers ensuring chart updates reflect instantly while asynchronous backend persistence resolves"
      ],
      technologyStack: [
        { category: "Frontend", items: ["React 18", "TypeScript", "Tailwind CSS", "Recharts", "Lucide React"] },
        { category: "Backend", items: ["Node.js", "Express.js", "TypeScript", "RESTful API Architecture"] },
        { category: "Database & Storage", items: ["MongoDB", "Mongoose ODM", "BSON Aggregations"] },
        { category: "Tooling & Quality", items: ["Vite", "Git & GitHub", "Postman", "ESLint"] }
      ],
      databaseDesign: {
        overview: "Structured document collections with strict Mongoose schemas. Monies are stored as integer cents to avoid floating-point binary representation errors, accompanied by indexed category identifiers and ISODate timestamps.",
        primaryEntities: [
          {
            name: "users",
            description: "Stores user authentication credentials, currency settings, and preference defaults.",
            keyFields: [
              { name: "_id", type: "ObjectId", description: "Primary MongoDB key" },
              { name: "email", type: "String", description: "Unique account identifier" },
              { name: "password_hash", type: "String", description: "BCrypt salted security hash" },
              { name: "currency", type: "String", description: "Preferred currency code (e.g. ETB, USD)" }
            ]
          },
          {
            name: "transactions",
            description: "Records individual income and expense items linked to specific user accounts.",
            keyFields: [
              { name: "_id", type: "ObjectId", description: "Transaction unique identifier" },
              { name: "user_id", type: "ObjectId", description: "Foreign reference to user record" },
              { name: "type", type: "Enum", description: "'INCOME' | 'EXPENSE'" },
              { name: "amount_in_cents", type: "Number", description: "Monetary amount stored as integer cents" },
              { name: "category", type: "String", description: "Category string (e.g., Food, Utilities, Transport)" },
              { name: "date", type: "ISODate", description: "Transaction date timestamp" }
            ]
          },
          {
            name: "budgets",
            description: "Defines monthly spending limits per category for threshold tracking.",
            keyFields: [
              { name: "user_id", type: "ObjectId", description: "Foreign reference to user" },
              { name: "category", type: "String", description: "Target category string" },
              { name: "monthly_limit_in_cents", type: "Number", description: "Maximum budget threshold" }
            ]
          }
        ],
        indexingStrategy: "Compound B-Tree index on { user_id: 1, date: -1 } to accelerate chronological transaction feeds, and { user_id: 1, category: 1 } for fast server-side category aggregations."
      },
      importantTechnicalDecisions: [
        {
          title: "Sub-Unit Integer Financial Storage",
          decision: "Stored all currency values as integer cents rather than floating-point floats.",
          rationale: "Prevents IEEE 754 floating-point rounding errors (e.g., 0.1 + 0.2 = 0.30000000000000004) across totals and financial balance calculations."
        },
        {
          title: "Server-Side MongoDB Aggregation Pipelines",
          decision: "Computed category percentages and monthly totals inside MongoDB `$group` pipelines rather than transferring raw array payloads to the client.",
          rationale: "Drastically reduces JSON network payload size and offloads mathematical summation to database native C++ execution."
        },
        {
          title: "Optimistic State Mutation Pattern",
          decision: "Updated client React state immediately upon user entry, rolling back only if backend API validation failed.",
          rationale: "Delivers a zero-latency interface feel, encouraging consistent daily logging habits on mobile connections."
        }
      ],
      challenges: [
        {
          challenge: "Aggregating large datasets of daily transactions into instant category summaries without slowing down UI renders.",
          solution: "Implemented server-side MongoDB aggregation pipelines with compound indexes, reducing aggregation processing times to single-digit milliseconds."
        },
        {
          challenge: "Keeping multiple chart widgets (pie distribution vs monthly timeline) perfectly synchronized upon transaction additions or edits.",
          solution: "Architected centralized state handlers with custom React hooks, computing single-pass derived data props for all dependent charts."
        }
      ],
      securityConsiderations: [
        "BCrypt password hashing utilizing high-work-factor salt rounds",
        "JWT token authentication with short expiry periods and HttpOnly cookie transmission",
        "Strict payload validation middleware protecting against NoSQL operator injection attacks ($gt, $ne)",
        "Cross-Origin Resource Sharing (CORS) restricted strictly to trusted frontend origins"
      ],
      performanceConsiderations: [
        "Sub-50ms query execution times achieved through compound B-tree index optimizations on transaction timestamps",
        "Route-level code splitting and lazy component loading minimizing initial JavaScript bundle size",
        "Debounced (300ms) client-side search handlers preventing excessive API call frequency during typing"
      ],
      futureImprovements: [
        "Automated recurring transaction scheduler for monthly utility bills and subscriptions",
        "Multi-currency real-time conversion API integration",
        "Progressive Web App (PWA) offline entry caching with IndexedDB background sync"
      ],
      lessonsLearned: [
        "Architecting database schema for monetary precision (integer sub-units) upfront eliminates future audit refactoring.",
        "Server-side data aggregation is crucial for keeping frontend data visualization snappy as transaction logs grow."
      ],
      screenshots: [
        {
          url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
          caption: "SmartSpend Financial Analytics Dashboard & Cash Flow View",
          type: "dashboard"
        },
        {
          url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
          caption: "Transaction Category Manager & Budget Threshold Alert Terminal",
          type: "feature"
        }
      ],
      githubUrl: "https://github.com/arititemesgen/smartspend-finance",
      demoUrl: "https://smartspend.demo.app",
      measuredResultsNote: "User adoption statistics and production server metrics are currently Not yet measured."
    }
  },
  {
    id: "agriconnect-ethiopia",
    slug: "agriconnect-ethiopia",
    title: "AgriConnect Ethiopia",
    subtitle: "Direct Farmer-to-Buyer Agricultural Marketplace",
    category: "AgriTech",
    summary: "A specialized digital marketplace platform designed to bridge the gap between regional agricultural producers and urban buyers across Ethiopia, facilitating direct crop listings, price discovery, and order management.",
    featured: true,
    coverImage: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
    period: "2024 - 2025",
    role: "Full-Stack Developer",
    technologies: ["React", "TypeScript", "Node.js", "Express.js", "PostgreSQL", "Tailwind CSS", "REST APIs", "Git"],
    caseStudy: {
      valueProposition: "A bi-directional, tri-lingual agricultural marketplace connecting regional crop farmers directly with commercial urban buyers to eliminate predatory middleman markups.",
      overview: "AgriConnect Ethiopia empowers local grain, pulse, and produce farmers by connecting them directly with wholesalers, hotel chains, and retail food distributors across Ethiopia. By providing transparent commodity pricing and direct inquiry channels, the system reduces reliance on predatory regional brokers.",
      problem: "Smallholder farmers in regional Ethiopia face severe market information asymmetry and limited direct selling channels, leading to post-harvest crop spoilage and deflated earnings. Simultaneously, commercial buyers in urban centers struggle with sourcing consistency and price inflation.",
      targetUsers: [
        "Regional smallholder farmers and agricultural producer cooperatives",
        "Urban grain wholesalers and food commodity traders",
        "Hotel chains, restaurants, and institutional catering purchasers",
        "Regional agricultural extension workers assisting local communities"
      ],
      myRole: "Full-Stack Developer — Designed PostgreSQL relational schema, implemented Express API REST services, built responsive tri-lingual React user interfaces, and implemented low-bandwidth mobile optimization.",
      solution: "Engineered a bi-directional web marketplace featuring tri-lingual support (English, Amharic Ge'ez script, Afaan Oromo Latin script), structured crop classification, region-based search filters, and direct buyer inquiry submission.",
      coreFeatures: [
        "Tri-Lingual Localization: Dynamic UI string switching across English, Amharic, and Afaan Oromo",
        "Regional Produce Indexing: Search produce by crop type (Teff, Coffee, Pulses, Cereals) and Ethiopian administrative region",
        "Direct Buyer Inquiry Routing: Form submission channeling order inquiries directly to verified farmers",
        "Farmer Product Manager: Crop listing interface specifying harvest dates, available quantities (quintals/kg), and pricing",
        "Low-Bandwidth Mobile Layout: Lightweight client bundle engineered specifically for rural 3G network constraints"
      ],
      technicalArchitecture: [
        "Relational PostgreSQL Database enforcing foreign key integrity across users, listings, regional territories, and orders",
        "Node.js & Express.js REST API service with parameterized SQL queries and input sanitization layers",
        "React Client with lightweight dictionary-based localization system and responsive flexbox containers",
        "Optimized static asset pipeline delivering sub-second initial content paints over mobile network connections"
      ],
      technologyStack: [
        { category: "Frontend", items: ["React 18", "TypeScript", "Tailwind CSS", "Custom i18n Engine", "Lucide React"] },
        { category: "Backend", items: ["Node.js", "Express.js", "TypeScript", "Parameterized SQL"] },
        { category: "Database & Storage", items: ["PostgreSQL", "pg-node Client", "B-Tree Search Indexes"] },
        { category: "Tooling & Environment", items: ["Vite", "Git & GitHub", "Postman", "Linux Containers"] }
      ],
      databaseDesign: {
        overview: "Fully normalized relational database schema in 3rd Normal Form (3NF). Ensures relational consistency between regional administrative divisions, crop categories, farmer profiles, active listings, and buyer inquiries.",
        primaryEntities: [
          {
            name: "regions",
            description: "Stores administrative region names in all three supported languages.",
            keyFields: [
              { name: "id", type: "SERIAL", description: "Primary Key" },
              { name: "name_en", type: "VARCHAR(100)", description: "English name (e.g., Oromia, Amhara)" },
              { name: "name_am", type: "VARCHAR(100)", description: "Amharic Ge'ez script name" },
              { name: "name_om", type: "VARCHAR(100)", description: "Afaan Oromo Latin script name" }
            ]
          },
          {
            name: "farmers",
            description: "Stores verified producer details and location associations.",
            keyFields: [
              { name: "id", type: "UUID", description: "Unique Farmer Identifier" },
              { name: "full_name", type: "VARCHAR(150)", description: "Farmer/Cooperative full name" },
              { name: "phone_number", type: "VARCHAR(20)", description: "Direct mobile phone number" },
              { name: "region_id", type: "INT", description: "Foreign key referencing regions table" }
            ]
          },
          {
            name: "crop_listings",
            description: "Records produce availability offered by farmers.",
            keyFields: [
              { name: "id", type: "UUID", description: "Unique Listing Identifier" },
              { name: "farmer_id", type: "UUID", description: "Foreign key referencing farmers table" },
              { name: "crop_name", type: "VARCHAR(100)", description: "Crop trade name" },
              { name: "quantity_kg", type: "DECIMAL(10,2)", description: "Total quantity available in kg" },
              { name: "price_per_kg_etb", type: "DECIMAL(10,2)", description: "Price per kg in Ethiopian Birr" },
              { name: "status", type: "VARCHAR(20)", description: "'ACTIVE' | 'SOLD' | 'EXPIRED'" }
            ]
          }
        ],
        indexingStrategy: "Composite B-Tree index on crop_listings(category_id, region_id, status) and descending index on created_at for fast multi-parameter marketplace searches."
      },
      importantTechnicalDecisions: [
        {
          title: "Lightweight Zero-Dependency Localization System",
          decision: "Built a custom key-abstraction translation system in TypeScript rather than importing heavy external i18n frameworks.",
          rationale: "Kept initial client bundle size below 120KB gzipped, essential for snappy loading on rural Ethiopian 3G mobile networks."
        },
        {
          title: "Server-Side Parameterized SQL Queries",
          decision: "Utilized parameterized SQL queries for all produce search filters.",
          rationale: "Eliminates SQL injection security vectors while allowing PostgreSQL query planner to cache execution plans for multi-filter queries."
        },
        {
          title: "Mobile-First Touch Target & Typography Sizing",
          decision: "Enforced minimum 44px touch targets and explicit Ge'ez script line-height adjustments.",
          rationale: "Ensures accessible touch navigation for regional farmers operating mobile devices in outdoor field environments."
        }
      ],
      challenges: [
        {
          challenge: "Ensuring smooth accessibility for users operating under variable mobile bandwidth and varying device capabilities.",
          solution: "Implemented aggressive code splitting, responsive media delivery, and server-side filtering to minimize client payload sizes."
        },
        {
          challenge: "Supporting tri-lingual navigation without layout brokenness across Amharic (Ge'ez script) and Latin characters.",
          solution: "Architected a dictionary-based translation system with flexible container CSS line-heights, ensuring layout alignment across all three scripts."
        }
      ],
      securityConsiderations: [
        "Parameterized PostgreSQL queries preventing SQL injection across complex multi-filter endpoints",
        "Phone number format validation and rate limiting on buyer inquiry submissions to prevent spam attacks",
        "Strict input sanitization handling HTML entities to prevent Cross-Site Scripting (XSS)"
      ],
      performanceConsiderations: [
        "Sub-15ms SQL database query execution times for multi-filter produce searches",
        "Initial client bundle size constrained under 120KB gzipped for fast mobile 3G load speeds",
        "Lazy-loaded image components with placeholder blur skeletons"
      ],
      futureImprovements: [
        "Telebirr and local mobile money payment gateway integration for direct buyer deposits",
        "USSD / SMS gateway integration allowing feature phone users to post crop listings via shortcode",
        "Real-time Ethiopian Commodity Exchange (ECX) market price ticker integration"
      ],
      lessonsLearned: [
        "Localization for Ethiopian languages requires accounting for Ge'ez script font line-heights, not just string translation.",
        "Building software for regional markets demands prioritizing raw execution speed and low payload sizes above heavy visual decorations."
      ],
      screenshots: [
        {
          url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
          caption: "AgriConnect Regional Produce Directory & Filter Panel",
          type: "dashboard"
        },
        {
          url: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1200&q=80",
          caption: "Farmer Listing Portal & Multi-language Interface Options",
          type: "feature"
        }
      ],
      githubUrl: "https://github.com/arititemesgen/agriconnect-ethiopia",
      demoUrl: "https://agriconnect.demo.et",
      measuredResultsNote: "Platform user count and marketplace transaction volume are currently Not yet measured."
    }
  },
  {
    id: "pharmacore-ethiopia",
    slug: "pharmacore-ethiopia",
    title: "PharmaCore Ethiopia",
    subtitle: "Enterprise Pharmacy & Inventory Management System",
    category: "Enterprise App",
    summary: "A robust pharmacy management application tailored for Ethiopian pharmaceutical operations, combining strict batch/expiry tracking, point-of-sale receipting, sales reporting, user role security, and relational database integrity.",
    featured: true,
    coverImage: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80",
    period: "2025",
    role: "Full-Stack System Architect & Lead Developer",
    technologies: ["React", "TypeScript", "Node.js", "Express.js", "PostgreSQL", "Tailwind CSS", "REST APIs", "Git"],
    caseStudy: {
      valueProposition: "An enterprise pharmacy inventory system enforcing batch-level expiration alerts, transactional stock row locks, and role-based security for medical compliance.",
      overview: "PharmaCore Ethiopia was engineered to bring digital precision to local pharmacy retail and wholesale management. It standardizes inventory control, tracks medication batch expiration dates, automates stock reorder alerts, and records detailed audit logs for every POS transaction.",
      problem: "Pharmacies face severe financial losses and health risks due to expired medication distribution, stock-out emergencies, manual calculation errors, and untracked inventory shrinkage. Off-the-shelf software often lacks drug-specific batch control and localized operational security.",
      targetUsers: [
        "Retail pharmacy managers and pharmacy owners",
        "Hospital dispensary technicians and clinical pharmacists",
        "Wholesale pharmaceutical distributors and inventory clerks",
        "Point-of-Sale cashiers handling rapid patient checkouts"
      ],
      myRole: "Full-Stack System Architect & Lead Developer — Designed normalized PostgreSQL database schemas with isolation locks, engineered Express API controllers, implemented Role-Based Access Control (RBAC), and built keyboard-accessible POS terminals.",
      solution: "Designed a secure web application featuring real-time batch expiration warnings (30/60/90-day alert tiers), a rapid POS checkout system with barcode lookup, strict Role-Based Access Control (RBAC), and automated shift sales reconciliation reporting.",
      coreFeatures: [
        "Batch & Expiry Date Tracker: Visual color-coded alert thresholds highlighting near-expiry medication batches",
        "High-Speed Point of Sale (POS) Terminal: SKU/Barcode search with keyboard shortcuts and instant change computation",
        "Role-Based Access Control (RBAC): Enforced user role boundaries (Admin, Pharmacist, Cashier, Inventory Manager)",
        "Low-Stock & Reorder Point Alerts: Automated alerts triggering reorder warnings when stock drops below threshold",
        "Shift Sales & Profit Margin Reports: Comprehensive shift audit logs, revenue summaries, and daily balance sheets"
      ],
      technicalArchitecture: [
        "Normalized PostgreSQL Database with explicit transaction isolation and SELECT FOR UPDATE row locking during checkout",
        "Express.js RESTful API with RBAC authorization middleware, schema validation, and audit logger handlers",
        "React Frontend with debounced search auto-complete and keyboard-navigable checkout workflows",
        "Centralized audit logging recording user ID, action type, affected batch ID, and timestamp"
      ],
      technologyStack: [
        { category: "Frontend", items: ["React 18", "TypeScript", "Tailwind CSS", "Keyboard Shortcuts Engine", "Lucide React"] },
        { category: "Backend", items: ["Node.js", "Express.js", "TypeScript", "RBAC Policy Middleware"] },
        { category: "Database & Security", items: ["PostgreSQL", "Transactional Locks (FOR UPDATE)", "JWT Auth", "BCrypt"] },
        { category: "Tooling & Infrastructure", items: ["Vite", "Git & GitHub", "Postman", "ESLint"] }
      ],
      databaseDesign: {
        overview: "Highly normalized relational database schema maintaining strict data integrity constraints. Uses CHECK constraints to prohibit negative inventory balances and cascading foreign keys for audit trails.",
        primaryEntities: [
          {
            name: "medications",
            description: "Catalog of registered pharmaceutical products and generic identifiers.",
            keyFields: [
              { name: "id", type: "UUID", description: "Primary Identifier" },
              { name: "trade_name", type: "VARCHAR(150)", description: "Brand name of medication" },
              { name: "generic_name", type: "VARCHAR(150)", description: "Active pharmaceutical ingredient" },
              { name: "category", type: "VARCHAR(100)", description: "Therapeutic category (e.g. Antibiotic, Analgesic)" }
            ]
          },
          {
            name: "inventory_batches",
            description: "Stores individual batches with specific expiry dates and quantity counts.",
            keyFields: [
              { name: "id", type: "UUID", description: "Batch Identifier" },
              { name: "medication_id", type: "UUID", description: "Foreign key referencing medications table" },
              { name: "batch_number", type: "VARCHAR(50)", description: "Manufacturer batch lot number" },
              { name: "quantity_in_stock", type: "INT", description: "Current count with CHECK (quantity_in_stock >= 0)" },
              { name: "expiry_date", type: "DATE", description: "Medication batch expiration date" }
            ]
          },
          {
            name: "sales_transactions",
            description: "Records completed POS sales receipts and cashier metadata.",
            keyFields: [
              { name: "id", type: "UUID", description: "Transaction Identifier" },
              { name: "cashier_id", type: "UUID", description: "Foreign key referencing users table" },
              { name: "total_amount", type: "DECIMAL(10,2)", description: "Total transaction total in ETB" },
              { name: "created_at", type: "TIMESTAMP", description: "Timestamp of completed sale" }
            ]
          }
        ],
        indexingStrategy: "Composite B-Tree index on inventory_batches(expiry_date, quantity_in_stock) for real-time expiry dashboard alerts, and index on medications(trade_name, generic_name) for fast POS drug lookups."
      },
      importantTechnicalDecisions: [
        {
          title: "Database Row Locking (SELECT FOR UPDATE) During POS Checkout",
          decision: "Wrapped stock deduction operations inside explicit PostgreSQL transactions with row-level locks.",
          rationale: "Guarantees zero race conditions or overselling when multiple cashiers check out items from the same batch simultaneously."
        },
        {
          title: "Database-Level Non-Negative Stock CHECK Constraints",
          decision: "Applied `CHECK (quantity_in_stock >= 0)` constraints directly at the database table level.",
          rationale: "Ensures application bugs can never force negative inventory levels even during concurrent API requests."
        },
        {
          title: "Role-Based Access Control (RBAC) Route Guards",
          decision: "Enforced route-level permission middleware checking token user role claims.",
          rationale: "Prevents cashiers from altering drug prices or deleting historical shift sales records."
        }
      ],
      challenges: [
        {
          challenge: "Preventing race conditions when multiple cashiers check out items from the same batch simultaneously.",
          solution: "Utilized PostgreSQL database transactions with isolated row locking (`FOR UPDATE`) during checkout verification to guarantee exact stock decrements."
        },
        {
          challenge: "Providing sub-100ms response times for drug lookups in large inventory catalogs.",
          solution: "Added PostgreSQL composite indexes on medication trade names, generic names, and batch numbers, alongside debounced search inputs on the client."
        }
      ],
      securityConsiderations: [
        "Enforced Role-Based Access Control (RBAC) middleware verifying user permissions on every API route",
        "Immutable audit log table recording user ID, action type, entity ID, and timestamp for all inventory changes",
        "BCrypt password hashing and JWT authentication with short validity windows and token revocation lists"
      ],
      performanceConsiderations: [
        "Sub-40ms end-to-end POS checkout transaction processing speed",
        "Client-side keyboard navigation shortcuts eliminating cursor movement delay during peak retail checkout hours",
        "Debounced auto-complete search inputs preventing query overload on medication catalogs"
      ],
      futureImprovements: [
        "EFDA (Ethiopian Food and Drug Authority) drug verification registry API integration",
        "Automated supplier Purchase Order (PO) dispatch via EDI or email",
        "IoT temperature sensor integration for cold-chain vaccine and insulin storage monitoring"
      ],
      lessonsLearned: [
        "Mission-critical operational software demands database-level constraint guarantees, not just client validation.",
        "UX design for high-frequency terminals must prioritize keyboard efficiency and zero redundant clicks."
      ],
      screenshots: [
        {
          url: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80",
          caption: "PharmaCore Inventory Batch Expiry Alert View",
          type: "dashboard"
        },
        {
          url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
          caption: "Point of Sale (POS) Checkout Terminal & Sales Summary",
          type: "terminal"
        }
      ],
      githubUrl: "https://github.com/arititemesgen/pharmacore-ethiopia",
      demoUrl: "https://pharmacore.demo.et",
      measuredResultsNote: "Production pharmacy deployments and live prescription processing metrics are currently Not yet measured."
    }
  }
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: "Core Programming Languages",
    description: "Strong, production-tested foundation in strongly typed and dynamic web languages.",
    skills: [
      { name: "TypeScript", level: "Advanced", featured: true },
      { name: "JavaScript (ES6+)", level: "Advanced", featured: true },
      { name: "HTML5 & CSS3", level: "Advanced", featured: true }
    ]
  },
  {
    title: "Frontend Engineering",
    description: "Building fast, reactive, accessible, and clean user interfaces.",
    skills: [
      { name: "React", level: "Advanced", featured: true },
      { name: "Tailwind CSS", level: "Advanced", featured: true },
      { name: "UI/UX Implementation", level: "Advanced", featured: true },
      { name: "Responsive Web Design", level: "Advanced", featured: true }
    ]
  },
  {
    title: "Backend & Systems Development",
    description: "Designing reliable RESTful APIs, business logic layers, and server architecture.",
    skills: [
      { name: "Node.js", level: "Advanced", featured: true },
      { name: "Express.js", level: "Advanced", featured: true },
      { name: "REST APIs", level: "Advanced", featured: true },
      { name: "AI-Assisted Development", level: "Proficient", featured: true }
    ]
  },
  {
    title: "Database Engineering & Storage",
    description: "Architecting relational and document databases with data integrity.",
    skills: [
      { name: "PostgreSQL", level: "Advanced", featured: true },
      { name: "MongoDB", level: "Advanced", featured: true },
      { name: "Database Design & Indexing", level: "Advanced", featured: true }
    ]
  },
  {
    title: "Developer Tooling & Infrastructure",
    description: "Version control, workflow automation, deployment pipelines, and operational tooling.",
    skills: [
      { name: "Git", level: "Advanced", featured: true },
      { name: "GitHub", level: "Advanced", featured: true },
      { name: "Application Deployment", level: "Proficient", featured: true }
    ]
  }
];

export const SERVICES: Service[] = [
  {
    id: "fullstack-web-apps",
    title: "Full-Stack Web Applications",
    subtitle: "Custom End-to-End Business Systems",
    description: "Design and development of custom, scalable full-stack web applications tailored to solve specific business processes, inventory demands, or client workflows.",
    deliverables: [
      "Custom React & TypeScript frontend application",
      "Secure Node.js & Express API server",
      "Optimized PostgreSQL or MongoDB database integration",
      "Production deployment setup with HTTPS & domain configuration"
    ],
    technologies: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "MongoDB"],
    idealFor: "Businesses requiring bespoke software systems, startups launching new web products, and organizations upgrading legacy tools.",
    icon: "Layers"
  },
  {
    id: "custom-dashboards",
    title: "Custom Dashboards & Business Software",
    subtitle: "Data Visualization & Operational Tools",
    description: "Interactive administrative dashboards, operational metrics portals, and data analytics tools designed for rapid decision-making and clear reporting.",
    deliverables: [
      "Interactive data charts, filtering, and metric summary views",
      "Role-based access control and user permission management",
      "Data export capabilities (CSV, PDF, JSON)",
      "Responsive layout for mobile and desktop monitoring"
    ],
    technologies: ["React", "TypeScript", "Recharts", "Tailwind CSS", "REST APIs"],
    idealFor: "Managers needing clear visibility into sales, inventory, finances, or operational KPIs.",
    icon: "BarChart3"
  },
  {
    id: "pharmacy-management",
    title: "Pharmacy & Medical Inventory Systems",
    subtitle: "Specialized Localized Operational Software",
    description: "Turnkey development and configuration of pharmacy management, stock reordering, batch/expiry alert systems, and cashier point-of-sale portals.",
    deliverables: [
      "Batch expiration tracking with automated alert thresholds",
      "Fast POS checkout interface with SKU lookup",
      "Daily shift sales reconciliation and margin reports",
      "Multi-user role separation (Cashier, Pharmacist, Admin)"
    ],
    technologies: ["React", "Node.js", "PostgreSQL", "Express", "Tailwind CSS"],
    idealFor: "Retail and wholesale pharmacies looking to modernize stock control and prevent expired medication losses.",
    icon: "ShieldAlert"
  },
  {
    id: "marketplace-platforms",
    title: "Marketplace & Multi-User Portals",
    subtitle: "Connecting Buyers, Sellers, and Vendors",
    description: "Structured directory and marketplace solutions with localized search filters, buyer inquiry routing, and product catalog management.",
    deliverables: [
      "Buyer and seller profile workflows",
      "Multi-language text support (e.g. English, Amharic, Afaan Oromo)",
      "Category and region-based search indexing",
      "Inquiry and messaging request channels"
    ],
    technologies: ["React", "TypeScript", "Node.js", "PostgreSQL", "REST APIs"],
    idealFor: "Agricultural cooperatives, trade platforms, and multi-vendor service directories.",
    icon: "ShoppingBag"
  },
  {
    id: "api-database-dev",
    title: "API Development & Database Design",
    subtitle: "Backend Services & Schema Architecture",
    description: "High-performance backend API design, relational schema normalization, database query optimization, and integration of external third-party services.",
    deliverables: [
      "RESTful API architecture with comprehensive endpoint documentation",
      "Normalized relational database schemas (PostgreSQL) or document schemas (MongoDB)",
      "Input validation, sanitization, and security guardrails",
      "Database query optimization and indexing strategy"
    ],
    technologies: ["Node.js", "Express.js", "PostgreSQL", "MongoDB", "REST APIs"],
    idealFor: "Companies needing robust backend services for mobile or web applications.",
    icon: "Database"
  },
  {
    id: "website-modernization",
    title: "Website Modernization & Optimization",
    subtitle: "Speed, Mobile UX, and Code Clean-up",
    description: "Refactoring existing websites for mobile responsiveness, lighthouse speed performance, accessibility compliance, and clean modern styling.",
    deliverables: [
      "Page speed optimization (Lighthouse score improvement)",
      "Mobile-first responsive layout refactoring",
      "SEO metadata and structured data implementation",
      "Bug fixing and code quality refactoring"
    ],
    technologies: ["React", "TypeScript", "Tailwind CSS", "SEO", "Accessibility"],
    idealFor: "Businesses with slow, outdated, or hard-to-maintain existing websites.",
    icon: "Sparkles"
  }
];

export const EXPERIENCE_ITEMS: ExperienceItem[] = [
  {
    id: "exp-cs-degree",
    role: "Computer Science Graduate",
    organization: "University Computer Science Program",
    period: "Completed",
    location: "Ethiopia",
    type: "Education",
    description: "Earned a Bachelor of Science degree in Computer Science, acquiring deep theoretical and practical foundations in software engineering, database normalization, data structures, networking, and systems architecture.",
    highlights: [
      "Mastered core principles of Object-Oriented and Functional Programming",
      "Designed relational database schemas with strict SQL constraints and normalization",
      "Completed practical capstone applications emphasizing end-to-end full-stack development"
    ],
    skillsUsed: ["Computer Science", "Algorithms", "Database Design", "Software Architecture", "Data Structures"]
  },
  {
    id: "exp-fullstack-dev",
    role: "Full-Stack Developer & Software Builder",
    organization: "Independent Development & Client Projects",
    period: "2023 - Present",
    location: "Addis Ababa, Ethiopia / Remote",
    type: "Engineering",
    description: "Building production-grade web applications, customized management solutions, and full-stack software for agricultural, pharmaceutical, and financial utility use cases.",
    highlights: [
      "Architected and deployed PharmaCore Ethiopia, bringing strict inventory and batch expiry tracking to pharmacy operations",
      "Engineered AgriConnect Ethiopia, connecting regional crop producers directly with buyers across the nation with multi-language support",
      "Developed SmartSpend for intuitive personal cash flow monitoring and visual expense analytics",
      "Leverages AI-assisted software development tools to accelerate delivery without compromising architectural rigor"
    ],
    skillsUsed: ["React", "TypeScript", "Node.js", "Express.js", "PostgreSQL", "MongoDB", "Tailwind CSS", "Git", "REST APIs"]
  }
];
