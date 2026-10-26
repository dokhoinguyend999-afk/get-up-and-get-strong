export interface QuizOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface MilestoneInfo {
  id: number;
  title: string;
  subheading: string;
  segmentName: string;
  biome: 'park' | 'stadium' | 'trail' | 'obstacle' | 'summit';
  targetDistanceMi: number;
}

export interface QuizQuestion {
  id: number;
  milestoneId: number;
  milestoneTitle: string;
  topic: string;
  question: string;
  options: QuizOption[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  coachEncouragement: string;
  coachCalloutWrong: string;
}

export const MILESTONES: MilestoneInfo[] = [
  {
    id: 1,
    title: 'Milestone 1',
    subheading: 'Habit Formation',
    segmentName: 'Greenway Park Run',
    biome: 'park',
    targetDistanceMi: 1.0,
  },
  {
    id: 2,
    title: 'Milestone 2',
    subheading: 'Balanced Nutrition',
    segmentName: 'Athletic Track Ring',
    biome: 'stadium',
    targetDistanceMi: 2.0,
  },
  {
    id: 3,
    title: 'Milestone 3',
    subheading: 'Regular Exercise',
    segmentName: 'Ridge Mountain Trail',
    biome: 'trail',
    targetDistanceMi: 3.0,
  },
  {
    id: 4,
    title: 'Milestone 4',
    subheading: 'Vital Hydration',
    segmentName: 'Outdoor Fitness Grounds',
    biome: 'obstacle',
    targetDistanceMi: 4.0,
  },
  {
    id: 5,
    title: 'Milestone 5',
    subheading: 'Stress & Mindset',
    segmentName: 'Summit Boulevard',
    biome: 'summit',
    targetDistanceMi: 5.0,
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    milestoneId: 1,
    milestoneTitle: 'MILESTONE 1 / 5',
    topic: 'Healthy Habits & Recovery',
    question: 'Which habit helps you stay healthy?',
    options: [
      { key: 'A', text: 'Skipping breakfast every day' },
      { key: 'B', text: 'Getting enough sleep' },
      { key: 'C', text: 'Watching TV all day' },
      { key: 'D', text: 'Avoiding physical activity' },
    ],
    correctAnswer: 'B',
    coachEncouragement: 'Solid answer! Quality sleep fuels your recovery and primes your mind for daily discipline!',
    coachCalloutWrong: 'Not quite! Run it again! Turn around and earn that checkpoint back!',
  },
  {
    id: 2,
    milestoneId: 2,
    milestoneTitle: 'MILESTONE 2 / 5',
    topic: 'Balanced Diet & Energy',
    question: 'What should you do to maintain a balanced diet?',
    options: [
      { key: 'A', text: 'Eat only fast food' },
      { key: 'B', text: 'Skip meals regularly' },
      { key: 'C', text: 'Eat a variety of nutritious foods' },
      { key: 'D', text: 'Avoid drinking water' },
    ],
    correctAnswer: 'C',
    coachEncouragement: 'Right on target! Whole nutritious foods give your engine the high-grade fuel it demands!',
    coachCalloutWrong: 'Not quite! Run it again! Your body needs real fuel, not shortcuts. Turn around!',
  },
  {
    id: 3,
    milestoneId: 3,
    milestoneTitle: 'MILESTONE 3 / 5',
    topic: 'Physical Exercise & Movement',
    question: 'Which activity is an example of regular exercise?',
    options: [
      { key: 'A', text: 'Walking briskly every day' },
      { key: 'B', text: 'Sitting for hours without moving' },
      { key: 'C', text: 'Playing video games all day' },
      { key: 'D', text: 'Sleeping throughout the day' },
    ],
    correctAnswer: 'A',
    coachEncouragement: 'Stay hard! Daily brisk walking builds cardiovascular endurance and unbreakable consistency!',
    coachCalloutWrong: 'Not quite! Run it again! Inactivity never built strength. Turn back and sprint it!',
  },
  {
    id: 4,
    milestoneId: 4,
    milestoneTitle: 'MILESTONE 4 / 5',
    topic: 'Hydration & Bodily Function',
    question: 'Why is drinking enough water important?',
    options: [
      { key: 'A', text: 'It replaces the need for food' },
      { key: 'B', text: 'It makes exercise unnecessary' },
      { key: 'C', text: 'It guarantees that you never get sick' },
      { key: 'D', text: 'It helps your body function properly' },
    ],
    correctAnswer: 'D',
    coachEncouragement: 'Outstanding! Hydration regulates temperature, transports nutrients, and powers cellular performance!',
    coachCalloutWrong: 'Not quite! Run it again! Water keeps the entire machine alive. Turn back and rerun!',
  },
  {
    id: 5,
    milestoneId: 5,
    milestoneTitle: 'MILESTONE 5 / 5',
    topic: 'Stress Management & Mindset',
    question: 'What is a healthy way to manage stress?',
    options: [
      { key: 'A', text: 'Ignore all your problems' },
      { key: 'B', text: 'Relax, exercise, or talk to someone you trust' },
      { key: 'C', text: 'Stop sleeping to finish more work' },
      { key: 'D', text: 'Avoid everyone permanently' },
    ],
    correctAnswer: 'B',
    coachEncouragement: 'Phenomenal work! Exercise, relaxation, and honest communication forge true resilience!',
    coachCalloutWrong: 'Not quite! Run it again! Suppressing stress won\'t cut it. Take accountability and run!',
  },
];
