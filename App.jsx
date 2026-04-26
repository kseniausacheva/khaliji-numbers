import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Volume2, VolumeX, Users, ChevronLeft, ChevronRight, ArrowRight,
  BookOpen, Zap, HelpCircle, Check, X, RotateCcw, Trophy, Star,
  Sparkles, ThumbsUp, Hash, CheckCircle2, XCircle
} from 'lucide-react';

// =============================================================
// ДАННЫЕ: цифры и числа на халиджи (заливный диалект)
// Транскрипция — только кириллицей, без танвина
// =============================================================

// Восточно-арабские цифры (используются в халиджи как и в Египте)
const EASTERN_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
const toEastern = (n) => String(n).split('').map(c => /\d/.test(c) ? EASTERN_DIGITS[+c] : c).join('');

// Единицы 0–10
const UNITS = [
  { n: 0,  ar: 'صِفر',     tr: 'сыфр' },
  { n: 1,  ar: 'واحِد',    tr: 'вахид' },
  { n: 2,  ar: 'اِثنين',   tr: 'иснейн' },
  { n: 3,  ar: 'ثَلاثة',   tr: 'саляса' },
  { n: 4,  ar: 'أَربَعة',  tr: 'арбаа' },
  { n: 5,  ar: 'خَمسة',    tr: 'хамса' },
  { n: 6,  ar: 'سِتّة',    tr: 'ситта' },
  { n: 7,  ar: 'سَبعة',    tr: 'сабаа' },
  { n: 8,  ar: 'ثَمانية',  tr: 'самания' },
  { n: 9,  ar: 'تِسعة',    tr: 'тисаа' },
  { n: 10, ar: 'عَشَرة',   tr: 'ашара' },
];

// 11–19 (окончание -таашар в халиджи)
const TEENS = [
  { n: 11, ar: 'اِحدَعَش',   tr: 'идаъаш' },
  { n: 12, ar: 'اِثنَعَش',   tr: 'иснаъаш' },
  { n: 13, ar: 'ثَلاثطَعَش', tr: 'саляттаъаш' },
  { n: 14, ar: 'أَربَعطَعَش', tr: 'арбаътаъаш' },
  { n: 15, ar: 'خَمسطَعَش',  tr: 'хамсатаъаш' },
  { n: 16, ar: 'سِتّطَعَش',  tr: 'ситтаъаш' },
  { n: 17, ar: 'سَبعطَعَش',  tr: 'сабаътаъаш' },
  { n: 18, ar: 'ثَمانطَعَش', tr: 'саманьтаъаш' },
  { n: 19, ar: 'تِسعطَعَش',  tr: 'тисаътаъаш' },
];

// Десятки 20–90
const TENS = [
  { n: 20, ar: 'عِشرين',   tr: 'ишрин' },
  { n: 30, ar: 'ثَلاثين',  tr: 'салясин' },
  { n: 40, ar: 'أَربَعين', tr: 'арбаин' },
  { n: 50, ar: 'خَمسين',   tr: 'хамсин' },
  { n: 60, ar: 'سِتّين',   tr: 'ситтин' },
  { n: 70, ar: 'سَبعين',   tr: 'сабаин' },
  { n: 80, ar: 'ثَمانين',  tr: 'саманин' },
  { n: 90, ar: 'تِسعين',   tr: 'тисаин' },
];

// Составные двузначные (единица + и + десяток)
// В халиджи: واحِد و عِشرين = «вахид у ишрин» (21)
const COMPOUNDS = [
  { n: 21, ar: 'واحِد و عِشرين',  tr: 'вахид у ишрин' },
  { n: 35, ar: 'خَمسة و ثَلاثين', tr: 'хамса у салясин' },
  { n: 47, ar: 'سَبعة و أَربَعين', tr: 'сабаа у арбаин' },
  { n: 58, ar: 'ثَمانية و خَمسين', tr: 'самания у хамсин' },
  { n: 62, ar: 'اِثنين و سِتّين',  tr: 'иснейн у ситтин' },
  { n: 73, ar: 'ثَلاثة و سَبعين',  tr: 'саляса у сабаин' },
  { n: 84, ar: 'أَربَعة و ثَمانين', tr: 'арбаа у саманин' },
  { n: 96, ar: 'سِتّة و تِسعين',   tr: 'ситта у тисаин' },
];

