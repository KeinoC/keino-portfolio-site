import { User, Branch, Commit, Skill, Artifact } from '@/types'

export const mockSkills: Skill[] = [
  // Frontend Technologies
  { id: 'react', name: 'React', level: 'expert', category: 'Frontend', yearsExperience: 2 },
  { id: 'nextjs', name: 'Next.js 13', level: 'expert', category: 'Frontend', yearsExperience: 2 },
  { id: 'typescript', name: 'TypeScript', level: 'advanced', category: 'Language', yearsExperience: 2 },
  { id: 'javascript', name: 'JavaScript (ES6+)', level: 'expert', category: 'Language', yearsExperience: 2 },
  { id: 'tailwind', name: 'Tailwind CSS', level: 'expert', category: 'Frontend', yearsExperience: 2 },
  { id: 'mantine', name: 'Mantine UI', level: 'advanced', category: 'Frontend', yearsExperience: 1 },
  { id: 'bootstrap', name: 'Bootstrap', level: 'advanced', category: 'Frontend', yearsExperience: 2 },
  { id: 'storybook', name: 'Storybook', level: 'intermediate', category: 'Frontend', yearsExperience: 1 },

  // Backend Technologies
  { id: 'nodejs', name: 'Node.js', level: 'advanced', category: 'Backend', yearsExperience: 2 },
  { id: 'flask', name: 'Flask', level: 'intermediate', category: 'Backend', yearsExperience: 1 },
  { id: 'express', name: 'Express', level: 'intermediate', category: 'Backend', yearsExperience: 1 },
  { id: 'python', name: 'Python', level: 'intermediate', category: 'Language', yearsExperience: 1 },

  // Database & ORM
  { id: 'prisma', name: 'Prisma ORM', level: 'advanced', category: 'Database', yearsExperience: 2 },
  { id: 'postgresql', name: 'PostgreSQL', level: 'advanced', category: 'Database', yearsExperience: 2 },
  { id: 'mongodb', name: 'MongoDB', level: 'intermediate', category: 'Database', yearsExperience: 1 },
  { id: 'sqlalchemy', name: 'SQLAlchemy', level: 'intermediate', category: 'Database', yearsExperience: 1 },
  { id: 'firestore', name: 'Firestore', level: 'intermediate', category: 'Database', yearsExperience: 1 },
  { id: 'supabase', name: 'Supabase', level: 'intermediate', category: 'Database', yearsExperience: 1 },
  { id: 'redis', name: 'Redis', level: 'intermediate', category: 'Database', yearsExperience: 1 },
  { id: 'graphql', name: 'GraphQL', level: 'intermediate', category: 'Backend', yearsExperience: 1 },

  // Cloud & DevOps
  { id: 'aws', name: 'AWS Services', level: 'advanced', category: 'Cloud', yearsExperience: 2 },
  { id: 'aws-lambda', name: 'AWS Lambda', level: 'advanced', category: 'Cloud', yearsExperience: 2 },
  { id: 'aws-appsync', name: 'AWS AppSync', level: 'intermediate', category: 'Cloud', yearsExperience: 1 },
  { id: 'aws-cognito', name: 'AWS Cognito', level: 'intermediate', category: 'Cloud', yearsExperience: 1 },
  { id: 'aws-cloudwatch', name: 'AWS CloudWatch', level: 'intermediate', category: 'Cloud', yearsExperience: 1 },
  { id: 'firebase', name: 'Firebase Auth', level: 'intermediate', category: 'Cloud', yearsExperience: 1 },
  { id: 'docker', name: 'Docker', level: 'intermediate', category: 'DevOps', yearsExperience: 1 },

  // Design & Project Management
  { id: 'figma', name: 'Figma', level: 'advanced', category: 'Design', yearsExperience: 2 },
  { id: 'linear', name: 'Linear', level: 'expert', category: 'Project Management', yearsExperience: 2 },
  { id: 'shortcut', name: 'Shortcut', level: 'expert', category: 'Project Management', yearsExperience: 2 },

  // Business Analysis (Financial Background)
  { id: 'budgeting', name: 'Budget Analysis', level: 'expert', category: 'Business', yearsExperience: 8 },
  { id: 'forecasting', name: 'Financial Forecasting', level: 'expert', category: 'Business', yearsExperience: 8 },
  { id: 'kpi', name: 'KPI Analysis', level: 'expert', category: 'Business', yearsExperience: 8 },
]

