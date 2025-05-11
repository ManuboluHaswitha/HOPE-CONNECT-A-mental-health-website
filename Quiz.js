const quizQuestions = [
    {
      question: "How often do you feel nervous or on edge?",
      options: ["Rarely", "Sometimes", "Often", "Always"],
      scores: { anxiety: [0, 1, 2, 3], examStress: [0, 1, 2, 3] },
    },
    {
      question: "Do you find it difficult to focus on tasks like studying or working?",
      options: ["Rarely", "Sometimes", "Often", "Always"],
      scores: { examStress: [0, 1, 2, 3], confidence: [0, 1, 2, 3] },
    },
    {
      question: "How often do you feel that you lack energy or motivation?",
      options: ["Rarely", "Sometimes", "Often", "Always"],
      scores: { depression: [0, 1, 2, 3], loneliness: [0, 1, 2, 3] },
    },
    {
      question: "Do you feel like your efforts are never good enough?",
      options: ["Rarely", "Sometimes", "Often", "Always"],
      scores: { confidence: [0, 1, 2, 3], anxiety: [0, 1, 2, 3] },
    },
    {
      question: "How often do you feel overwhelmed by your responsibilities or tasks?",
      options: ["Rarely", "Sometimes", "Often", "Always"],
      scores: { examStress: [0, 1, 2, 3], anxiety: [0, 1, 2, 3] },
    },
    {
      question: "Do you find it hard to connect with people or maintain close relationships?",
      options: ["Rarely", "Sometimes", "Often", "Always"],
      scores: { loneliness: [0, 1, 2, 3], depression: [0, 1, 2, 3] },
    },
    {
      question: "Do you frequently worry about things that are out of your control?",
      options: ["Rarely", "Sometimes", "Often", "Always"],
      scores: { anxiety: [0, 1, 2, 3], examStress: [0, 1, 2, 3] },
    },
    {
      question: "Do you often feel like you don’t belong or that people don’t understand you?",
      options: ["Rarely", "Sometimes", "Often", "Always"],
      scores: { loneliness: [0, 1, 2, 3], depression: [0, 1, 2, 3] },
    },
    {
      question: "Do you feel unhappy or dissatisfied with yourself most of the time?",
      options: ["Rarely", "Sometimes", "Often", "Always"],
      scores: { depression: [0, 1, 2, 3], confidence: [0, 1, 2, 3] },
    },
    {
      question: "Do you avoid certain situations or tasks because you’re afraid of failing?",
      options: ["Rarely", "Sometimes", "Often", "Always"],
      scores: { confidence: [0, 1, 2, 3], anxiety: [0, 1, 2, 3] },
    },
    {
      question: "How often do you feel pressure to perform well in school or other areas of life?",
      options: ["Rarely", "Sometimes", "Often", "Always"],
      scores: { examStress: [0, 1, 2, 3], anxiety: [0, 1, 2, 3] },
    },
    {
      question: "Do you often feel like crying or tearing up for no particular reason?",
      options: ["Rarely", "Sometimes", "Often", "Always"],
      scores: { depression: [0, 1, 2, 3], loneliness: [0, 1, 2, 3] },
    },
    {
      question: "Do you find yourself comparing your abilities or appearance to others?",
      options: ["Rarely", "Sometimes", "Often", "Always"],
      scores: { confidence: [0, 1, 2, 3], anxiety: [0, 1, 2, 3] },
    },
    {
      question: "How often do you feel that nothing makes you happy anymore?",
      options: ["Rarely", "Sometimes", "Often", "Always"],
      scores: { depression: [0, 1, 2, 3], loneliness: [0, 1, 2, 3] },
    },
    {
      question: "Do you experience physical symptoms like a racing heart or sweaty palms when stressed?",
      options: ["Rarely", "Sometimes", "Often", "Always"],
      scores: { anxiety: [0, 1, 2, 3], examStress: [0, 1, 2, 3] },
    },
  ];

export default quizQuestions