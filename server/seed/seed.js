require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Question = require('../src/models/Question');
const Exam = require('../src/models/Exam');
const ExamAttempt = require('../src/models/ExamAttempt');
const ViolationEvent = require('../src/models/ViolationEvent');
const Notification = require('../src/models/Notification');

const q = (text, options, correctOptionIndex, subject, difficulty, marks = 1) => ({
  text, options: options.map((t) => ({ text: t })), correctOptionIndex, subject, difficulty, marks, negativeMarks: 0.25
});

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/secure_exam';
  await mongoose.connect(uri);
  console.log('Connected. Clearing existing data...');

  await Promise.all([
    User.deleteMany({}), Question.deleteMany({}), Exam.deleteMany({}),
    ExamAttempt.deleteMany({}), ViolationEvent.deleteMany({}), Notification.deleteMany({})
  ]);

  const admin = await User.create({
    name: 'System Admin', email: 'admin@example.com', password: 'Admin@12345', role: 'admin'
  });
  const student = await User.create({
    name: 'Demo Student', email: 'student@example.com', password: 'Student@12345', role: 'student',
    rollNumber: 'CS2024001', department: 'Computer Science'
  });

  const questionsData = [
    // JavaScript (easy/medium/hard)
    q('What does "===" check in JavaScript?', ['Value only', 'Type only', 'Value and type', 'Reference only'], 2, 'JavaScript', 'easy'),
    q('Which keyword declares a block-scoped variable?', ['var', 'let', 'function', 'global'], 1, 'JavaScript', 'easy'),
    q('What is the output of typeof null?', ['"null"', '"undefined"', '"object"', '"boolean"'], 2, 'JavaScript', 'medium'),
    q('Which method converts JSON text into an object?', ['JSON.stringify', 'JSON.parse', 'JSON.object', 'JSON.toObject'], 1, 'JavaScript', 'easy'),
    q('What does the "this" keyword refer to in an arrow function?', ['The global object', 'A new object', 'The enclosing lexical scope', 'undefined always'], 2, 'JavaScript', 'hard'),
    q('Which array method creates a new array with results of calling a function on every element?', ['forEach', 'map', 'reduce', 'filter'], 1, 'JavaScript', 'medium'),
    q('What is a closure?', ['A loop construct', 'A function with access to its outer scope', 'A CSS property', 'A type of array'], 1, 'JavaScript', 'hard'),
    // Data Structures
    q('Which data structure uses FIFO order?', ['Stack', 'Queue', 'Tree', 'Graph'], 1, 'Data Structures', 'easy'),
    q('What is the time complexity of binary search?', ['O(n)', 'O(log n)', 'O(n^2)', 'O(1)'], 1, 'Data Structures', 'medium'),
    q('Which data structure is used for recursion (call stack)?', ['Queue', 'Stack', 'Heap only', 'Linked List only'], 1, 'Data Structures', 'easy'),
    q('In a max-heap, where is the largest element located?', ['At a leaf node', 'At the root', 'At the middle', 'Unordered'], 1, 'Data Structures', 'medium'),
    q('What is the worst-case time complexity of quicksort?', ['O(n log n)', 'O(n)', 'O(n^2)', 'O(log n)'], 2, 'Data Structures', 'hard'),
    q('Which traversal visits: left, root, right?', ['Pre-order', 'In-order', 'Post-order', 'Level-order'], 1, 'Data Structures', 'medium'),
    // Networking
    q('What does HTTP stand for?', ['HyperText Transfer Protocol', 'High Transfer Text Protocol', 'HyperText Transmission Path', 'Host Transfer Text Protocol'], 0, 'Networking', 'easy'),
    q('Which layer of the OSI model handles routing?', ['Data Link', 'Network', 'Transport', 'Session'], 1, 'Networking', 'medium'),
    q('What port does HTTPS use by default?', ['80', '21', '443', '8080'], 2, 'Networking', 'easy'),
    q('Which protocol resolves domain names to IP addresses?', ['DHCP', 'DNS', 'FTP', 'SMTP'], 1, 'Networking', 'easy'),
    q('TCP is a ____ protocol.', ['Connectionless', 'Connection-oriented', 'Stateless only', 'Unreliable'], 1, 'Networking', 'medium'),
    // DBMS
    q('Which SQL clause filters rows before grouping?', ['HAVING', 'WHERE', 'GROUP BY', 'ORDER BY'], 1, 'DBMS', 'medium'),
    q('What does ACID stand for in databases (first letter A)?', ['Atomicity', 'Availability', 'Aggregation', 'Authentication'], 0, 'DBMS', 'medium'),
    q('Which normal form removes transitive dependency?', ['1NF', '2NF', '3NF', 'BCNF only'], 2, 'DBMS', 'hard'),
    q('A primary key can contain NULL values.', ['True', 'False'], 1, 'DBMS', 'easy')
  ];

  const questions = await Question.insertMany(questionsData.map((qd) => ({ ...qd, createdBy: admin._id })));
  const jsQuestions = questions.filter((qq) => qq.subject === 'JavaScript');
  const dsQuestions = questions.filter((qq) => qq.subject === 'Data Structures');
  const otherQuestions = questions.filter((qq) => !['JavaScript', 'Data Structures'].includes(qq.subject));

  const now = new Date();

  const exam1 = await Exam.create({
    title: 'JavaScript & Data Structures Fundamentals',
    description: 'Covers core JavaScript concepts and fundamental data structures.',
    subject: 'Computer Science',
    questions: [...jsQuestions, ...dsQuestions].map((qq) => qq._id),
    durationMinutes: 30,
    passPercentage: 40,
    negativeMarking: true,
    negativeMarkValue: 0.25,
    startTime: new Date(now.getTime() - 60 * 60 * 1000),
    endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    isPublished: true,
    randomizeQuestions: true,
    randomizeOptions: true,
    createdBy: admin._id
  });

  const exam2 = await Exam.create({
    title: 'Networking & DBMS Basics',
    description: 'Covers networking fundamentals and database management systems.',
    subject: 'Computer Science',
    questions: otherQuestions.map((qq) => qq._id),
    durationMinutes: 20,
    passPercentage: 40,
    negativeMarking: false,
    startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    endTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
    isPublished: true,
    randomizeQuestions: true,
    randomizeOptions: true,
    createdBy: admin._id
  });

  await Notification.create({
    user: student._id,
    title: 'Welcome to SecureExam',
    message: 'Your account is ready. Check your dashboard for upcoming exams.',
    type: 'success'
  });

  console.log('Seed complete.');
  console.log('Admin login   -> admin@example.com / Admin@12345');
  console.log('Student login -> student@example.com / Student@12345');
  console.log(`Exams created: ${exam1.title}, ${exam2.title}`);
  console.log(`Questions created: ${questions.length}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