// Сотни
const HUNDREDS = [
  { n: 100, ar: 'مية',        tr: 'мия' },
  { n: 200, ar: 'مِيَتين',    tr: 'миятейн' },
  { n: 300, ar: 'ثَلاثمية',   tr: 'салясмия' },
  { n: 400, ar: 'أَربَعمية',  tr: 'арбаамия' },
  { n: 500, ar: 'خَمسمية',    tr: 'хамсамия' },
  { n: 600, ar: 'سِتّمية',    tr: 'ситтмия' },
  { n: 700, ar: 'سَبعمية',    tr: 'сабаамия' },
  { n: 800, ar: 'ثَمانمية',   tr: 'саманмия' },
  { n: 900, ar: 'تِسعمية',    tr: 'тисаамия' },
];

// Трёхзначные (сотня + и + двузначное)
const THREE_DIGIT = [
  { n: 105, ar: 'مية و خَمسة',           tr: 'мия у хамса' },
  { n: 250, ar: 'مِيَتين و خَمسين',       tr: 'миятейн у хамсин' },
  { n: 366, ar: 'ثَلاثمية و سِتّة و سِتّين', tr: 'салясмия у ситта у ситтин' },
  { n: 480, ar: 'أَربَعمية و ثَمانين',    tr: 'арбаамия у саманин' },
  { n: 575, ar: 'خَمسمية و خَمسة و سَبعين', tr: 'хамсамия у хамса у сабаин' },
  { n: 999, ar: 'تِسعمية و تِسعة و تِسعين', tr: 'тисаамия у тисаа у тисаин' },
];

// Тысячи и миллион
const THOUSANDS = [
  { n: 1000,    ar: 'أَلف',       tr: 'альф' },
  { n: 2000,    ar: 'أَلفين',     tr: 'альфейн' },
  { n: 3000,    ar: 'ثَلاثة آلاف', tr: 'саляса алаф' },
  { n: 5000,    ar: 'خَمسة آلاف',  tr: 'хамса алаф' },
  { n: 10000,   ar: 'عَشَرة آلاف', tr: 'ашара алаф' },
  { n: 100000,  ar: 'مية أَلف',    tr: 'мият альф' },
  { n: 1000000, ar: 'مِليون',      tr: 'мильйон' },
];

const TOPICS = [
  {
    id: 'units',
    title: 'Единицы',
    sub: 'от ٠ до ١٠',
    accent: 'red',
    items: UNITS,
    intro: 'Базовые числа от 0 до 10. Учим первыми — на них строятся все остальные.'
  },
  {
    id: 'teens',
    title: 'От 11 до 19',
    sub: 'окончание -таашар',
    accent: 'blue',
    items: TEENS,
    intro: 'Подростковые числа. Все имеют общее окончание «таашар» — в халиджи оно мягче, чем в фусхе.'
  },
  {
    id: 'tens',
    title: 'Десятки',
    sub: 'от ٢٠ до ٩٠',
    accent: 'cyan',
    items: TENS,
    intro: 'Круглые десятки. Окончание -ин (как в египетском, в отличие от классического -уна).'
  },
  {
    id: 'compounds',
    title: 'Составные двузначные',
    sub: 'единица + десяток: ٤٩, ٣٧, ٦٥',
    accent: 'green',
    items: COMPOUNDS,
    intro: 'Сначала единица, потом «у» (и), потом десяток. 21 = «вахид у ишрин» (один и двадцать).'
  },
  {
    id: 'hundreds',
    title: 'Сотни',
    sub: 'от ١٠٠ до ٩٠٠',
    accent: 'amber',
    items: HUNDREDS,
    intro: 'Круглые сотни. В халиджи мия чаще произносится как «мия», без танвинного окончания.'
  },
  {
    id: 'three',
    title: 'Трёхзначные числа',
    sub: 'как сказать ٣٦٦ или ٤٨٠',
    accent: 'purple',
    items: THREE_DIGIT,
    intro: 'Сотня + «у» + единицы и десятки. Порядок: справа налево по разрядам.'
  },
  {
    id: 'thousands',
    title: 'Тысячи и миллион',
    sub: 'альф, альфейн, алаф, мильйон',
    accent: 'indigo',
    items: THOUSANDS,
    intro: 'Альф — тысяча. Альфейн — две тысячи (двойственное число). От 3 до 10 тысяч — алаф.'
  }
];

// =============================================================
// ВСПОМОГАТЕЛЬНЫЕ
// =============================================================

