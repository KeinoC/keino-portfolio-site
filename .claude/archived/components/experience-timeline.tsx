'use client'

import { motion } from 'framer-motion'
import { Calendar, MapPin, Building2, TrendingUp, Award, Users, Code, BarChart3 } from 'lucide-react'

interface ExperienceItem {
  id: string
  title: string
  company: string
  location: string
  period: string
  type: 'software' | 'finance' | 'education'
  achievements: string[]
  technologies?: string[]
  highlights?: {
    icon: React.ReactNode
    text: string
  }[]
}

const experienceData: ExperienceItem[] = [
  {
    id: 'wbs',
    title: 'Software Engineer',
    company: 'We Build Solutions',
    location: 'New York, NY',
    period: 'Jun 2024 – Present',
    type: 'software',
    achievements: [
      'Developed property management marketing website using GVC\'s UI library, enhancing user engagement',
      'Partnered with UX designers to refine wireframes and deliver pixel-perfect marketing page implementations',
      'Designed and planned architecture for property management application, ensuring scalability and efficiency'
    ],
    technologies: ['React', 'TypeScript', 'UI Libraries', 'Figma', 'Architecture Design'],
    highlights: [
      { icon: <Users className="w-4 h-4" />, text: 'UX Design Collaboration' },
      { icon: <TrendingUp className="w-4 h-4" />, text: 'Enhanced User Engagement' }
    ]
  },
  {
    id: 'hitide',
    title: 'Software Engineer',
    company: 'HiTide Capital',
    location: 'New York, NY',
    period: 'Jun 2024 – Present',
    type: 'software',
    achievements: [
      'Developed Loan Underwriting full-stack web app using Next.js and TypeScript for fintech startup MVP',
      'Integrated Prisma for efficient database management, enhancing application scalability',
      'Launched the app successfully, driving key functionality and startup milestone achievement'
    ],
    technologies: ['Next.js', 'TypeScript', 'Prisma', 'Full-Stack Development', 'Fintech'],
    highlights: [
      { icon: <Award className="w-4 h-4" />, text: 'Successful MVP Launch' },
      { icon: <Building2 className="w-4 h-4" />, text: 'Fintech Startup' }
    ]
  },
  {
    id: 'goodvibes',
    title: 'Software Engineer',
    company: 'Goodvibes Consultation',
    location: 'New York, NY',
    period: 'Jun 2024 – Present',
    type: 'software',
    achievements: [
      'Built reusable UI library using React and TypeScript for consistent design',
      'Styled components with Tailwind CSS, boosting development speed',
      'Integrated Storyblok as headless CMS, simplifying content updates'
    ],
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Storyblok', 'UI Library Development'],
    highlights: [
      { icon: <Code className="w-4 h-4" />, text: 'Reusable UI Library' },
      { icon: <TrendingUp className="w-4 h-4" />, text: 'Development Speed Boost' }
    ]
  },
  {
    id: 'spill',
    title: 'Software Engineer',
    company: 'SPILL',
    location: 'New York, NY',
    period: 'Dec 2023 – May 2024',
    type: 'software',
    achievements: [
      'Implemented and optimized user-blocking functions, enhancing app security and user experience',
      'Developed Slack bot integrated with AWS Lambda, significantly improving invite code management',
      'Leveraged Linear for task management and ticketing, enhancing project organization and team collaboration'
    ],
    technologies: ['AWS Lambda', 'Slack API', 'Node.js', 'Security', 'Linear'],
    highlights: [
      { icon: <Award className="w-4 h-4" />, text: 'Enhanced Security' },
      { icon: <Users className="w-4 h-4" />, text: 'Team Autonomy' }
    ]
  },
  {
    id: 'listedb',
    title: 'Software Engineer',
    company: 'ListedB',
    location: 'New York, NY',
    period: 'Apr 2023 – Dec 2023',
    type: 'software',
    achievements: [
      'Enhanced endpoints to grant unauthorized clients access to professional profiles within web profile MVP',
      'Engineered internal apps using Retool for efficient CRUD operations on Stytch users via their API',
      'Leveraged Shortcut for agile task planning, enhancing project organization and team collaboration'
    ],
    technologies: ['API Development', 'Retool', 'Stytch', 'CRUD Operations', 'Shortcut'],
    highlights: [
      { icon: <Code className="w-4 h-4" />, text: 'API Enhancement' },
      { icon: <Building2 className="w-4 h-4" />, text: 'Internal Tooling' }
    ]
  },
  {
    id: 'flatiron',
    title: 'Full-Stack Software Engineering Certificate',
    company: 'Flatiron School',
    location: 'New York, NY',
    period: 'Completion Apr 2023',
    type: 'education',
    achievements: [
      'Intensive full-stack software engineering bootcamp covering modern web development',
      'Built multiple projects using React, Flask, Python, and PostgreSQL',
      'Learned software engineering best practices and collaborative development workflows'
    ],
    technologies: ['React', 'Flask', 'Python', 'PostgreSQL', 'JavaScript', 'Git'],
    highlights: [
      { icon: <Award className="w-4 h-4" />, text: 'Career Transition' },
      { icon: <Code className="w-4 h-4" />, text: 'Full-Stack Skills' }
    ]
  },
  {
    id: 'pager',
    title: 'Senior Financial Analyst',
    company: 'Pager Inc.',
    location: 'New York, NY',
    period: 'May 2022 – Dec 2022',
    type: 'finance',
    achievements: [
      'Built & maintained financial models for actual vs budget analyses, re/forecasts & planning',
      'Supported people operations department with budget and forecast insights for FTE management',
      'Supported business development team\'s effort to maintain sales goals with pipeline insights/KPIs',
      'Member of employee-driven culture committee, fostering engaging & equitable work culture'
    ],
    highlights: [
      { icon: <BarChart3 className="w-4 h-4" />, text: 'Financial Modeling' },
      { icon: <Users className="w-4 h-4" />, text: 'Culture Committee' }
    ]
  },
  {
    id: 'nhr',
    title: 'Financial Analyst',
    company: 'National Health Rehabilitation',
    location: 'New York, NY',
    period: 'Feb 2021 – Apr 2022',
    type: 'finance',
    achievements: [
      'Designed and built KPI models and dashboards in MS Excel to analyze and report on Doctors\' visit trends',
      'Performed ongoing budget variance analysis to support Clinical Operations & Business Development teams',
      'Implemented Tableau, reducing data processing times by 80% while improving visualization & distribution',
      'Designed and built various Ad Hoc dashboards and conducted analyses requested by other teams'
    ],
    highlights: [
      { icon: <TrendingUp className="w-4 h-4" />, text: '80% Processing Time Reduction' },
      { icon: <BarChart3 className="w-4 h-4" />, text: 'Tableau Implementation' }
    ]
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.6
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const
    }
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'software':
      return 'from-blue-500 to-indigo-600'
    case 'finance':
      return 'from-emerald-500 to-teal-600'
    case 'education':
      return 'from-purple-500 to-violet-600'
    default:
      return 'from-gray-500 to-gray-600'
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'software':
      return <Code className="w-5 h-5" />
    case 'finance':
      return <BarChart3 className="w-5 h-5" />
    case 'education':
      return <Award className="w-5 h-5" />
    default:
      return <Building2 className="w-5 h-5" />
  }
}

