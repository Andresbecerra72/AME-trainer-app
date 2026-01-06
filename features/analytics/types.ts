export interface TopicPerformance {
  id: string
  title: string
  questionsAttempted: number
  averageScore: number
  timeSpent: number
}

export interface StudyTimeData {
  day: string
  hours: number
}

export interface OverallStats {
  reputation: number
  questionsContributed: number
  totalExams: number
  averageScore: number
}

export interface AnalyticsData {
  overallStats: OverallStats
  studyTimeData: StudyTimeData[]
  topicPerformance: TopicPerformance[]
  weakAreas: TopicPerformance[]
  strongAreas: TopicPerformance[]
}
