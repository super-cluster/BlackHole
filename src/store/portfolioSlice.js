import { createSlice } from '@reduxjs/toolkit'

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState: {
    personal: {
      name: 'Anurag',
      title: 'Software Engineer III | Full-Stack Developer',
      tagline: 'Building scalable distributed systems & modern React UIs',
      bio: 'Approx. 3 years of experience in Java-based distributed systems and React.js modernizations. Passionate about clean architecture, performance at scale, and shipping products that matter.',
      email: 'anuragcooldavkh@gmail.com',
      linkedin: 'https://linkedin.com/in/insideall',
      github: 'https://github.com/super-cluster',
      location: 'Bangalore, India',
    },
    experience: [
      {
        id: 1,
        company: 'Sabre Hospitality',
        role: 'Software Engineer III',
        period: 'January 2023 – Present',
        location: 'Bangalore, India',
        highlights: [
          {
            icon: '☁️',
            title: 'Cloud-Agnostic Storage',
            desc: 'Engineered a storage abstraction layer using the Strategy Pattern, enabling hot-swappable vendor support (AWS S3, Azure Blob) and eliminating vendor lock-in.',
          },
          {
            icon: '💳',
            title: 'Fintech & Payments',
            desc: 'Integrated POS systems with global payment engines (Elavon, Shift4) to handle secure pin-pad card payment workflows.',
          },
          {
            icon: '⚙️',
            title: 'System Modernization',
            desc: 'Orchestrated the migration from Java 8/Spring Boot 2.6 to Java 17/Spring Boot 3.2 with zero production downtime.',
          },
          {
            icon: '✍️',
            title: 'Digital Signature Framework',
            desc: 'Spearheaded the transition to paperless registration cards by engineering a secure digital signature framework, modernizing the guest check-in experience.',
          },
          {
            icon: '⚡',
            title: 'Performance Optimization',
            desc: 'Improved system response times by migrating from runtime aggregation to a pre-aggregated balance table strategy utilizing efficient indexing.',
          },
          {
            icon: '📨',
            title: 'Event-Driven Integration',
            desc: 'Developed asynchronous integrations using AWS SNS and SQS to decouple service dependencies and enhance system fault tolerance.',
          },
          {
            icon: '🌍',
            title: 'Global Localization',
            desc: 'Led end-to-end localization for a platform supporting 5,000+ properties across 8 languages, redesigning UI configuration for multi-region deployments.',
          },
        ],
      },
    ],
    skills: {
      Languages: ['Java 17', 'JavaScript', 'SQL'],
      Frameworks: ['Spring Boot 3.x', 'React'],
      'Cloud & DevOps': ['AWS S3', 'AWS SNS', 'AWS SQS', 'EC2', 'Docker', 'Jenkins', 'Splunk', 'Git'],
      Databases: ['MariaDB', 'Redis'],
      Architecture: ['Microservices', 'REST APIs', 'Concurrency', 'Design Patterns'],
    },
    projects: [
      {
        id: 1,
        title: 'Cloud-Agnostic Abstraction Layer',
        desc: 'Created a standardized interface for distributed storage across multiple cloud providers using the Strategy Pattern. Supports hot-swapping between AWS S3 and Azure Blob without service downtime.',
        tags: ['Java', 'AWS S3', 'Azure Blob', 'Design Patterns', 'Spring Boot'],
        icon: '☁️',
        color: '#6366f1',
      },
      {
        id: 2,
        title: 'Responsive UI Transformation',
        desc: 'Led the migration of legacy interfaces to modern React frameworks, resulting in significantly increased mobile adoption and improved UX across 5,000+ properties.',
        tags: ['React', 'JavaScript', 'UI/UX', 'Migration'],
        icon: '🎨',
        color: '#8b5cf6',
      },
      {
        id: 3,
        title: 'Performance-Optimized Components',
        desc: 'Developed React components featuring custom debouncing for search and auto-complete functionality, improving frontend responsiveness and reducing unnecessary API calls.',
        tags: ['React', 'Performance', 'Debouncing', 'REST API'],
        icon: '⚡',
        color: '#06b6d4',
      },
    ],
    education: {
      degree: 'B.E. in Computer Science and Engineering',
      institution: 'Siddaganga Institute of Technology',
      period: '2019 – 2023',
      cgpa: '9.62 / 10',
    },
  },
})

export const selectPersonal = (state) => state.portfolio.personal
export const selectExperience = (state) => state.portfolio.experience
export const selectSkills = (state) => state.portfolio.skills
export const selectProjects = (state) => state.portfolio.projects
export const selectEducation = (state) => state.portfolio.education

export default portfolioSlice.reducer