export default function ExperienceTimeline() {
  return (
    <section id="experience" className="py-20 px-8 bg-slate-950/50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Professional Journey
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            From Financial Analysis expertise to Full-Stack Software Engineering -
            a unique career progression combining business acumen with technical innovation.
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative"
        >
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 opacity-30 hidden md:block" />

          {experienceData.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className="relative mb-12 md:pl-20"
            >
              {/* Timeline dot */}
              <div
                className={`absolute left-6 top-6 w-5 h-5 rounded-full border-4 border-slate-900 bg-gradient-to-r ${getTypeColor(item.type)} hidden md:block`}
              />

              {/* Content card */}
              <div className="glass-effect rounded-2xl p-8 hover:bg-white/5 transition-all duration-500 group">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-start gap-4 mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${getTypeColor(item.type)} text-white`}>
                        {getTypeIcon(item.type)}
                      </div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">
                        {item.title}
                      </h3>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 text-slate-300 mb-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-400" />
                        <span className="font-semibold">{item.company}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span>{item.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <span>{item.period}</span>
                      </div>
                    </div>

                    {/* Highlights */}
                    {item.highlights && (
                      <div className="flex flex-wrap gap-3 mb-6">
                        {item.highlights.map((highlight, idx) => (
                          <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full text-sm text-slate-300">
                            <span className="text-blue-400">{highlight.icon}</span>
                            {highlight.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Achievements */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-slate-200 mb-4">Key Achievements</h4>
                  <ul className="space-y-3">
                    {item.achievements.map((achievement, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-300 leading-relaxed">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Technologies */}
                {item.technologies && (
                  <div>
                    <h4 className="text-lg font-semibold text-slate-200 mb-4">Technologies & Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {item.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className={`px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${getTypeColor(item.type)} text-white shadow-lg hover:scale-105 transition-transform`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="text-center glass-effect rounded-2xl p-8 hover:bg-white/5 transition-all duration-300">
            <div className="text-4xl font-bold text-blue-400 mb-4">8+</div>
            <div className="text-lg font-semibold text-slate-200 mb-2">Years in Finance</div>
            <div className="text-sm text-slate-400">Building analytical foundations</div>
          </div>
          <div className="text-center glass-effect rounded-2xl p-8 hover:bg-white/5 transition-all duration-300">
            <div className="text-4xl font-bold text-emerald-400 mb-4">2+</div>
            <div className="text-lg font-semibold text-slate-200 mb-2">Years in Software</div>
            <div className="text-sm text-slate-400">Creating innovative solutions</div>
          </div>
          <div className="text-center glass-effect rounded-2xl p-8 hover:bg-white/5 transition-all duration-300">
            <div className="text-4xl font-bold text-purple-400 mb-4">5+</div>
            <div className="text-lg font-semibold text-slate-200 mb-2">Companies Impacted</div>
            <div className="text-sm text-slate-400">Diverse industry experience</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}