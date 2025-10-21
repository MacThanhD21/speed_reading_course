import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import questionGenerationService from '../../services/questionGenerationService';

const Quiz = ({ content, readingData, onFinishQuiz }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isGenerating, setIsGenerating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUsingAI, setIsUsingAI] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('Đang tạo câu hỏi với AI...');

  // Generate questions based on content
  useEffect(() => {
    generateQuestions();
  }, []);

  const generateQuestions = async () => {
    setIsGenerating(true);
    setGenerationStatus('Đang tạo câu hỏi với AI...');
    
    try {
      console.log('Starting question generation...');
      
      // Try AI generation first with timeout
      const aiQuestionsPromise = questionGenerationService.generateQuestions(content);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI generation timeout')), 15000)
      );
      
      const aiQuestions = await Promise.race([aiQuestionsPromise, timeoutPromise]);
      
      if (aiQuestions && aiQuestions.length > 0) {
        console.log('Using AI-generated questions:', aiQuestions.length);
        setQuestions(aiQuestions);
        setIsUsingAI(true);
        setGenerationStatus('Tạo câu hỏi thành công!');
      } else {
        console.log('AI generation failed, falling back to local generation...');
        setGenerationStatus('Đang tạo câu hỏi từ nội dung...');
        const localQuestions = generateQuestionsFromContent(content);
        setQuestions(localQuestions);
        setIsUsingAI(false);
        setGenerationStatus('Tạo câu hỏi thành công!');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      
      // Show user-friendly error message
      if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
        console.log('Rate limit exceeded, using local questions');
        setGenerationStatus('API quá tải, đang tạo câu hỏi từ nội dung...');
      } else if (error.message.includes('timeout')) {
        console.log('AI generation timeout, using local questions');
        setGenerationStatus('Hết thời gian chờ, đang tạo câu hỏi từ nội dung...');
      } else {
        setGenerationStatus('Lỗi AI, đang tạo câu hỏi từ nội dung...');
      }
      
      // Always fallback to local generation
      const localQuestions = generateQuestionsFromContent(content);
      setQuestions(localQuestions);
      setIsUsingAI(false);
      setGenerationStatus('Tạo câu hỏi thành công!');
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to generate questions from content
  const generateQuestionsFromContent = (content) => {
    if (!content || !content.content) {
      console.log('No content provided for question generation');
      return [];
    }

    const text = content.content;
    console.log('Generating questions for text:', text.substring(0, 100) + '...');
    
    const words = text.split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Extract key information
    const keyWords = extractKeyWords(text);
    const entities = extractEntities(text);
    const numbers = extractNumbers(text);
    
    console.log('Extracted information:', {
      keyWords: keyWords.slice(0, 3),
      entities: entities.slice(0, 3),
      numbers: numbers.slice(0, 3),
      sentenceCount: sentences.length
    });
    
    const questions = [];
    let questionId = 1;

    // Generate 5W1H questions
    const fiveW1HQuestions = generate5W1HQuestions(text, entities, keyWords, questionId);
    questions.push(...fiveW1HQuestions);
    questionId += fiveW1HQuestions.length;

    // Generate MCQ questions
    const mcqQuestions = generateMCQQuestions(text, sentences, keyWords, questionId);
    questions.push(...mcqQuestions);

    console.log('Generated questions:', questions.length);
    return questions;
  };

  // Extract key words from text
  const extractKeyWords = (text) => {
    const words = text.toLowerCase().split(/\s+/);
    const wordCount = {};
    
    // Common Vietnamese stop words to filter out
    const stopWords = ['và', 'của', 'trong', 'với', 'cho', 'từ', 'đến', 'được', 'có', 'là', 'đã', 'sẽ', 'này', 'đó', 'các', 'một', 'những', 'nhiều', 'có thể', 'không', 'như', 'về', 'theo', 'để', 'khi', 'nếu', 'vì', 'do', 'bởi'];
    
    words.forEach(word => {
      const cleanWord = word.replace(/[.,!?;:()]/g, '');
      if (cleanWord.length > 3 && !stopWords.includes(cleanWord)) {
        wordCount[cleanWord] = (wordCount[cleanWord] || 0) + 1;
      }
    });
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([word]) => word);
  };

  // Extract entities (names, places, etc.)
  const extractEntities = (text) => {
    const entities = [];
    
    // Simple pattern matching for Vietnamese names and places
    const namePattern = /[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+/g;
    const matches = text.match(namePattern) || [];
    
    matches.forEach(match => {
      if (match.length > 2 && !entities.includes(match)) {
        entities.push(match);
      }
    });
    
    return entities.slice(0, 5);
  };

  // Extract numbers from text
  const extractNumbers = (text) => {
    const numberPattern = /\d+/g;
    return text.match(numberPattern) || [];
  };

  // Generate 5W1H questions
  const generate5W1HQuestions = (text, entities, keyWords, startId) => {
    const questions = [];
    let id = startId;

    // Who questions - based on actual entities
    if (entities.length > 0) {
      questions.push({
        id: id++,
        type: '5W1H',
        category: 'Who',
        question: 'Ai là nhân vật chính được đề cập trong bài viết?',
        options: [
          entities[0],
          entities[1] || 'Nhân vật khác',
          'Không có nhân vật cụ thể',
          'Nhiều nhân vật'
        ],
        correctAnswer: 0,
        explanation: `Nhân vật "${entities[0]}" được đề cập nhiều lần trong bài viết.`
      });
    }

    // What questions - based on key words
    if (keyWords.length > 0) {
      questions.push({
        id: id++,
        type: '5W1H',
        category: 'What',
        question: 'Vấn đề chính được thảo luận trong bài viết là gì?',
        options: [
          keyWords[0],
          keyWords[1] || 'Vấn đề khác',
          'Không rõ ràng',
          'Nhiều vấn đề'
        ],
        correctAnswer: 0,
        explanation: `"${keyWords[0]}" là từ khóa xuất hiện nhiều nhất trong bài viết.`
      });
    }

    // Where questions - look for location indicators
    const locationWords = ['ở', 'tại', 'trong', 'nơi', 'địa điểm', 'khu vực', 'vùng', 'thành phố', 'quốc gia'];
    const hasLocation = locationWords.some(word => text.toLowerCase().includes(word));
    
    if (hasLocation) {
      questions.push({
        id: id++,
        type: '5W1H',
        category: 'Where',
        question: 'Sự kiện trong bài viết diễn ra ở đâu?',
        options: [
          'Địa điểm được đề cập trong bài',
          'Nhiều địa điểm',
          'Không xác định',
          'Địa điểm khác'
        ],
        correctAnswer: 0,
        explanation: 'Bài viết có đề cập đến địa điểm cụ thể.'
      });
    }

    // When questions - look for time indicators
    const timeWords = ['khi', 'lúc', 'thời điểm', 'ngày', 'tháng', 'năm', 'thời gian', 'hiện tại', 'trước', 'sau'];
    const hasTime = timeWords.some(word => text.toLowerCase().includes(word));
    
    if (hasTime) {
      questions.push({
        id: id++,
        type: '5W1H',
        category: 'When',
        question: 'Sự kiện trong bài viết diễn ra khi nào?',
        options: [
          'Thời điểm được đề cập trong bài',
          'Thời điểm khác',
          'Không xác định',
          'Nhiều thời điểm'
        ],
        correctAnswer: 0,
        explanation: 'Bài viết có đề cập đến thời điểm cụ thể.'
      });
    }

    // Why questions - look for reason indicators
    const reasonWords = ['vì', 'do', 'bởi', 'tại sao', 'lý do', 'nguyên nhân', 'để', 'nhằm'];
    const hasReason = reasonWords.some(word => text.toLowerCase().includes(word));
    
    if (hasReason) {
      questions.push({
        id: id++,
        type: '5W1H',
        category: 'Why',
        question: 'Tại sao sự kiện trong bài viết xảy ra?',
        options: [
          'Lý do được giải thích trong bài',
          'Lý do khác',
          'Không rõ ràng',
          'Nhiều lý do'
        ],
        correctAnswer: 0,
        explanation: 'Bài viết có giải thích lý do cho sự kiện.'
      });
    }

    // How questions - look for method indicators
    const methodWords = ['cách', 'phương pháp', 'biện pháp', 'giải pháp', 'làm thế nào', 'như thế nào'];
    const hasMethod = methodWords.some(word => text.toLowerCase().includes(word));
    
    if (hasMethod) {
      questions.push({
        id: id++,
        type: '5W1H',
        category: 'How',
        question: 'Làm thế nào để giải quyết vấn đề trong bài viết?',
        options: [
          'Cách được đề xuất trong bài',
          'Cách khác',
          'Không rõ ràng',
          'Nhiều cách'
        ],
        correctAnswer: 0,
        explanation: 'Bài viết có đề xuất cách giải quyết vấn đề.'
      });
    }

    return questions;
  };

  // Generate MCQ questions
  const generateMCQQuestions = (text, sentences, keyWords, startId) => {
    const questions = [];
    let id = startId;

    // Question about main topic - based on actual key words
    if (keyWords.length > 0) {
      questions.push({
        id: id++,
        type: 'MCQ',
        question: 'Theo bài viết, điều gì là quan trọng nhất?',
        options: [
          keyWords[0],
          keyWords[1] || 'Yếu tố khác',
          'Không xác định',
          'Nhiều yếu tố'
        ],
        correctAnswer: 0,
        explanation: `"${keyWords[0]}" là từ khóa xuất hiện nhiều nhất trong bài viết.`
      });
    }

    // Question about numbers if present
    const numbers = extractNumbers(text);
    if (numbers.length > 0) {
      questions.push({
        id: id++,
        type: 'MCQ',
        question: 'Con số nào được đề cập trong bài viết?',
        options: [
          numbers[0],
          numbers[1] || 'Số khác',
          'Không có số',
          'Nhiều số'
        ],
        correctAnswer: 0,
        explanation: `Số ${numbers[0]} được đề cập trong bài viết.`
      });
    }

    // Question about conclusion - analyze last sentences
    if (sentences.length > 0) {
      const lastSentences = sentences.slice(-2); // Last 2 sentences
      const hasConclusion = lastSentences.some(sentence => 
        sentence.toLowerCase().includes('kết luận') || 
        sentence.toLowerCase().includes('tóm lại') ||
        sentence.toLowerCase().includes('cuối cùng')
      );
      
      questions.push({
        id: id++,
        type: 'MCQ',
        question: 'Kết luận chính của bài viết là gì?',
        options: [
          hasConclusion ? 'Có kết luận rõ ràng' : 'Thông tin quan trọng',
          'Không có kết luận',
          'Kết luận mơ hồ',
          'Nhiều kết luận'
        ],
        correctAnswer: 0,
        explanation: hasConclusion ? 'Bài viết có kết luận rõ ràng.' : 'Bài viết chứa thông tin quan trọng.'
      });
    }

    return questions;
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Calculate score
      let correctAnswers = 0;
      questions.forEach(question => {
        if (answers[question.id] === question.correctAnswer) {
          correctAnswers++;
        }
      });

      const score = Math.round((correctAnswers / questions.length) * 100);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onFinishQuiz({
        score,
        correctAnswers,
        totalQuestions: questions.length,
        answers,
        questions
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <FaSpinner className="text-6xl text-blue-600 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {generationStatus}
          </h2>
          <p className="text-gray-600 max-w-md">
            Hệ thống AI đang phân tích nội dung và tạo các câu hỏi kiểm tra hiểu biết phù hợp với Gemini API.
          </p>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Kiểm tra hiểu biết
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">
            Trả lời các câu hỏi để đánh giá khả năng hiểu biết của bạn
          </p>
          {isUsingAI && (
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm font-medium text-purple-800">
                Câu hỏi được tạo bởi AI Gemini
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                Câu hỏi {currentQuestionIndex + 1} / {questions.length}
              </span>
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-4 sm:p-8"
          >
            {/* Question Type Badge */}
            <div className="mb-3 sm:mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                currentQuestion.type === '5W1H' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {currentQuestion.type === '5W1H' ? `5W1H - ${currentQuestion.category}` : 'MCQ'}
              </span>
            </div>

            {/* Question Text */}
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
              {currentQuestion.question}
            </h2>

            {/* Answer Options */}
            <div className="space-y-2 sm:space-y-3">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    answers[currentQuestion.id] === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={index}
                    checked={answers[currentQuestion.id] === index}
                    onChange={() => handleAnswerSelect(currentQuestion.id, index)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 mr-3 sm:mr-4 flex items-center justify-center ${
                    answers[currentQuestion.id] === index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion.id] === index && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-sm sm:text-base text-gray-700">{option}</span>
                </label>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 sm:mt-8 space-y-4 sm:space-y-0">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 border border-gray-300 rounded-lg text-sm sm:text-base text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>

              <div className="flex space-x-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600'
                        : answers[questions[index].id] !== undefined
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || answers[currentQuestion.id] === undefined}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="mr-2 animate-spin" />
                      Đang chấm điểm...
                    </>
                  ) : (
                    <>
                      <FaCheck className="mr-2" />
                      Hoàn thành
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={answers[currentQuestion.id] === undefined}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tiếp theo
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
