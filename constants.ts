
import { PolicyCard, CrisisEvent, Metrics } from './types';

export const INITIAL_METRICS: Metrics = {
  development: 40,
  security: 40,
  stability: 50,
  autonomy: 30,
};

export const POLICIES: PolicyCard[] = [
  {
    id: 'p1', title: '激进货币政策', tag: '经济', cost: 10,
    description: '通过量化宽松刺激增长，但可能拉大贫富差距。',
    impact: (m) => ({ ...m, development: m.development + 15, stability: m.stability - 10 })
  },
  {
    id: 'p2', title: '深海核潜艇群', tag: '军事', cost: 40,
    description: '打造二次打击能力，极大提升安全，但耗资巨大。',
    impact: (m) => ({ ...m, security: m.security + 25, development: m.development - 5 })
  },
  {
    id: 'p3', title: '全民社保升级', tag: '民生', cost: 30,
    description: '完善社会保障体系，提升凝聚力，但会减缓工业扩张。',
    impact: (m) => ({ ...m, stability: m.stability + 20, development: m.development - 5 })
  },
  {
    id: 'p4', title: '开源架构自主化', tag: '科研', cost: 25,
    description: '摆脱对他国底层的依赖，提升主权，短期见效慢。',
    impact: (m) => ({ ...m, autonomy: m.autonomy + 20, security: m.security + 5 })
  },
  {
    id: 'p5', title: '吸引外资优惠', tag: '经济', cost: 5,
    description: '快速获得资本，但会略微削弱技术自主权。',
    impact: (m) => ({ ...m, development: m.development + 10, autonomy: m.autonomy - 5 })
  },
  {
    id: 'p6', title: '边境雷达组网', tag: '军事', cost: 15,
    description: '低成本提升防御预警能力。',
    impact: (m) => ({ ...m, security: m.security + 10 })
  },
  {
    id: 'p7', title: '反垄断重拳', tag: '民生', cost: 10,
    description: '打击资本扩张，提升社会公平。',
    impact: (m) => ({ ...m, stability: m.stability + 15, development: m.development - 5 })
  },
  {
    id: 'p8', title: '星链式卫星系统', tag: '科研', cost: 50,
    description: '争夺制天权，全面提升自主与安全。',
    impact: (m) => ({ ...m, autonomy: m.autonomy + 25, security: m.security + 10 })
  }
];

export const CRISES: CrisisEvent[] = [
  {
    id: 'c1', title: '【芯片架构禁运】', severity: 1,
    description: '外部突然切断了新一代指令集授权。',
    check: (m) => m.autonomy > 45,
    onSuccess: (m) => ({ ...m, autonomy: m.autonomy + 5 }),
    onFail: (m) => ({ ...m, development: m.development - 20, stability: m.stability - 5 }),
    successMessage: '由于已实现底层自主，禁运反而加速了国产替代。',
    failMessage: '研发线全线停摆，大量企业倒闭。'
  },
  {
    id: 'c2', title: '【边境代理人战争】', severity: 1,
    description: '邻国爆发动乱，背后有大国博弈的影子。',
    check: (m) => m.security > 55,
    onSuccess: (m) => ({ ...m, security: m.security + 5 }),
    onFail: (m) => ({ ...m, stability: m.stability - 15, security: m.security - 10 }),
    successMessage: '强大的军事威慑让冲突止步于边境线外。',
    failMessage: '冲突外溢导致难民涌入，国防开支剧增。'
  },
  {
    id: 'c3', title: '【数字货币冲击】', severity: 2,
    description: '一种不受控的加密资产正在侵蚀金融主权。',
    check: (m) => m.stability > 60 && m.development > 50,
    onSuccess: (m) => ({ ...m, development: m.development + 5 }),
    onFail: (m) => ({ ...m, stability: m.stability - 20, development: m.development - 10 }),
    successMessage: '稳健的金融体系和高社会信任度抵御了投机风潮。',
    failMessage: '资金大规模外流，民众存款严重缩水引发不满。'
  }
];
