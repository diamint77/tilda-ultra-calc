/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TreeDeciduous, 
  Scissors, 
  Trash2, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  MessageSquare, 
  Clock,
  Maximize2,
  Lock
} from 'lucide-react';

// --- Types & Interfaces ---

type ServiceType = 'cut' | 'trim' | 'stump' | 'complex';

interface CalcData {
  service: ServiceType | null;
  height: number;
  diameter: number;
  branches: number;
  count: number;
  treeType: string;
  hardAccess: boolean;
  branchesDown: boolean;
  nearWires: boolean;
  location: string;
}

// --- Constants ---

const TREE_TYPES = [
  { id: 'soft', label: 'Хвойные/Мягкие', species: 'Сосна, Ель, Липа, Пополь', coeff: 1.0, icon: '🌲' },
  { id: 'medium', label: 'Лиственные', species: 'Береза, Ольха, Яблоня', coeff: 1.2, icon: '🌳' },
  { id: 'hard', label: 'Твердые породы', species: 'Дуб, Вяз, Ясень, Клен', coeff: 1.5, icon: '🍁' }
];

const PRICES = {
  cut: { base: 1000, perMeter: 280, perCm: 48 },
  trim: { base: 1500, perMeter: 180, perBranch: 380 },
  stump: { base: 800, perCm: 45 },
  complex: { base: 10000, discount: 0.20 }
};

const IVAN_HINTS: Record<string, string[]> = {
  welcome: ["Привет! Я Иван, эксперт по деревьям. Сейчас все посчитаем!", "Добрый день! Давайте прикинем стоимость работ за минуту."],
  service_selected: {
    cut: ["Спил — задача серьезная. Мы используем спецснаряжение.", "Аккуратная валка сохранит ваш газон в целости."],
    trim: ["Правильная обрезка продлевает жизнь дереву на десятки лет.", "Сделаем крону красивой и безопасной."],
    stump: ["Удаляем пни дробилкой — быстро и без ям.", "Корчевание пней освободит место под новый газон."],
    complex: ["Комплекс — самый выгодный вариант, экономия до 15%!", "Всё сразу: спилим, измельчим и вывезем."]
  } as any,
  parameters: ["Чем точнее параметры, тем точнее цена. Но не переживайте, замерщик все подтвердит.", "Сложные условия (забор, провода) требуют больше времени, но мы справимся."],
  result: ["Отличный расчет! Предварительная смета готова.", "Цена ориентировочная! Оставьте заявку для точного расчета."]
};

// --- Helper Components ---