export const mockArtifacts: Artifact[] = [
  {
    id: 'demo-1',
    type: 'link',
    url: 'https://demo.example.com',
    title: 'Live Demo',
    description: 'Interactive application demo'
  },
  {
    id: 'github-1',
    type: 'link',
    url: 'https://github.com/example/repo',
    title: 'GitHub Repository',
    description: 'Source code and documentation'
  },
  {
    id: 'design-1',
    type: 'image',
    url: '/images/design-mockup.png',
    title: 'Design Mockup',
    description: 'UI/UX design iteration'
  }
]

export const mockCommits: Commit[] = [
  // We Build Solutions - Property Management
  {
    id: 'commit-1',
    title: 'Property Management Marketing Website',
    description: 'Developed marketing website using GVC UI library, enhancing user engagement through pixel-perfect implementations',
    type: 'feature',
    date: new Date('2024-06-01'),
    skills: [mockSkills.find(s => s.id === 'react')!, mockSkills.find(s => s.id === 'typescript')!, mockSkills.find(s => s.id === 'tailwind')!],
    artifacts: [mockArtifacts[0]],
    branchId: 'frontend-branch',
    impact: 'high',
    x: 100,
    y: 50
  },
  {
    id: 'commit-2',
    title: 'Property Management App Architecture',
    description: 'Designed and planned scalable architecture for property management application with UX design collaboration',
    type: 'feature',
    date: new Date('2024-07-01'),
    skills: [mockSkills.find(s => s.id === 'react')!, mockSkills.find(s => s.id === 'figma')!, mockSkills.find(s => s.id === 'typescript')!],
    artifacts: [mockArtifacts[2]],
    branchId: 'frontend-branch',
    impact: 'high',
    x: 200,
    y: 50
  },

  // HiTide Capital - Fintech MVP
  {
    id: 'commit-3',
    title: 'Loan Underwriting Full-Stack App',
    description: 'Built fintech startup MVP using Next.js, TypeScript, and Prisma for efficient database management',
    type: 'feature',
    date: new Date('2024-06-15'),
    skills: [mockSkills.find(s => s.id === 'nextjs')!, mockSkills.find(s => s.id === 'prisma')!, mockSkills.find(s => s.id === 'typescript')!],
    artifacts: [mockArtifacts[0], mockArtifacts[1]],
    branchId: 'fullstack-branch',
    impact: 'high',
    x: 150,
    y: 150
  },

  // Goodvibes Consultation - UI Library
  {
    id: 'commit-4',
    title: 'Reusable UI Library Development',
    description: 'Built comprehensive UI library with React, TypeScript, and Tailwind CSS, integrated Storyblok headless CMS',
    type: 'feature',
    date: new Date('2024-08-01'),
    skills: [mockSkills.find(s => s.id === 'react')!, mockSkills.find(s => s.id === 'storybook')!, mockSkills.find(s => s.id === 'tailwind')!],
    artifacts: [mockArtifacts[1]],
    branchId: 'frontend-branch',
    impact: 'high',
    x: 300,
    y: 50
  },

  // SPILL - Security & AWS Integration
  {
    id: 'commit-5',
    title: 'User Security & Slack Bot Integration',
    description: 'Implemented user-blocking functions and AWS Lambda Slack bot for automated invite code management',
    type: 'feature',
    date: new Date('2024-01-15'),
    skills: [mockSkills.find(s => s.id === 'aws-lambda')!, mockSkills.find(s => s.id === 'nodejs')!, mockSkills.find(s => s.id === 'linear')!],
    artifacts: [mockArtifacts[1]],
    branchId: 'backend-branch',
    impact: 'high',
    x: 150,
    y: 250
  },

  // ListedB - Profile Management
  {
    id: 'commit-6',
    title: 'Professional Profile API Enhancement',
    description: 'Enhanced endpoints for unauthorized client access to professional profiles, built internal CRUD apps with Retool',
    type: 'feature',
    date: new Date('2023-06-01'),
    skills: [mockSkills.find(s => s.id === 'nodejs')!, mockSkills.find(s => s.id === 'postgresql')!, mockSkills.find(s => s.id === 'shortcut')!],
    artifacts: [mockArtifacts[1]],
    branchId: 'backend-branch',
    impact: 'medium',
    x: 250,
    y: 250
  },

  // Financial Analysis Background
  {
    id: 'commit-7',
    title: 'Healthcare Financial Systems',
    description: 'Built KPI models and dashboards, implemented Tableau reducing data processing times by 80%',
    type: 'feature',
    date: new Date('2021-03-01'),
    skills: [mockSkills.find(s => s.id === 'budgeting')!, mockSkills.find(s => s.id === 'forecasting')!, mockSkills.find(s => s.id === 'kpi')!],
    artifacts: [mockArtifacts[2]],
    branchId: 'business-branch',
    impact: 'high',
    x: 200,
    y: 350
  },

  // Flatiron School Graduation
  {
    id: 'commit-8',
    title: 'Full-Stack Software Engineering Certification',
    description: 'Completed intensive Full-Stack Software Engineering program at Flatiron School',
    type: 'milestone',
    date: new Date('2023-04-01'),
    skills: [mockSkills.find(s => s.id === 'react')!, mockSkills.find(s => s.id === 'flask')!, mockSkills.find(s => s.id === 'postgresql')!],
    artifacts: [mockArtifacts[1]],
    branchId: 'education-branch',
    impact: 'high',
    x: 100,
    y: 450
  }
]

