
export enum GamePhase {
  INTRO = 'INTRO',
  PLANNING = 'PLANNING', // 每年开始的规划阶段
  EVENT = 'EVENT',      // 突发事件阶段
  SUMMARY = 'SUMMARY',  // 最终总结
  FAILED = 'FAILED'     // 治理崩溃
}

export interface Metrics {
  development: number; // 发展度 (影响资源产出)
  security: number;    // 安全度 (抵御外部冲突)
  stability: number;   // 社会韧性 (抵御内部动荡)
  autonomy: number;    // 科技主权 (减轻封锁损失)
}

export interface PolicyCard {
  id: string;
  title: string;
  description: string;
  cost: number;
  impact: (m: Metrics) => Metrics;
  tag: '经济' | '军事' | '民生' | '科研';
}

export interface CrisisEvent {
  id: string;
  title: string;
  description: string;
  check: (m: Metrics) => boolean; // 返回 true 表示通过
  onFail: (m: Metrics) => Metrics;
  onSuccess: (m: Metrics) => Metrics;
  failMessage: string;
  successMessage: string;
  severity: number; // 难度等级
}

export interface GameState {
  year: number;
  maxYears: number;
  resources: number;
  metrics: Metrics;
  phase: GamePhase;
  activeCrisis: CrisisEvent | null;
  history: {year: number, text: string}[];
  aiAnalysis: string;
  globalTension: number; // 随时间增加
}
