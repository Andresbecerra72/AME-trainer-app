import type { Topic } from "./types"

export const topics: Topic[] = [
  {
    id: "1",
    title: "Standard Practices",
    slug: "standard-practices",
    progress: 65,
    questionsCount: 120,
    icon: "wrench",
  },
  {
    id: "2",
    title: "Airframe",
    slug: "airframe",
    progress: 45,
    questionsCount: 250,
    icon: "plane",
  },
  {
    id: "3",
    title: "Powerplant",
    slug: "powerplant",
    progress: 30,
    questionsCount: 180,
    icon: "zap",
  },
  {
    id: "4",
    title: "Avionics (E)",
    slug: "avionics",
    progress: 20,
    questionsCount: 150,
    icon: "cpu",
  },
  {
    id: "5",
    title: "Structures (S)",
    slug: "structures",
    progress: 55,
    questionsCount: 140,
    icon: "box",
  },
  {
    id: "6",
    title: "Regulations",
    slug: "regulations",
    progress: 80,
    questionsCount: 90,
    icon: "book-open",
  },
]

export const mockQuestions = [
  {
    id: "q1",
    topicId: "1",
    question: "What is the maximum allowable surface roughness for a critical structural component?",
    options: {
      A: "125 microinches",
      B: "63 microinches",
      C: "32 microinches",
      D: "16 microinches",
    },
    correctAnswer: "B" as const,
    isAnswered: true,
  },
  {
    id: "q2",
    topicId: "1",
    question: "Which type of torque wrench is most accurate for precision work?",
    options: {
      A: "Beam type",
      B: "Click type",
      C: "Dial indicating type",
      D: "Digital type",
    },
    correctAnswer: "C" as const,
    isAnswered: true,
  },
  {
    id: "q3",
    topicId: "1",
    question: "What is the purpose of safety wire in aircraft maintenance?",
    options: {
      A: "To prevent loosening of fasteners due to vibration",
      B: "To increase the strength of the connection",
      C: "To provide electrical grounding",
      D: "To seal against moisture",
    },
    correctAnswer: "A" as const,
    isAnswered: false,
  },
]