const ProgressBar = ({ step }: { step: number }) => {
  const progress = (step / 4) * 100;
  return (
    <div className="w-full px-6 pt-4">
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-green-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

const IvanBubble = ({ text, className = "" }: { text: string; className?: string }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    key={text}
    className={`bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-sm border border-green-100 flex items-center gap-3 ${className}`}
  >
    <div className="text-xl shrink-0">🧔</div>
    <p className="text-[11px] leading-tight text-gray-700 font-medium">{text}</p>
  </motion.div>
);

const TreeVisualization = ({ data }: { data: CalcData }) => {
  const isStump = data.service === 'stump';
  const isTrim = data.service === 'trim';
  const isCut = data.service === 'cut';
  const isComplex = data.service === 'complex';

  // Base dimensions relative to data
  const trunkBaseHeight = 110; 
  const visualHeight = 10 + (data.height * 2.5); 
  const visualDiameter = 3 + (data.diameter / 12);
  const trunkWidth = visualDiameter / 1.2;
  
  // Dynamic branches
  const branchesCount = Math.min(data.branches, 24);

  return (
    <div className="relative w-56 h-full flex items-end justify-center overflow-visible">
      <svg viewBox="0 0 100 120" className="w-full h-full overflow-visible drop-shadow-xl">
        <defs>
          <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b1d0a" />
            <stop offset="50%" stopColor="#5d2f11" />
            <stop offset="100%" stopColor="#3b1d0a" />
          </linearGradient>
        </defs>

        {/* Shadow on ground */}
        <ellipse cx="50" cy={trunkBaseHeight} rx={15 + trunkWidth} ry="3" fill="rgba(0,0,0,0.12)" />
        
        {isStump ? (
          /* Realistic Stump */
          <motion.g
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {/* Trunk roots/base */}
            <motion.path
              animate={{
                d: `M ${50 - trunkWidth*1.5} ${trunkBaseHeight} 
                    Q ${50 - trunkWidth} ${trunkBaseHeight - 4}, 50 ${trunkBaseHeight - 2}
                    Q ${50 + trunkWidth} ${trunkBaseHeight - 4}, ${50 + trunkWidth*1.5} ${trunkBaseHeight}
                    L ${50 + trunkWidth} ${trunkBaseHeight - 12}
                    Q 50 ${trunkBaseHeight - 15} ${50 - trunkWidth} ${trunkBaseHeight - 12} Z`
              }}
              fill="url(#trunkGrad)"
            />
            {/* Wood top surface */}
            <motion.ellipse 
              animate={{ 
                cx: 50, 
                cy: trunkBaseHeight - 13.5, 
                rx: trunkWidth, 
                ry: 3 
              }}
              fill="#c27a3f"
              stroke="#78350f"
              strokeWidth="0.5"
            />
            {/* Rings */}
            <motion.ellipse 
              animate={{ 
                cx: 50, 
                cy: trunkBaseHeight - 13.5, 
                rx: trunkWidth * 0.7, 
                ry: 2 
              }}
              fill="none"
              stroke="#92400e"
              strokeWidth="0.2"
              opacity="0.5"
            />
            <motion.ellipse 
              animate={{ 
                cx: 50, 
                cy: trunkBaseHeight - 13.5, 
                rx: trunkWidth * 0.4, 
                ry: 1 
              }}
              fill="none"
              stroke="#92400e"
              strokeWidth="0.2"
              opacity="0.5"
            />
          </motion.g>
        ) : (
          <g>
            {/* Tree Trunk with organic taper */}
            <motion.path
              initial={false}
              animate={{
                d: `M ${50 - trunkWidth*1.4} ${trunkBaseHeight} 
                    C ${50 - trunkWidth*1.2} ${trunkBaseHeight - 5}, ${50 - trunkWidth*0.5} ${trunkBaseHeight - visualHeight/2}, ${50 - trunkWidth*0.3} ${trunkBaseHeight - visualHeight}
                    L ${50 + trunkWidth*0.3} ${trunkBaseHeight - visualHeight}
                    C ${50 + trunkWidth*0.5} ${trunkBaseHeight - visualHeight/2}, ${50 + trunkWidth*1.2} ${trunkBaseHeight - 5}, ${50 + trunkWidth*1.4} ${trunkBaseHeight} Z`
              }}
              fill="url(#trunkGrad)"
            />

            {/* Dynamic Branches Layer */}
            <AnimatePresence>
              {Array.from({ length: branchesCount }).map((_, i) => {
                const side = i % 2 === 0 ? 1 : -1;
                const seed = Math.sin(i * 12345); // deterministic randomness
                const verticalPos = 0.25 + (i / branchesCount) * 0.65;
                const branchY = trunkBaseHeight - (visualHeight * verticalPos);
                const branchLen = 6 + (data.diameter / 18) + (seed * 4) + (i * 0.2);
                const angle = 15 + (seed * 10);
                
                return (
                  <motion.g 
                    key={`branch-${i}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Branch Wood */}
                    <motion.path
                      d={`M 50 ${branchY} Q ${50 + (side * branchLen * 0.6)} ${branchY - angle/2}, ${50 + (side * branchLen)} ${branchY - angle}`}
                      stroke="#3b1d0a"
                      strokeWidth={1.2 - (verticalPos * 0.8)}
                      fill="none"
                      strokeLinecap="round"
                    />
                    {/* Leaves / Crown clusters */}
                    <motion.circle 
                      animate={{ 
                        cx: 50 + (side * branchLen), 
                        cy: branchY - angle, 
                        r: 4 + (seed * 2) + (data.diameter/40),
                        fill: isTrim ? "#4ade80" : "#166534" 
                      }}
                      opacity={isTrim ? 0.7 : 0.9}
                    />
                    <motion.circle 
                      animate={{ 
                        cx: 50 + (side * branchLen) + (side * 2), 
                        cy: branchY - angle - 2, 
                        r: 3 + (seed * 2) + (data.diameter/50),
                        fill: isTrim ? "#86efac" : "#15803d" 
                      }}
                      opacity={isTrim ? 0.5 : 0.8}
                    />
                    
                    {/* Visual Cut Indicators for trimming */}
                    {isTrim && (
                      <text x={50 + (side * branchLen * 0.7)} y={branchY - angle/2 - 2} fontSize="3.5">✂️</text>
                    )}
                  </motion.g>
                );
              })}
            </AnimatePresence>

            {/* Tree Top Crown */}
            <motion.circle
              animate={{ 
                cx: 50, 
                cy: trunkBaseHeight - visualHeight, 
                r: 8 + (data.diameter / 15),
                fill: isTrim ? "#22c55e" : "#14532d"
              }}
            />
            
            {/* Major Cut Line for complete removal */}
            {(isCut || isComplex) && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <line 
                  x1={50 - trunkWidth*2} y1={trunkBaseHeight - 8} 
                  x2={50 + trunkWidth*2} y2={trunkBaseHeight - 8} 
                  stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,2" 
                />
                <motion.text 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  x={50 + trunkWidth*2 + 2} y={trunkBaseHeight - 6} fontSize="4" fill="#ef4444" fontWeight="black"
                >
                  REVAL
                </motion.text>
              </motion.g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
};

export default function App() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<CalcData>({
    service: null,
    height: 5,
    diameter: 25,
    branches: 5,
    count: 1,
    treeType: 'soft',
    hardAccess: false,
    branchesDown: false,
    nearWires: false,
    location: 'spb'
  });
  const [ivanText, setIvanText] = useState(IVAN_HINTS.welcome[0]);

  const updateIvan = (type: keyof typeof IVAN_HINTS, key?: string) => {
    if (key && IVAN_HINTS[type] && !Array.isArray(IVAN_HINTS[type]) && (IVAN_HINTS[type] as any)[key]) {
      const options = (IVAN_HINTS[type] as any)[key];
      setIvanText(options[Math.floor(Math.random() * options.length)]);
    } else if (IVAN_HINTS[type]) {
      const options = IVAN_HINTS[type] as string[];
      setIvanText(options[Math.floor(Math.random() * options.length)]);
    }
  };

  const finalPrice = useMemo(() => {
    if (!data.service) return 0;
    
    let total = PRICES[data.service].base;
    let workCost = 0;
    
    // Add work-specific costs
    if (data.service === 'cut' || data.service === 'complex') {
      workCost += data.height * PRICES.cut.perMeter;
      workCost += data.diameter * PRICES.cut.perCm;
    }
    
    if (data.service === 'trim' || data.service === 'complex') {
      workCost += data.height * PRICES.trim.perMeter;
      workCost += data.branches * PRICES.trim.perBranch;
    }
    
    if (data.service === 'stump' || data.service === 'complex') {
      workCost += data.diameter * PRICES.stump.perCm;
    }

    // Apply wood hardness coefficient
    const woodCoeff = TREE_TYPES.find(t => t.id === data.treeType)?.coeff || 1.0;
    workCost *= woodCoeff;
    
    total += workCost;

    // Multiply by count
    total *= data.count;
    
    // Modifiers only for high-altitude/complex works (applied per tree)
    if (data.service === 'cut' || data.service === 'trim' || data.service === 'complex') {
      let multiplier = 1;
      if (data.hardAccess) multiplier += 0.2;
      if (data.nearWires) multiplier += 0.25;
      if (data.branchesDown) multiplier += 0.15;
      total *= multiplier;
    }
    
    if (data.service === 'complex') {
      total *= (1 - PRICES.complex.discount);
    }
    
    return Math.round(total / 50) * 50;
  }, [data]);

  const handleNext = () => {
    if (step === 1 && !data.service) {
      setIvanText("Сначала выберите услугу, чтобы я знал, что считать! 😊");
      return;
    }
    const nextStep = step + 1;
    setStep(nextStep);
    
    if (nextStep === 2) updateIvan('parameters');
    if (nextStep === 4) updateIvan('result');
  };

  const handleServiceSelect = (s: ServiceType) => {
    setData(prev => ({ ...prev, service: s }));
    updateIvan('service_selected', s);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-gray-900 pb-24 md:pb-8 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100">
        
        <ProgressBar step={step} />

        <main className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Service Selection */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-center">
                  <IvanBubble text={ivanText} className="max-w-[280px]" />
                </div>
                
                <div className="space-y-2 text-center pt-2">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Что будем делать?</h1>
                  <p className="text-gray-500 text-sm">Выберите основной вид работ</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'cut', title: 'Спилить дерево', desc: 'Удаление полностью', icon: <TreeDeciduous className="w-6 h-6 text-green-600" /> },
                    { id: 'trim', title: 'Обрезать крону', desc: 'Придать форму', icon: <Scissors className="w-6 h-6 text-blue-600" /> },
                    { id: 'stump', title: 'Удалить пень', desc: 'Фрезеровка в щепу', icon: <Trash2 className="w-6 h-6 text-orange-600" /> },
                    { id: 'complex', title: 'Все сразу', desc: 'Скидка 15%', icon: <Sparkles className="w-6 h-6 text-purple-600" />, badge: '-15%' }
                  ].map((s) => (
                    <button 
                      key={s.id}
                      onClick={() => handleServiceSelect(s.id as ServiceType)}
                      className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 text-center group ${
                        data.service === s.id 
                          ? 'border-green-500 bg-green-50 shadow-md' 
                          : 'border-gray-100 hover:border-green-200 hover:bg-gray-50'
                      }`}
                    >
                      {s.badge && (
                        <div className="absolute -top-2 -right-1 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-bounce">
                          {s.badge}
                        </div>
                      )}
                      <div className={`mb-2 p-2 rounded-xl transition-colors ${data.service === s.id ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
                        {s.icon}
                      </div>
                      <span className="font-bold text-sm text-gray-800">{s.title}</span>
                      <span className="text-[10px] text-gray-500 mt-0.5">{s.desc}</span>
                      {data.service === s.id && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 fill-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={handleNext}
                  className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-green-200"
                >
                  Далее <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* Step 2: Parameters */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex justify-center">
                  <IvanBubble text={ivanText} className="max-w-[280px]" />
                </div>

                <div className="space-y-1 text-center">
                  <h2 className="text-xl font-extrabold tracking-tight">Уточним размеры</h2>
                  <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Параметры влияют на стоимость</p>
                </div>

                <div className="space-y-6">
                  {/* Wood Type Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-widest text-[10px]">Порода дерева</label>
                    <div className="grid grid-cols-3 gap-2">
                       {TREE_TYPES.map(type => (
                         <button
                           key={type.id}
                           onClick={() => setData(prev => ({ ...prev, treeType: type.id }))}
                           className={`p-3 rounded-2xl border-2 transition-all text-left ${
                             data.treeType === type.id 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-100 bg-white hover:border-gray-200'
                           }`}
                         >
                           <div className="text-xl mb-1">{type.icon}</div>
                           <div className="text-[10px] font-black leading-tight uppercase mb-1">{type.label}</div>
                           <div className="text-[9px] text-gray-400 leading-tight">{type.species}</div>
                         </button>
                       ))}
                    </div>
                  </div>

                  {/* Tree Visualization with integrated Ivan */}
                  <div className="bg-gradient-to-b from-sky-50 to-emerald-50 rounded-[28px] h-32 flex items-end justify-center p-2 relative overflow-hidden border border-sky-100 shadow-inner">
                    <TreeVisualization data={data} />
                    {data.count > 1 && (
                      <div className="absolute top-2 left-2 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-black text-green-700 border border-green-100 shadow-sm animate-pulse">
                         x {data.count}
                      </div>
                    )}
                  </div>

                  {/* Range Sliders Compact */}
                  <div className="space-y-4">
                    {/* Count (New) */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm font-bold">
                        <label>{data.service === 'stump' ? 'Количество пней' : 'Количество деревьев'}</label>
                        <span className="text-green-600 bg-green-50 px-3 py-1 rounded-lg border border-green-100">{data.count} шт</span>
                      </div>
                      <input 
                        type="range" min="1" max="20" step="1"
                        value={data.count}
                        onChange={(e) => setData(prev => ({ ...prev, count: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        <span>1 шт</span>
                        <span>10 шт</span>
                        <span>20 шт</span>
                      </div>
                    </div>

                    {/* Height (for cut and trim) */}
                    {(data.service === 'cut' || data.service === 'trim' || data.service === 'complex') && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <label>Высота дерева</label>
                          <span className="text-green-600 bg-green-50 px-3 py-1 rounded-lg border border-green-100">{data.height} м</span>
                        </div>
                        <input 
                          type="range" min="2" max="40" step="1"
                          value={data.height}
                          onChange={(e) => setData(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          <span>2 м</span>
                          <span>20 м</span>
                          <span>40 м</span>
                        </div>
                      </div>
                    )}

                    {/* Diameter (for cut and stump) */}
                    {(data.service === 'cut' || data.service === 'stump' || data.service === 'complex') && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <label>Диаметр ствола</label>
                          <span className="text-green-600 bg-green-50 px-3 py-1 rounded-lg border border-green-100">{data.diameter} см</span>
                        </div>
                        <input 
                          type="range" min="10" max="150" step="5"
                          value={data.diameter}
                          onChange={(e) => setData(prev => ({ ...prev, diameter: parseInt(e.target.value) }))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          <span>10см</span>
                          <span>80см</span>
                          <span>150см</span>
                        </div>
                      </div>
                    )}

                    {/* Branches (ONLY for trim) */}
                    {(data.service === 'trim' || data.service === 'complex') && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <label>Количество веток (срезов)</label>
                          <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">{data.branches} шт</span>
                        </div>
                        <input 
                          type="range" min="1" max="50" step="1"
                          value={data.branches}
                          onChange={(e) => setData(prev => ({ ...prev, branches: parseInt(e.target.value) }))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          <span>1 шт</span>
                          <span>25 шт</span>
                          <span>50 шт</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'hardAccess', label: 'Сложный доступ', desc: 'Рядом забор или постройки (+20%)', icon: <Lock className="w-4 h-4" /> },
                      { id: 'nearWires', label: 'Рядом провода', desc: 'Линии ЛЭП под напряжением (+25%)', icon: <Maximize2 className="w-4 h-4" /> },
                      { id: 'branchesDown', label: 'Аккуратный спуск', desc: 'Подвешивание каждой ветки (+15%)', icon: <Clock className="w-4 h-4" />, hideFor: ['stump'] }
                    ].filter(opt => !opt.hideFor?.includes(data.service as string)).map(opt => (
                      <label 
                        key={opt.id}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                          data[opt.id as keyof CalcData] ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={!!data[opt.id as keyof CalcData]} 
                          onChange={() => setData(prev => ({ ...prev, [opt.id]: !prev[opt.id as keyof CalcData] }))}
                          className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                             {opt.icon} {opt.label}
                          </div>
                          <p className="text-xs text-gray-500">{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="p-4 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all">
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                  </button>
                  <button onClick={handleNext} className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-green-100">
                    Рассчитать
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Calculation & Details (Simplified Transition to Step 4) */}
            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="space-y-6 py-8 flex flex-col items-center justify-center text-center"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mb-4 animate-bounce">
                  ✨
                </div>
                <h2 className="text-2xl font-black">Иван анализирует...</h2>
                <p className="text-gray-500 max-w-xs">Подбираем лучшую бригаду под ваши параметры и считаем спецпредложение.</p>
                
                <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden mt-4">
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="w-1/2 h-full bg-green-500 rounded-full"
                  />
                </div>

                <div className="hidden">{setTimeout(() => setStep(4), 2500)}</div>
              </motion.div>
            )}

            {/* Step 4: Final Offer */}
            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-center -mb-2">
                   <IvanBubble text={ivanText} className="max-w-[300px]" />
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-[32px] p-6 border border-green-100 text-center relative overflow-hidden shadow-sm">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-200/20 rounded-full blur-3xl" />
                  
                  <span className="text-sm font-bold text-green-700 bg-white px-4 py-1.5 rounded-full border border-green-200 mb-6 inline-block">
                    Предварительная смета
                  </span>

                  <div className="space-y-1">
                    <span className="text-gray-500 text-sm font-medium">Ориентировочная стоимость</span>
                    <div className="text-5xl md:text-6xl font-black text-green-900 tracking-tight">
                      {finalPrice.toLocaleString('ru-RU')} <span className="text-2xl font-bold opacity-50">₽</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-2">
                       * Точная цена после осмотра фото или выезда
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 text-center mt-4">
                   <button 
                    onClick={() => setStep(1)}
                    className="text-gray-400 hover:text-green-600 text-sm font-bold transition-colors underline underline-offset-4 decoration-dotted"
                  >
                    Изменить параметры расчета
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Persistent Footer: Consultation & Legal */}
          <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 group active:scale-[0.98]">
              <MessageSquare className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Связаться / Консультация
            </button>
            
            <div className="space-y-1 text-center px-4">
              <p className="text-[9px] leading-tight text-gray-400 uppercase tracking-widest font-bold opacity-70">
                * Данный расчет является предварительным и не является публичной офертой (ст. 437 ГК РФ).
              </p>
              <p className="text-[9px] leading-tight text-gray-400 uppercase tracking-widest font-bold opacity-70">
                Точная стоимость работ фиксируется в договоре после оценки специалистом (по фото/видео или при выезде на объект).
              </p>
            </div>
          </div>

        </main>

      </div>

    </div>
  );
}
