// AI Recommendation Service using Gemini API
import geminiService from './geminiService';

class RecommendationService {
  constructor() {
    // No need for API key here as it's handled by GeminiService
  }

  // Generate AI recommendations using Gemini API
  async generateRecommendations(readingData, quizData, content) {
    if (!geminiService.isApiKeyAvailable()) {
      console.warn('Gemini API key not found');
      return this.getFallbackRecommendations(readingData, quizData);
    }

    try {
      console.log('Sending recommendation prompt to Gemini API...');
      
      const generatedContent = await geminiService.generateRecommendations(readingData, quizData, content);
      console.log('Generated recommendations:', generatedContent);
      
      return this.parseRecommendations(generatedContent);
    } catch (error) {
      console.error('Gemini API error:', error);
      return this.getFallbackRecommendations(readingData, quizData);
    }
  }


  // Parse AI response
  parseRecommendations(content) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        
        if (parsed.overview && parsed.strengths && parsed.weaknesses) {
          return parsed;
        }
      }
      
      // Fallback: return structured text
      return this.parseRecommendationsManually(content);
    } catch (error) {
      console.error('Error parsing recommendations:', error);
      return this.parseRecommendationsManually(content);
    }
  }

  // Manual parsing fallback
  parseRecommendationsManually(content) {
    const lines = content.split('\n').filter(line => line.trim());
    
    return {
      overview: "Dựa trên kết quả của bạn, chúng tôi đưa ra một số khuyến nghị cải thiện.",
      strengths: [
        "Hoàn thành bài kiểm tra",
        "Tốc độ đọc ổn định",
        "Có khả năng tập trung"
      ],
      weaknesses: [
        "Cần cải thiện độ chính xác",
        "Tăng cường tập trung",
        "Luyện tập đọc hiểu"
      ],
      recommendations: [
        "Luyện tập đọc hàng ngày",
        "Sử dụng kỹ thuật đọc có nhịp điệu",
        "Tập trung vào từ khóa quan trọng"
      ],
      exercises: [
        "Đọc và tóm tắt nội dung",
        "Luyện tập với timer",
        "Thực hành đọc hiểu"
      ]
    };
  }

  // Fallback recommendations
  getFallbackRecommendations(readingData, quizData) {
    const { finalWPM, score } = readingData;
    const { correctAnswers, totalQuestions } = quizData;
    
    let overview = "Dựa trên kết quả của bạn, ";
    let strengths = [];
    let weaknesses = [];
    let recommendations = [];
    let exercises = [];

    // Analyze reading speed
    if (finalWPM >= 300) {
      strengths.push("Tốc độ đọc nhanh");
      recommendations.push("Duy trì tốc độ đọc hiện tại");
    } else if (finalWPM < 200) {
      weaknesses.push("Tốc độ đọc chậm");
      recommendations.push("Luyện tập tăng tốc độ đọc");
      exercises.push("Đọc với timer để tăng tốc");
    }

    // Analyze comprehension
    if (score >= 80) {
      strengths.push("Khả năng hiểu biết tốt");
      overview += "bạn có khả năng đọc hiểu tốt. ";
    } else if (score < 60) {
      weaknesses.push("Khả năng hiểu biết cần cải thiện");
      recommendations.push("Đọc chậm hơn và tập trung vào nội dung");
      exercises.push("Thực hành đọc hiểu với các bài tập");
    }

    // Analyze consistency
    if (finalWPM > 400 && score < 70) {
      weaknesses.push("Tốc độ cao nhưng hiểu biết thấp");
      recommendations.push("Cân bằng giữa tốc độ và độ chính xác");
    }

    // Default recommendations
    if (recommendations.length === 0) {
      recommendations = [
        "Luyện tập đọc hàng ngày",
        "Sử dụng kỹ thuật đọc có nhịp điệu",
        "Tập trung vào từ khóa quan trọng"
      ];
    }

    if (exercises.length === 0) {
      exercises = [
        "Đọc và tóm tắt nội dung",
        "Luyện tập với timer",
        "Thực hành đọc hiểu"
      ];
    }

    if (strengths.length === 0) {
      strengths = ["Hoàn thành bài kiểm tra", "Có khả năng tập trung"];
    }

    if (weaknesses.length === 0) {
      weaknesses = ["Cần cải thiện độ chính xác", "Tăng cường tập trung"];
    }

    overview += "Hãy tiếp tục luyện tập để cải thiện kỹ năng đọc của mình.";

    return {
      overview,
      strengths,
      weaknesses,
      recommendations,
      exercises
    };
  }
}

export default new RecommendationService();
