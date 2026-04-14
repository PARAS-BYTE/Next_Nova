import { NextResponse } from 'next/server';

const CHALLENGES = [
  {
    question: "Which data structure follows the Last-In, First-Out (LIFO) principle?",
    options: ["Queue", "Stack", "Linked List", "Tree"],
    correctAnswer: "Stack",
    difficulty: "easy",
    explanation: "In a Stack, the last item added is the first one to be removed, like a stack of plates."
  },
  {
    question: "What is the Big O complexity of searching for an element in a balanced binary study tree?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
    correctAnswer: "O(log n)",
    difficulty: "medium",
    explanation: "Binary search in a balanced tree halves the search space each step, leading to logarithmic time."
  },
  {
    question: "In React, which hook would you use to perform side effects?",
    options: ["useState", "useContext", "useEffect", "useReducer"],
    correctAnswer: "useEffect",
    difficulty: "easy",
    explanation: "useEffect is designed to handle side effects like data fetching, subscriptions, or manually changing the DOM."
  }
];

export async function GET() {
  const challenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
  return NextResponse.json({ challenge });
}
