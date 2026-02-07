
import { GoogleGenAI } from "@google/genai";
import { SaleData } from "../types";

export const getAIAnalytics = async (salesData: SaleData[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const dataString = JSON.stringify(salesData);

  const prompt = `
    Quyidagi oxirgi haftalik sotuv ma'lumotlarini tahlil qil va o'zbek tilida qisqa hisobot tayyorla:
    ${dataString}

    Hisobotda quyidagilar bo'lsin:
    1. Haftaning eng ko'p buyurtma bo'lgan kunlari (Peak days).
    2. Sotuvlar past bo'lgan kunlar va ularning sababi haqida taxminlar.
    3. Kelasi hafta uchun biznes maslahatlar.
    
    Hisobot professional, lekin tushunarli tilda bo'lsin.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Analytics Error:", error);
    return "Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.";
  }
};