const ACCENT_STYLES = {
  red:    { bg: 'bg-red-50',    text: 'text-red-600',    num: 'text-red-600' },
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   num: 'text-blue-700' },
  cyan:   { bg: 'bg-cyan-50',   text: 'text-cyan-700',   num: 'text-cyan-700' },
  green:  { bg: 'bg-green-50',  text: 'text-green-700',  num: 'text-green-700' },
  amber:  { bg: 'bg-amber-50',  text: 'text-amber-700',  num: 'text-amber-700' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', num: 'text-purple-700' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', num: 'text-indigo-700' },
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Озвучка через Web Speech API
const speak = (text, soundOn) => {
  if (!soundOn) return;
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    // Пробуем найти арабский голос ближе к халиджи (саудовский, эмиратский)
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => /ar-SA|ar-AE|ar-KW|ar-QA|ar-BH/i.test(v.lang))
                   || voices.find(v => /^ar/i.test(v.lang));
    if (preferred) u.voice = preferred;
    u.lang = preferred?.lang || 'ar-SA';
    u.rate = 0.85;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
  } catch (e) {
    // тихо игнорируем
  }
};

// =============================================================
// ОБЩИЕ КОМПОНЕНТЫ
// =============================================================

const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Cairo:wght@400;600;700;800&family=Inter:wght@400;500;600;700;800;900&display=swap');
    .font-arabic { font-family: 'Noto Naskh Arabic', 'Amiri', serif; }
    .font-arabic-ui { font-family: 'Cairo', 'Tajawal', sans-serif; }
    .font-ru { font-family: 'Inter', system-ui, sans-serif; }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
    .animate-shake { animation: shake 0.32s ease-in-out; }

    @keyframes pop {
      0% { transform: scale(1); }
      50% { transform: scale(1.06); }
      100% { transform: scale(1); }
    }
    .animate-pop { animation: pop 0.4s ease-out; }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to   { transform: translateY(0); opacity: 1; }
    }
    .animate-slideUp { animation: slideUp 0.45s ease-out both; }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-fadeIn { animation: fadeIn 0.3s ease-out both; }

    @keyframes confetti-fall {
      0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
      }
    }
  `}</style>
);

const TopBanner = () => (
  <div className="bg-red-600 text-white py-3 px-4 text-center font-ru">
    <div className="text-[11px] sm:text-xs font-bold tracking-wide uppercase leading-tight">
      Тренажёр для запоминания и тренировки<br/>арабских цифр
    </div>
    <div className="text-[11px] sm:text-xs mt-1 font-medium">
      Школа Ксении Усачёвой
      <span className="mx-1.5 opacity-50">·</span>
      <a href="https://talkarabicnow.online" className="underline underline-offset-2">talkarabicnow.online</a>
    </div>
  </div>
);

const Header = ({ soundOn, setSoundOn, showBack, onBack }) => (
  <header className="flex items-center justify-between mb-6 font-ru">
    {showBack ? (
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-slate-600 hover:text-slate-900 active:scale-95 transition px-2 py-1 -ml-2 rounded-lg"
      >
        <ChevronLeft size={20}/>
        <span className="font-semibold">Меню</span>
      </button>
    ) : (
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-red-600 flex items-center justify-center rounded-md text-white font-black text-xs shadow-md shadow-red-600/20">
          ТА
        </div>
        <span className="font-bold text-slate-900">Talk Arabic Now</span>
      </div>
    )}

    <div className="flex items-center gap-1.5">
      <button
        onClick={() => setSoundOn(s => !s)}
        className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition"
        aria-label={soundOn ? 'Выключить звук' : 'Включить звук'}
      >
        {soundOn ? <Volume2 size={16}/> : <VolumeX size={16}/>}
      </button>
      <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
        <Users size={12}/> Для всех
      </span>
      <span className="px-2.5 py-1.5 rounded-md text-xs font-semibold bg-cyan-50 text-cyan-800">
        Халиджи
      </span>
    </div>
  </header>
);

// Конфетти на финале
const Confetti = ({ active }) => {
  if (!active) return null;
  const pieces = Array.from({ length: 28 });
  const colors = ['#E31E24', '#1E4DB7', '#2BB0DF', '#16A34A', '#F59E0B'];
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.6;
        const dur = 2 + Math.random() * 1.6;
        const size = 6 + Math.random() * 6;
        const color = colors[i % colors.length];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: -20,
              left: `${left}%`,
              width: size,
              height: size * 0.6,
              backgroundColor: color,
              borderRadius: 2,
              animation: `confetti-fall ${dur}s ease-in ${delay}s forwards`,
            }}
          />
        );
      })}
    </div>
  );
};

// =============================================================
// ЭКРАН: ГЛАВНЫЙ
// =============================================================

const HomeScreen = ({ onStartLearn, onStartTest, soundOn, setSoundOn, learnDone }) => {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="px-4 pt-6 pb-10 max-w-md mx-auto font-ru animate-fadeIn">
      <Header soundOn={soundOn} setSoundOn={setSoundOn} showBack={false} />

      {/* hero */}
      <div className="flex flex-col items-center text-center mt-2 mb-7">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <Hash size={28} className="text-red-600" strokeWidth={2.5}/>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Арабские цифры
        </h1>
        <p className="text-slate-500 text-sm mt-2">
          от ٠ до <span className="font-arabic text-base">مليون</span> · заливный диалект
        </p>
      </div>

      {/* кнопка-аккордеон */}
      <button
        onClick={() => setShowRules(s => !s)}
        className={`w-full mb-3 py-3 px-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 transition
          ${showRules ? 'bg-red-50 border-red-200' : 'bg-red-50/50 border-red-200 hover:bg-red-50'}`}
      >
        <HelpCircle size={18} className="text-red-600"/>
        <span className="font-semibold text-red-700 text-sm">
          {showRules ? 'Скрыть правила' : 'Как формируются числа?'}
        </span>
      </button>

      {showRules && (
        <div className="mb-5 p-4 rounded-2xl bg-white border border-slate-200 text-sm text-slate-700 leading-relaxed animate-slideUp">
          <div className="mb-2"><b className="text-slate-900">Десятки + единицы:</b> сначала единица, потом «у» (и), потом десяток.<br/>
          <span dir="rtl" className="font-arabic text-base">خَمسة و ثَلاثين</span> · хамса у салясин = 35</div>
          <div className="mb-2"><b className="text-slate-900">Сотни:</b> мия (100), миятейн (200), затем салясмия, арбаамия...</div>
          <div><b className="text-slate-900">Тысячи:</b> альф (1000), альфейн (2000), от 3 до 10 — алаф (саляса алаф = 3000).</div>
        </div>
      )}

      {/* шаг 1 — обучение */}
      <button
        onClick={onStartLearn}
        className="w-full mb-3 p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex items-center gap-4 text-left active:scale-[0.99]"
      >
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <BookOpen size={22} className="text-blue-700" strokeWidth={2.2}/>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold text-blue-700 tracking-wide uppercase mb-0.5">
            Шаг 1 {learnDone && <span className="ml-1 text-green-600 normal-case">✓ пройдено</span>}
          </div>
          <div className="font-bold text-slate-900 text-lg leading-tight">Обучение</div>
          <div className="text-xs text-slate-500 mt-0.5">7 тем · карточки с озвучкой</div>
        </div>
        <ArrowRight size={18} className="text-slate-400 shrink-0"/>
      </button>

      {/* шаг 2 — тест */}
      <button
        onClick={onStartTest}
        className="w-full p-4 bg-white rounded-2xl border border-slate-200 hover:border-red-300 hover:shadow-md transition flex items-center gap-4 text-left active:scale-[0.99]"
      >
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
          <Zap size={22} className="text-red-600" strokeWidth={2.2}/>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold text-red-700 tracking-wide uppercase mb-0.5">Шаг 2</div>
          <div className="font-bold text-slate-900 text-lg leading-tight">Тест</div>
          <div className="text-xs text-slate-500 mt-0.5">40 заданий · числа до миллиона</div>
        </div>
        <ArrowRight size={18} className="text-slate-400 shrink-0"/>
      </button>

      <p className="text-center text-[12px] text-slate-400 mt-6 leading-relaxed">
        В странах залива пишут восточно-арабскими цифрами:<br/>
        <span className="font-arabic text-base text-slate-500">١٢٣٤٥٦٧٨٩٠</span>
      </p>

      {/* нижний CTA блок */}
      <div className="mt-8 bg-sky-100 rounded-3xl p-6 text-center">
        <div className="text-[11px] font-bold text-sky-700 tracking-wide uppercase mb-2">
          Хочешь заниматься индивидуально?
        </div>
        <div className="text-slate-900 font-bold mb-4 leading-snug">
          Для индивидуальных занятий и консультаций пишите в Max или WhatsApp
        </div>
        <a
          href="https://wa.me/79261233328"
          target="_blank" rel="noopener noreferrer"
          className="inline-block w-full py-3.5 px-6 rounded-2xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-lg shadow-lg shadow-red-600/30 transition active:scale-[0.98]"
        >
          +7 926 123-33-28
        </a>
        <div className="mt-5 pt-5 border-t border-sky-200">
          <a href="https://talkarabicnow.online" className="text-sky-700 text-sm font-medium hover:text-sky-900 transition">
            www.talkarabicnow.online
          </a>
        </div>
      </div>
    </div>
  );
};

// =============================================================
// ЭКРАН: СПИСОК ТЕМ
// =============================================================

const TopicsScreen = ({ onPickTopic, onBack, soundOn, setSoundOn, completed }) => (
  <div className="px-4 pt-6 pb-10 max-w-md mx-auto font-ru animate-fadeIn">
    <Header soundOn={soundOn} setSoundOn={setSoundOn} showBack onBack={onBack}/>

    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Выбери тему</h1>
    <p className="text-slate-500 text-sm mt-1 mb-6">Пройди все, прежде чем начать тест</p>

    <div className="space-y-2.5">
      {TOPICS.map((t, idx) => {
        const a = ACCENT_STYLES[t.accent];
        const done = completed.includes(t.id);
        return (
          <button
            key={t.id}
            onClick={() => onPickTopic(t)}
            className="w-full p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition flex items-center gap-4 text-left active:scale-[0.99]"
          >
            <div className={`w-10 h-10 rounded-xl ${a.bg} flex items-center justify-center shrink-0`}>
              <span className={`font-extrabold text-lg ${a.num}`}>{idx + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-900 leading-tight flex items-center gap-2">
                {t.title}
                {done && <CheckCircle2 size={16} className="text-green-600 shrink-0"/>}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 truncate">{t.sub}</div>
            </div>
            <ArrowRight size={18} className="text-slate-400 shrink-0"/>
          </button>
        );
      })}
    </div>
  </div>
);

// =============================================================
// ЭКРАН: ОБУЧЕНИЕ (карточки)
// =============================================================

const LearnScreen = ({ topic, onBack, onComplete, soundOn, setSoundOn }) => {
  const [idx, setIdx] = useState(0);
  const items = topic.items;
  const item = items[idx];
  const a = ACCENT_STYLES[topic.accent];
  const isLast = idx === items.length - 1;

  // Автоозвучка при смене карточки (если звук включён)
  useEffect(() => {
    if (item) speak(item.ar, soundOn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const next = () => {
    if (isLast) onComplete(topic.id);
    else setIdx(i => i + 1);
  };
  const prev = () => setIdx(i => Math.max(0, i - 1));

  const progress = ((idx + 1) / items.length) * 100;

  return (
    <div className="px-4 pt-6 pb-10 max-w-md mx-auto font-ru animate-fadeIn min-h-screen flex flex-col">
      <Header soundOn={soundOn} setSoundOn={setSoundOn} showBack onBack={onBack}/>

      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>{topic.title}</span>
        <span>{idx + 1} / {items.length}</span>
      </div>
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-blue-700 to-cyan-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className={`w-full ${a.bg} rounded-3xl p-6 sm:p-8 mb-5 animate-slideUp`} key={idx}>
          {/* Восточные цифры */}
          <div className={`text-center font-arabic text-5xl sm:text-6xl font-bold ${a.num} mb-3`}>
            {toEastern(item.n)}
          </div>
          {/* Европейские цифры */}
          <div className="text-center text-2xl font-bold text-slate-700 mb-5">
            {item.n.toLocaleString('ru-RU')}
          </div>

          {/* Арабская запись */}
          <div className="text-center mb-3">
            <span dir="rtl" className="font-arabic text-4xl sm:text-5xl text-slate-900 leading-loose">
              {item.ar}
            </span>
          </div>

          {/* Транскрипция */}
          <div className="text-center text-slate-700 text-lg font-medium mb-5">
            {item.tr}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => speak(item.ar, true)}
              className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-blue-700 hover:bg-blue-50 active:scale-95 transition border border-slate-200"
              aria-label="Прослушать"
            >
              <Volume2 size={22}/>
            </button>
          </div>
        </div>

        {idx === 0 && (
          <p className="text-center text-sm text-slate-500 mb-4 px-4 leading-relaxed">
            {topic.intro}
          </p>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={prev}
          disabled={idx === 0}
          className="px-4 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-[0.98] flex items-center gap-1"
        >
          <ChevronLeft size={18}/>
          <span className="hidden sm:inline">Назад</span>
        </button>
        <button
          onClick={next}
          className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-lg shadow-red-600/20 transition active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isLast ? 'Тема пройдена' : 'Дальше'}
          {!isLast && <ChevronRight size={18}/>}
          {isLast && <Check size={18}/>}
        </button>
      </div>
    </div>
  );
};

// =============================================================
// ЭКРАН: ТЕСТ
// =============================================================

// Генератор пула вариантов: смешиваем все числа из всех тем
const buildAllPool = () => {
  const all = [...UNITS, ...TEENS, ...TENS, ...COMPOUNDS, ...HUNDREDS, ...THREE_DIGIT, ...THOUSANDS];
  // убираем дубликаты по n
  const map = new Map();
  all.forEach(it => map.set(it.n, it));
  return Array.from(map.values());
};

const TestScreen = ({ onBack, onFinish, soundOn, setSoundOn, totalQuestions = 40 }) => {
  const pool = useMemo(() => buildAllPool(), []);
  const questions = useMemo(() => {
    // 40 заданий, чередуем 4 типа
    const types = ['ar2num', 'num2ar', 'audio2num', 'tr2num'];
    const qs = [];
    for (let i = 0; i < totalQuestions; i++) {
      const target = pool[Math.floor(Math.random() * pool.length)];
      const type = types[i % types.length];
      // 3 дистрактора
      const distractors = shuffle(pool.filter(p => p.n !== target.n)).slice(0, 3);
      const options = shuffle([target, ...distractors]);
      qs.push({ type, target, options });
    }
    return qs;
  }, [pool, totalQuestions]);

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [errors, setErrors] = useState([]);

  const q = questions[idx];
  const checked = picked !== null;
  const isCorrect = checked && picked.n === q.target.n;
  const progress = ((idx + (checked ? 1 : 0)) / questions.length) * 100;

  // Автопрослушивание для типа audio2num
  useEffect(() => {
    if (q.type === 'audio2num' && soundOn) {
      // небольшая задержка для UI
      const t = setTimeout(() => speak(q.target.ar, true), 250);
      return () => clearTimeout(t);
    }
  }, [idx, q, soundOn]);

  const pick = (opt) => {
    if (checked) return;
    setPicked(opt);
    if (opt.n === q.target.n) {
      setCorrectCount(c => c + 1);
      // быстрая озвучка правильного ответа
      speak(q.target.ar, soundOn);
      setTimeout(() => goNext(), 850);
    } else {
      setErrors(e => [...e, { ...q, picked: opt }]);
    }
  };

  const goNext = () => {
    if (idx + 1 >= questions.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      onFinish({
        correct: correctCount + (isCorrect ? 0 : 0), // правильные уже учтены
        total: questions.length,
        elapsed,
        errors,
      });
      return;
    }
    setIdx(i => i + 1);
    setPicked(null);
  };

  // Заголовок задания и форматирование вариантов в зависимости от типа
  const renderQuestion = () => {
    const t = q.target;
    if (q.type === 'ar2num') {
      return (
        <div className="text-center">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Что это за число?</div>
          <div dir="rtl" className="font-arabic text-5xl sm:text-6xl text-slate-900 leading-loose mb-2">
            {t.ar}
          </div>
        </div>
      );
    }
    if (q.type === 'num2ar') {
      return (
        <div className="text-center">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Как пишется по-арабски?</div>
          <div className="text-5xl sm:text-6xl font-extrabold text-slate-900 mb-1">
            {t.n.toLocaleString('ru-RU')}
          </div>
          <div className="font-arabic text-3xl text-slate-400">{toEastern(t.n)}</div>
        </div>
      );
    }
    if (q.type === 'audio2num') {
      return (
        <div className="text-center">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Прослушай и выбери число</div>
          <button
            onClick={() => speak(t.ar, true)}
            className="w-20 h-20 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition active:scale-95 flex items-center justify-center mx-auto mb-2"
            aria-label="Прослушать"
          >
            <Volume2 size={32}/>
          </button>
          <div className="text-xs text-slate-500 mt-2">Нажми, чтобы услышать ещё раз</div>
        </div>
      );
    }
    if (q.type === 'tr2num') {
      return (
        <div className="text-center">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Какое это число?</div>
          <div className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
            «{t.tr}»
          </div>
        </div>
      );
    }
    return null;
  };

  // Как показываем варианты ответа
  const renderOption = (opt) => {
    if (q.type === 'num2ar') {
      // показываем арабское написание
      return (
        <div className="flex items-center justify-between gap-3">
          <span dir="rtl" className="font-arabic text-2xl sm:text-3xl text-slate-900">{opt.ar}</span>
          <span className="text-xs text-slate-400 font-arabic">{toEastern(opt.n)}</span>
        </div>
      );
    }
    if (q.type === 'tr2num' || q.type === 'ar2num' || q.type === 'audio2num') {
      // показываем число (восточные + европейские)
      return (
        <div className="flex items-center justify-between gap-3">
          <span className="font-arabic text-3xl text-slate-700">{toEastern(opt.n)}</span>
          <span className="text-lg font-bold text-slate-900">{opt.n.toLocaleString('ru-RU')}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="px-4 pt-6 pb-10 max-w-md mx-auto font-ru animate-fadeIn min-h-screen flex flex-col">
      <Header soundOn={soundOn} setSoundOn={setSoundOn} showBack onBack={onBack}/>

      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>Тест</span>
        <span>{idx + 1} / {questions.length}</span>
      </div>
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-blue-700 to-cyan-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div key={idx} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 mb-4 animate-slideUp">
        {renderQuestion()}
      </div>

      <div className="space-y-2.5">
        {q.options.map((opt, i) => {
          const isPicked = picked && picked.n === opt.n;
          const isAnswer = opt.n === q.target.n;
          let cls = 'bg-white border-slate-200 hover:border-slate-300';
          if (checked) {
            if (isAnswer) cls = 'bg-green-50 border-green-600 text-green-900';
            else if (isPicked) cls = 'bg-red-50 border-red-500 text-red-900 animate-shake';
            else cls = 'bg-white border-slate-200 opacity-60';
          }
          return (
            <button
              key={i}
              onClick={() => pick(opt)}
              disabled={checked}
              className={`w-full p-4 rounded-2xl border-2 transition text-left ${cls} ${!checked && 'active:scale-[0.99]'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">{renderOption(opt)}</div>
                {checked && isAnswer && <CheckCircle2 size={22} className="text-green-600 shrink-0 ml-2"/>}
                {checked && isPicked && !isAnswer && <XCircle size={22} className="text-red-500 shrink-0 ml-2"/>}
              </div>
            </button>
          );
        })}
      </div>

      {checked && !isCorrect && (
        <div className="mt-4 p-4 rounded-2xl bg-slate-100 animate-fadeIn">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Правильный ответ</div>
          <div className="flex items-baseline justify-between gap-3">
            <span dir="rtl" className="font-arabic text-2xl text-slate-900">{q.target.ar}</span>
            <span className="text-base font-bold text-slate-900">{q.target.n.toLocaleString('ru-RU')}</span>
          </div>
          <div className="text-sm text-slate-600 mt-1">{q.target.tr}</div>
          <button
            onClick={goNext}
            className="w-full mt-4 py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-lg shadow-red-600/20 transition active:scale-[0.98]"
          >
            Дальше
          </button>
        </div>
      )}
    </div>
  );
};

