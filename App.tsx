
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GamePhase, GameState, Metrics, PolicyCard, CrisisEvent } from './types';
import { INITIAL_METRICS, POLICIES, CRISES } from './constants';
import RadarChart from './components/RadarChart';
import { getStrategicAdvice, getFinalReport } from './geminiService';
import { 
  Shield, TrendingUp, Users, Key, AlertTriangle, 
  ChevronRight, RotateCcw, Cpu, Zap, Radio, 
  History as HistoryIcon, Target, DollarSign, Globe
} from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    year: 1,
    maxYears: 5,
    resources: 100,
    metrics: INITIAL_METRICS,
    phase: GamePhase.INTRO,
    activeCrisis: null,
    history: [],
    aiAnalysis: "正在加载国家数据库...",
    globalTension: 0
  });

  const [currentPolicies, setCurrentPolicies] = useState<PolicyCard[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);

  // 计算每年的资源收入 (基于发展度)
  const income = useMemo(() => Math.floor(state.metrics.development * 0.8) + 20, [state.metrics.development]);

  // 更新 AI 建议
  const updateAdvice = useCallback(async (metrics: Metrics, phase: GamePhase, action?: string) => {
    setLoadingAI(true);
    const advice = await getStrategicAdvice(metrics, phase, action);
    setState(prev => ({ ...prev, aiAnalysis: advice }));
    setLoadingAI(false);
  }, []);

  // 随机抽取政策
  const drawPolicies = () => {
    const shuffled = [...POLICIES].sort(() => 0.5 - Math.random());
    setCurrentPolicies(shuffled.slice(0, 3));
  };

  const startGame = () => {
    drawPolicies();
    setState(prev => ({ 
      ...prev, 
      phase: GamePhase.PLANNING,
      history: [{ year: 0, text: "国家治理委员会正式接管政权。" }]
    }));
    updateAdvice(INITIAL_METRICS, GamePhase.PLANNING, "新任执政官就职");
  };

  const applyPolicy = (policy: PolicyCard) => {
    if (state.resources < policy.cost) return;

    const newMetrics = policy.impact(state.metrics);
    setState(prev => ({
      ...prev,
      resources: prev.resources - policy.cost,
      metrics: newMetrics,
      history: [...prev.history, { year: prev.year, text: `实施政策: ${policy.title}` }]
    }));
    
    // 每实施一次政策，立即从卡池移除该项，可选更多或直接进入事件
    setCurrentPolicies(prev => prev.filter(p => p.id !== policy.id));
  };

  const startEventPhase = () => {
    // 随机选择一个危机
    const eligibleCrises = CRISES.filter(c => c.severity <= (state.year > 3 ? 2 : 1));
    const crisis = eligibleCrises[Math.floor(Math.random() * eligibleCrises.length)];
    
    setState(prev => ({
      ...prev,
      phase: GamePhase.EVENT,
      activeCrisis: crisis
    }));
    updateAdvice(state.metrics, GamePhase.EVENT, `面临挑战: ${crisis.title}`);
  };

  const resolveEvent = () => {
    if (!state.activeCrisis) return;
    const success = state.activeCrisis.check(state.metrics);
    const newMetrics = success 
      ? state.activeCrisis.onSuccess(state.metrics) 
      : state.activeCrisis.onFail(state.metrics);

    // 检查是否失败
    if (newMetrics.stability <= 0 || newMetrics.security <= 0 || newMetrics.development <= 0) {
       setState(prev => ({
         ...prev,
         metrics: newMetrics,
         phase: GamePhase.FAILED,
         history: [...prev.history, { year: prev.year, text: `由于${state.activeCrisis?.title}处理不当导致系统性崩溃。` }]
       }));
       return;
    }

    setState(prev => ({
      ...prev,
      metrics: newMetrics,
      history: [...prev.history, { year: prev.year, text: success ? `成功化解: ${state.activeCrisis?.title}` : `遭遇重创: ${state.activeCrisis?.title}` }]
    }));

    // 准备进入下一年或结束
    if (state.year >= state.maxYears) {
      finalizeGame(newMetrics);
    } else {
      nextYear();
    }
  };

  const nextYear = () => {
    drawPolicies();
    setState(prev => ({
      ...prev,
      year: prev.year + 1,
      resources: prev.resources + income,
      globalTension: prev.globalTension + 10,
      phase: GamePhase.PLANNING,
      activeCrisis: null
    }));
  };

  const finalizeGame = async (finalMetrics: Metrics) => {
    setState(prev => ({ ...prev, phase: GamePhase.SUMMARY }));
    const summary = await getFinalReport(finalMetrics, state.history.map(h => h.text));
    setState(prev => ({ ...prev, aiAnalysis: summary }));
  };

  const reset = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row p-4 md:p-8 gap-6 max-w-7xl mx-auto selection:bg-blue-500/30">
      
      {/* 侧边仪表盘 */}
      <aside className="w-full md:w-80 flex flex-col gap-6 shrink-0">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10">
            <h1 className="text-xl font-black text-blue-400 mb-6 flex items-center gap-2 tracking-tighter">
              <Globe className="w-6 h-6 animate-pulse text-blue-500" />
              BALANCER.OS <span className="text-[10px] font-mono bg-blue-500/20 px-1 rounded">V2.0</span>
            </h1>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 font-bold uppercase">治理年度</div>
                <div className="text-xl font-mono text-white">{state.year} <span className="text-xs text-slate-600">/ {state.maxYears}</span></div>
              </div>
              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 font-bold uppercase">年度预算</div>
                <div className="text-xl font-mono text-emerald-400">+{income}</div>
              </div>
            </div>

            <div className="bg-blue-900/10 p-4 rounded-xl border border-blue-500/20 mb-8">
               <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-blue-400 uppercase">当前战略储备</span>
                  <DollarSign className="w-3 h-3 text-blue-400" />
               </div>
               <div className="text-3xl font-mono font-black text-blue-100">{state.resources}</div>
            </div>

            <div className="space-y-4">
              <MetricBar label="发展度" value={state.metrics.development} icon={<TrendingUp className="w-3 h-3 text-emerald-400" />} color="bg-emerald-500" />
              <MetricBar label="安全度" value={state.metrics.security} icon={<Shield className="w-3 h-3 text-blue-400" />} color="bg-blue-500" />
              <MetricBar label="社会韧性" value={state.metrics.stability} icon={<Users className="w-3 h-3 text-purple-400" />} color="bg-purple-500" />
              <MetricBar label="科技主权" value={state.metrics.autonomy} icon={<Key className="w-3 h-3 text-orange-400" />} color="bg-orange-500" />
            </div>
          </div>
        </div>

        {/* AI 顾问日志 */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-6 rounded-2xl flex-1 flex flex-col shadow-xl min-h-[300px]">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            战略情报汇总
          </h2>
          <div className="flex-1 overflow-y-auto pr-2 text-sm leading-relaxed text-slate-300 font-light">
            {loadingAI ? (
              <div className="flex items-center gap-3 text-slate-500 p-4 bg-slate-800/20 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                正在模拟推演...
              </div>
            ) : (
              <div className="prose prose-invert prose-sm">
                {state.aiAnalysis.split('\n').map((line, i) => <p key={i} className="mb-2">{line}</p>)}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 主操作区 */}
      <main className="flex-1 flex flex-col gap-6">
        
        <div className="hidden md:block">
           <RadarChart metrics={state.metrics} />
        </div>

        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-10 shadow-2xl relative flex flex-col overflow-hidden">
          {/* 实时状态点缀 */}
          <div className="absolute top-4 right-6 flex items-center gap-4">
             <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${state.globalTension > 30 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="text-[10px] font-mono text-slate-600 uppercase">全球张力: {state.globalTension}%</span>
             </div>
          </div>

          {state.phase === GamePhase.INTRO && (
            <div className="max-w-xl mx-auto text-center flex-1 flex flex-col justify-center items-center py-20">
               <div className="relative mb-10">
                 <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                 <Shield className="w-20 h-20 text-blue-500 relative z-10" />
               </div>
               <h2 className="text-5xl font-black mb-6 tracking-tighter">大国博弈 <span className="text-blue-500">2.0</span></h2>
               <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                 欢迎来到决策中心。你将接手一个处于十字路口的强权。
                 未来五年，全球秩序将面临剧烈重构。你的每一个决定，都在重写文明的结局。
               </p>
               <button onClick={startGame} className="bg-blue-600 hover:bg-blue-500 px-12 py-5 rounded-2xl font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/20 flex items-center gap-3">
                 开启执政纪元
                 <ChevronRight className="w-6 h-6" />
               </button>
            </div>
          )}

          {state.phase === GamePhase.PLANNING && (
            <div className="animate-in fade-in slide-in-from-right duration-500 flex-1 flex flex-col">
              <div className="flex justify-between items-end mb-8">
                <div>
                   <h2 className="text-3xl font-black flex items-center gap-3">
                     <Target className="w-8 h-8 text-blue-500" />
                     第 {state.year} 年战略规划
                   </h2>
                   <p className="text-slate-500 mt-2 font-medium">请从当前可用政策中选择。你可以实施多项，直至预算耗尽。</p>
                </div>
                <button onClick={startEventPhase} className="bg-slate-800 hover:bg-red-600 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 border border-slate-700">
                  结束规划阶段
                  <Zap className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
                {currentPolicies.map(policy => (
                  <div key={policy.id} className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl group hover:border-blue-500/50 transition-all">
                    <div className="flex justify-between items-start mb-4">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                         policy.tag === '经济' ? 'bg-emerald-500/20 text-emerald-400' :
                         policy.tag === '军事' ? 'bg-blue-500/20 text-blue-400' :
                         policy.tag === '民生' ? 'bg-purple-500/20 text-purple-400' :
                         'bg-orange-500/20 text-orange-400'
                       }`}>{policy.tag}</span>
                       <span className="font-mono text-sm text-slate-500 font-bold">成本: {policy.cost}</span>
                    </div>
                    <h3 className="text-xl font-black mb-3 text-slate-100">{policy.title}</h3>
                    <p className="text-sm text-slate-400 mb-6 leading-relaxed min-h-[3rem]">{policy.description}</p>
                    <button 
                      disabled={state.resources < policy.cost}
                      onClick={() => applyPolicy(policy)}
                      className="w-full py-3 bg-slate-800 hover:bg-blue-600 disabled:opacity-30 disabled:hover:bg-slate-800 rounded-xl font-bold transition-all border border-slate-700 hover:border-blue-400"
                    >
                      {state.resources < policy.cost ? '预算不足' : '立即签署'}
                    </button>
                  </div>
                ))}
                {currentPolicies.length === 0 && (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                     <p className="text-slate-500 font-mono">本年度政令已签署完毕</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {state.phase === GamePhase.EVENT && (
            <div className="animate-in zoom-in duration-500 flex-1 flex flex-col justify-center items-center">
               <div className="max-w-2xl bg-red-950/20 border border-red-500/30 p-10 rounded-[3rem] text-center shadow-2xl shadow-red-500/10">
                  <AlertTriangle className="w-20 h-20 text-red-500 mx-auto mb-8 animate-bounce" />
                  <h3 className="text-4xl font-black mb-4 text-red-100 tracking-tight">{state.activeCrisis?.title}</h3>
                  <p className="text-xl text-slate-300 mb-10 leading-relaxed font-light">
                    {state.activeCrisis?.description}
                  </p>
                  
                  <button onClick={resolveEvent} className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xl transition-all shadow-xl shadow-red-900/40">
                    启动危机应对方案
                  </button>
               </div>
            </div>
          )}

          {state.phase === GamePhase.SUMMARY && (
             <div className="animate-in fade-in duration-1000 flex-1 flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                  <HistoryIcon className="w-10 h-10 text-blue-500" />
                  <h2 className="text-4xl font-black">历史审判</h2>
                </div>
                
                <div className="bg-slate-950/60 p-8 rounded-3xl border border-slate-800 mb-8 flex-1 overflow-y-auto max-h-[400px]">
                   <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-lg italic font-serif">
                      {state.aiAnalysis.split('\n').map((p, i) => <p key={i} className="mb-4">{p}</p>)}
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                      <h4 className="text-xs font-black uppercase text-slate-500 mb-4 tracking-widest">执政轨迹</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {state.history.map((h, i) => (
                          <div key={i} className="text-sm flex gap-3 border-l-2 border-slate-800 pl-4 py-1">
                            <span className="font-mono text-blue-500 font-bold shrink-0">YR {h.year}</span>
                            <span className="text-slate-400">{h.text}</span>
                          </div>
                        ))}
                      </div>
                   </div>
                   <button onClick={reset} className="bg-blue-600 hover:bg-blue-500 p-6 rounded-2xl font-black text-2xl transition-all flex items-center justify-center gap-4 shadow-xl shadow-blue-900/20">
                      开启新纪元 <RotateCcw className="w-6 h-6" />
                   </button>
                </div>
             </div>
          )}

          {state.phase === GamePhase.FAILED && (
             <div className="animate-in zoom-in duration-500 flex-1 flex flex-col justify-center items-center text-center">
                <div className="bg-red-600/10 p-10 rounded-full border border-red-600/20 mb-10">
                  <AlertTriangle className="w-24 h-24 text-red-600" />
                </div>
                <h2 className="text-6xl font-black text-red-500 mb-6 tracking-tighter">文明终焉</h2>
                <p className="text-slate-400 text-xl mb-12 max-w-lg leading-relaxed">
                  你的决策未能维持脆弱的平衡。国家意志在内部动荡与外部压力的夹击下彻底崩溃。
                  这段历史将成为后世文明的警示录。
                </p>
                <button onClick={reset} className="px-12 py-5 bg-white text-slate-950 hover:bg-slate-200 rounded-2xl font-black text-xl transition-all">
                  从废墟中重建
                </button>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

const MetricBar: React.FC<{ label: string; value: number; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
  <div>
    <div className="flex justify-between items-center text-[10px] mb-1.5 px-1 font-bold">
      <div className="flex items-center gap-1.5 text-slate-400 uppercase tracking-tighter">
        {icon}
        {label}
      </div>
      <span className="font-mono text-slate-400">{value}</span>
    </div>
    <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/30 shadow-inner">
      <div 
        className={`h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)] ${color} ${value < 30 ? 'animate-pulse' : ''}`} 
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  </div>
);

export default App;
