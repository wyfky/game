
import { GoogleGenAI } from "@google/genai";
import { Metrics, GamePhase } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getStrategicAdvice = async (metrics: Metrics, phase: GamePhase, action?: string): Promise<string> => {
  try {
    const prompt = `
      你是一位顶级大国战略顾问。
      当前国家指标：
      - 发展度: ${metrics.development}
      - 安全度: ${metrics.security}
      - 社会韧性: ${metrics.stability}
      - 自主率: ${metrics.autonomy}
      
      当前阶段: ${phase}
      玩家操作: ${action || '查看仪表盘'}
      
      请提供简短、专业的政治经济战略分析（字数控制在 150 字以内）。
      使用专业且严肃的语气。重点分析“发展与安全”或“自主与韧性”之间的权衡。
      必须使用中文回复。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.8,
      }
    });

    return response.text || "目前无法提供战略分析。";
  } catch (error) {
    console.error("AI Error:", error);
    return "战略顾问目前离线。请根据您的判断进行治理。";
  }
};

export const getFinalReport = async (metrics: Metrics, history: string[]): Promise<string> => {
  try {
    const prompt = `
      大国治理模拟已经结束。
      最终指标：发展度 ${metrics.development}, 安全度 ${metrics.security}, 社会韧性 ${metrics.stability}, 自主率 ${metrics.autonomy}。
      治理历史事件：${history.join(', ')}。
      
      请以“历史教科书”的风格撰写一份关于本届委员会治下国家的总结。
      这是一个黄金时代、黑暗时代，还是脆弱的和平？
      分析要深刻、带有洞察力，且略带历史厚重感。
      必须使用中文回复。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    return response.text || "历史将保持沉默。";
  } catch (error) {
    return "治理顺利结束。";
  }
};