// =============================================================
// ЭКРАН: ФИНАЛ
// =============================================================

const FinishScreen = ({ result, onRetry, onMenu, soundOn, setSoundOn }) => {
  const { correct, total, elapsed, errors } = result;
  const pct = Math.round((correct / total) * 100);
  const [showErrors, setShowErrors] = useState(false);

  const min = Math.floor(elapsed / 60);
  const sec = elapsed % 60;
  const timeStr = min > 0 ? `${min} мин ${sec} сек` : `${sec} сек`;

  let icon, iconColor, iconBg, phrase;
  if (pct >= 90) {
    icon = <Trophy size={48} strokeWidth={2}/>;
    iconColor = 'text-amber-500';
    iconBg = 'bg-amber-50';
    phrase = 'Свободное владение уже близко';
  } else if (pct >= 70) {
    icon = <Star size={48} strokeWidth={2}/>;
    iconColor = 'text-blue-600';
    iconBg = 'bg-blue-50';
    phrase = 'Уверенный результат. Ещё немного практики — и будет идеально';
  } else if (pct >= 50) {
    icon = <ThumbsUp size={48} strokeWidth={2}/>;
    iconColor = 'text-green-600';
    iconBg = 'bg-green-50';
    phrase = 'Основа заложена. Повтори — и результат вырастет';
  } else {
    icon = <Sparkles size={48} strokeWidth={2}/>;
    iconColor = 'text-slate-500';
    iconBg = 'bg-slate-100';
    phrase = 'Материал новый — это нормально. Пройди ещё раз не спеша';
  }

  return (
    <div className="px-4 pt-6 pb-10 max-w-md mx-auto font-ru min-h-screen flex flex-col animate-fadeIn">
      <Confetti active={pct >= 90}/>
      <Header soundOn={soundOn} setSoundOn={setSoundOn} showBack onBack={onMenu}/>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className={`w-24 h-24 rounded-3xl ${iconBg} ${iconColor} flex items-center justify-center mb-6 animate-pop`}>
          {icon}
        </div>

        <div className="text-7xl font-extrabold text-slate-900 tracking-tight mb-1 animate-slideUp" style={{animationDelay: '0.1s'}}>
          {pct}%
        </div>
        <div className="text-slate-600 text-base font-medium mb-4 animate-slideUp" style={{animationDelay: '0.2s'}}>
          {correct} из {total} правильно
        </div>

        <div className="text-slate-700 text-base font-medium px-4 mb-2 animate-slideUp" style={{animationDelay: '0.4s'}}>
          {phrase}
        </div>
        <div className="text-xs text-slate-400 animate-slideUp" style={{animationDelay: '0.5s'}}>
          Время: {timeStr}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mb-4 animate-slideUp" style={{animationDelay: '0.6s'}}>
          <button
            onClick={() => setShowErrors(s => !s)}
            className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition flex items-center justify-between"
          >
            <span>Где были ошибки ({errors.length})</span>
            <ChevronRight size={16} className={`transition ${showErrors ? 'rotate-90' : ''}`}/>
          </button>
          {showErrors && (
            <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
              {errors.slice(0, 12).map((e, i) => (
                <div key={i} className="p-3 rounded-xl bg-white border border-slate-200 text-sm">
                  <div className="flex items-baseline justify-between gap-2">
                    <span dir="rtl" className="font-arabic text-xl text-slate-900">{e.target.ar}</span>
                    <span className="font-bold text-slate-900">{e.target.n.toLocaleString('ru-RU')}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{e.target.tr}</div>
                </div>
              ))}
              {errors.length > 12 && (
                <div className="text-xs text-slate-400 text-center pt-1">
                  и ещё {errors.length - 12}...
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2 animate-slideUp" style={{animationDelay: '0.7s'}}>
        <button
          onClick={onRetry}
          className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-lg shadow-red-600/20 transition active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <RotateCcw size={18}/>
          Пройти ещё раз
        </button>
        <button
          onClick={onMenu}
          className="w-full py-3 px-6 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition active:scale-[0.98]"
        >
          В меню
        </button>
      </div>
    </div>
  );
};

// =============================================================
// КОРНЕВОЙ КОМПОНЕНТ
// =============================================================

export default function App() {
  const [screen, setScreen] = useState('home'); // home | topics | learn | test | finish
  const [activeTopic, setActiveTopic] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [soundOn, setSoundOn] = useState(true);
  const [testResult, setTestResult] = useState(null);

  // Загружаем голоса один раз при старте (нужно для Chrome)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  const handleStartLearn = () => setScreen('topics');
  const handleStartTest  = () => setScreen('test');
  const handlePickTopic  = (topic) => { setActiveTopic(topic); setScreen('learn'); };
  const handleTopicDone  = (id) => {
    setCompleted(c => c.includes(id) ? c : [...c, id]);
    setScreen('topics');
  };
  const handleTestFinish = (result) => { setTestResult(result); setScreen('finish'); };

  return (
    <div className="min-h-screen bg-slate-50">
      <FontStyles/>
      <TopBanner/>

      {screen === 'home' && (
        <HomeScreen
          onStartLearn={handleStartLearn}
          onStartTest={handleStartTest}
          soundOn={soundOn}
          setSoundOn={setSoundOn}
          learnDone={completed.length === TOPICS.length}
        />
      )}

      {screen === 'topics' && (
        <TopicsScreen
          onPickTopic={handlePickTopic}
          onBack={() => setScreen('home')}
          soundOn={soundOn}
          setSoundOn={setSoundOn}
          completed={completed}
        />
      )}

      {screen === 'learn' && activeTopic && (
        <LearnScreen
          topic={activeTopic}
          onBack={() => setScreen('topics')}
          onComplete={handleTopicDone}
          soundOn={soundOn}
          setSoundOn={setSoundOn}
        />
      )}

      {screen === 'test' && (
        <TestScreen
          onBack={() => setScreen('home')}
          onFinish={handleTestFinish}
          soundOn={soundOn}
          setSoundOn={setSoundOn}
          totalQuestions={40}
        />
      )}

      {screen === 'finish' && testResult && (
        <FinishScreen
          result={testResult}
          onRetry={() => { setTestResult(null); setScreen('test'); }}
          onMenu={() => { setTestResult(null); setScreen('home'); }}
          soundOn={soundOn}
          setSoundOn={setSoundOn}
        />
      )}
    </div>
  );
}
