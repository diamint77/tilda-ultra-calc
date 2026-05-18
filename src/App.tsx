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
  Lock,
  ArrowRight
} from 'lucide-react';

// --- Types & Interfaces ---

type ServiceType = 'cut' | 'trim' | 'stump' | 'complex';

interface CalcData {
  service: ServiceType | null;
  height: number;
  diameter: number;
  hardAccess: boolean;
  branchesDown: boolean;
  nearWires: boolean;
  location: string;
}

// --- Constants (Based on sites analysis) ---

const PRICES = {
  cut: { base: 1500, perMeter: 350, perCm: 55 },
  trim: { base: 2000, perTree: 450 },
  stump: { base: 1200, perCm: 60 },
  complex: { base: 12000, discount: 0.15 }
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
    <div className="w-full px-6 pt-6">
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-green-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
      <div className="mt-2 flex justify-between items-center text-xs text-gray-500 font-medium">
        <span>Шаг {step} из 4</span>
        <span>{Math.round(progress)}% завершено</span>
      </div>
    </div>
  );
};

const IvanAssistant = ({ text }: { text: string }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 left-4 md:left-auto md:right-8 md:w-80 bg-white shadow-2xl rounded-2xl p-4 flex items-start gap-4 border border-green-100 z-50"
    >
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0 text-2xl">
        🧔
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-800 leading-snug">{text}</p>
        <div className="mt-1 flex items-center gap-1 text-[10px] text-green-600 font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse" />
          Иван на связи
        </div>
      </div>
    </motion.div>
  );
};

// --- Main App Component ---

export default function App() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<CalcData>({
    service: null,
    height: 5,
    diameter: 25,
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
    
    if (data.service === 'cut' || data.service === 'trim') {
      total += data.height * PRICES.cut.perMeter;
      total += data.diameter * PRICES.cut.perCm;
      if (data.hardAccess) total *= 1.2;
      if (data.nearWires) total *= 1.25;
      if (data.branchesDown) total *= 1.15;
    }
    
    if (data.service === 'stump') {
      total += data.diameter * PRICES.stump.perCm;
    }
    
    if (data.service === 'complex') {
      total *= (1 - PRICES.complex.discount);
    }
    
    return Math.round(total / 50) * 50; // Round to nearest 50
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
                <div className="space-y-2 text-center">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Какую задачу решим?</h1>
                  <p className="text-gray-500 text-sm">Выберите основной вид работ на участке</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'cut', title: 'Спилить дерево', desc: 'Удаление полностью', icon: <TreeDeciduous className="w-6 h-6 text-green-600" /> },
                    { id: 'trim', title: 'Обрезать крону', desc: 'Придать форму', icon: <Scissors className="w-6 h-6 text-blue-600" /> },
                    { id: 'stump', title: 'Удалить пень', desc: 'Фрезеровка в щепу', icon: <Trash2 className="w-6 h-6 text-orange-600" /> },
                    { id: 'complex', title: 'Все сразу', desc: 'Скидка 15%', icon: <Sparkles className="w-6 h-6 text-purple-600" /> }
                  ].map((s) => (
                    <button 
                      key={s.id}
                      onClick={() => handleServiceSelect(s.id as ServiceType)}
                      className={`relative flex flex-col items-center p-5 rounded-2xl border-2 transition-all duration-300 text-center group ${
                        data.service === s.id 
                          ? 'border-green-500 bg-green-50 shadow-md' 
                          : 'border-gray-100 hover:border-green-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`mb-3 p-3 rounded-xl transition-colors ${data.service === s.id ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
                        {s.icon}
                      </div>
                      <span className="font-bold text-gray-800">{s.title}</span>
                      <span className="text-xs text-gray-500 mt-1">{s.desc}</span>
                      {data.service === s.id && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500 fill-white" />
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
                className="space-y-8"
              >
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-extrabold">Уточним размеры</h2>
                  <p className="text-gray-500 text-sm">Эти детали влияют на сложность и время работ</p>
                </div>

                <div className="space-y-8">
                  {/* Tree Visualization Simulation */}
                  <div className="bg-gradient-to-b from-sky-50 to-emerald-50 rounded-3xl h-32 flex items-end justify-center p-4 relative overflow-hidden">
                    <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold border border-white">
                      {data.service === 'cut' ? 'Визуализация спила' : 'Визуализация пня'}
                    </div>
                    <motion.div 
                      animate={{ scale: 0.8 + (data.height / 30) }}
                      className="flex flex-col items-center transition-transform"
                    >
                      <div className="w-1 bg-amber-800 h-12" />
                      <div className="w-16 h-16 bg-green-600 rounded-full -mb-2" />
                    </motion.div>
                  </div>

                  {/* Range Sliders */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm font-bold">
                        <label>Высота дерева</label>
                        <span className="text-green-600 bg-green-50 px-3 py-1 rounded-lg border border-green-100">{data.height} м</span>
                      </div>
                      <input 
                        type="range" min="2" max="30" step="1"
                        value={data.height}
                        onChange={(e) => setData(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        <span>2м</span>
                        <span>15м</span>
                        <span>30м</span>
                      </div>
                    </div>

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
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'hardAccess', label: 'Сложный доступ', desc: 'Рядом забор или постройки (+20%)', icon: <Lock className="w-4 h-4" /> },
                      { id: 'nearWires', label: 'Рядом провода', desc: 'Линии ЛЭП под напряжением (+25%)', icon: <Maximize2 className="w-4 h-4" /> },
                      { id: 'branchesDown', label: 'Аккуратный спуск', desc: 'Подвешивание каждой ветки (+15%)', icon: <Clock className="w-4 h-4" /> }
                    ].map(opt => (
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
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-[32px] p-8 border border-green-100 text-center relative overflow-hidden shadow-sm">
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

                <div className="space-y-4">
                  <div className="bg-white border-2 border-gray-100 rounded-3xl p-6 space-y-4 focus-within:border-green-500 transition-colors shadow-sm">
                    <h3 className="font-extrabold text-sm flex items-center gap-2">
                       📞 <span className="uppercase tracking-widest text-[10px] text-gray-500">Связаться с мастером</span>
                    </h3>
                    <input 
                      type="tel" 
                      placeholder="+7 (___) ___-__-__" 
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-xl font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                    />
                    <button className="w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-green-200 group active:scale-95">
                      Вызвать замерщика <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <div className="flex justify-center gap-4 text-xs text-gray-400 font-medium">
                       <span>Или через:</span>
                       <a href="#" className="flex items-center gap-1 text-green-600 hover:underline font-bold">
                         <MessageSquare className="w-3 h-3" /> WhatsApp
                       </a>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 text-center">
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
        </main>

      </div>

      <IvanAssistant text={ivanText} />

    </div>
  );
}
