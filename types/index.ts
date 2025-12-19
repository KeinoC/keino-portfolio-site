export type BranchType =
  | 'frontend'
  | 'backend'
  | 'devops'
  | 'mobile'
  | 'ai_ml'
  | 'cloud'
  | 'design'
  | 'business'
  | 'education'
  | 'fullstack'
  | 'other'

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export type CommitType = 'feature' | 'fix' | 'docs' | 'style' | 'refactor' | 'test' | 'chore' | 'milestone'

export interface Skill {
  id: string
  name: string
  level: SkillLevel
  category: string
  yearsExperience: number
}

export interface Artifact {
  id: string
  type: 'link' | 'file' | 'image'
  url: string
  title: string
  description?: string
}

export interface Commit {
  id: string
  title: string
  description: string
  type: CommitType
  date: Date
  skills: Skill[]
  artifacts: Artifact[]
  branchId: string
  impact: 'low' | 'medium' | 'high'
  x: number
  y: number
}

export interface Branch {
  id: string
  name: string
  type: BranchType
  description: string
  startDate: Date
  endDate?: Date
  commits: Commit[]
  parentBranchId?: string
  isActive: boolean
  position: {
    x: number
    y: number
  }
}

export interface User {
  id: string
  name: string
  title: string
  bio: string
  location: string
  email: string
  avatar?: string
  linkedin?: string
  github?: string
  website?: string
  branches: Branch[]
  skills: Skill[]
}

export interface TreeNode {
  id: string
  type: 'branch' | 'commit'
  data: Branch | Commit
  x: number
  y: number
  connections: TreeConnection[]
}

export interface TreeConnection {
  from: string
  to: string
  type: 'branch' | 'commit'
}