export const mockBranches: Branch[] = [
  {
    id: 'business-branch',
    name: 'Financial Analysis Expertise',
    type: 'business',
    description: '8+ years of healthcare financial analysis, budgeting, and KPI development',
    startDate: new Date('2015-03-01'),
    endDate: new Date('2023-04-01'),
    commits: [mockCommits[6]],
    isActive: false,
    position: { x: 200, y: 350 }
  },
  {
    id: 'education-branch',
    name: 'Software Engineering Transition',
    type: 'education',
    description: 'Flatiron School Full-Stack Software Engineering Bootcamp',
    startDate: new Date('2022-12-01'),
    endDate: new Date('2023-04-01'),
    commits: [mockCommits[7]],
    parentBranchId: 'business-branch',
    isActive: false,
    position: { x: 100, y: 450 }
  },
  {
    id: 'frontend-branch',
    name: 'Frontend Development',
    type: 'frontend',
    description: 'Modern React applications with exceptional user experiences and UI libraries',
    startDate: new Date('2023-04-01'),
    commits: [mockCommits[0], mockCommits[1], mockCommits[3]],
    parentBranchId: 'education-branch',
    isActive: true,
    position: { x: 200, y: 50 }
  },
  {
    id: 'backend-branch',
    name: 'Backend & API Development',
    type: 'backend',
    description: 'Scalable server-side applications, databases, and cloud integration',
    startDate: new Date('2023-04-01'),
    commits: [mockCommits[4], mockCommits[5]],
    parentBranchId: 'education-branch',
    isActive: true,
    position: { x: 200, y: 250 }
  },
  {
    id: 'fullstack-branch',
    name: 'Full-Stack Solutions',
    type: 'fullstack',
    description: 'Complete web applications from frontend to backend with modern tech stacks',
    startDate: new Date('2024-06-01'),
    commits: [mockCommits[2]],
    parentBranchId: 'frontend-branch',
    isActive: true,
    position: { x: 150, y: 150 }
  }
]

export const mockUser: User = {
  id: 'keino-1',
  name: 'Keino Chichester',
  title: 'Full Stack Software Engineer',
  bio: 'Software Engineer with over 8 years of Financial Planning and Analysis experience in healthcare, skilled in scaling and optimizing processes. Trained in Fullstack development at Flatiron School, I excel at crafting innovative solutions that exceed expectations, eager to contribute in a dynamic tech environment.',
  location: 'New York, NY',
  email: 'keino.chichester@gmail.com',
  avatar: '/images/avatar.jpg',
  linkedin: 'https://linkedin.com/in/keino-chichester',
  github: 'https://github.com/keinoc',
  website: 'https://keino.dev',
  branches: mockBranches,
  skills: mockSkills
}