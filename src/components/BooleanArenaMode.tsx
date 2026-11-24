import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Home,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';
import {
  ArenaPhase,
  BooleanQuestion,
  MAX_COFFEE_LIVES,
  PHASE_CONFIG,
  QUESTION_DURATION_SECONDS,
  buildArenaDeck,
  getTimerUrgency,
  resolveArenaTurn,
} from '../game/booleanArena';
import { BugSprite, CoffeeLifeIcon } from './BugSprite';
import { soundEngine } from '../utils/sound';

interface BooleanArenaModeProps {
  studentName: string;
  muted: boolean;
  onToggleMute: () => void;
  onExitToTitle: () => void;
  onSaveBestScore: (score: number) => void;
}

interface TurnFeedback {
  isCorrect: boolean;
  timedOut: boolean;
  chosenAnswer: boolean | null;
  pointsEarned: number;
  damageDealt: number;
  phaseCleared: boolean;
}

export const BooleanArenaMode: React.FC<BooleanArenaModeProps> = ({
  studentName,
  muted,
  onToggleMute,
  onExitToTitle,
  onSaveBestScore,
}) => {
  const [deck, setDeck] = useState<BooleanQuestion[]>(() => buildArenaDeck(true));
  const [questionIdx, setQuestionIdx] = useState(0);
  const [coffeeLives, setCoffeeLives] = useState(MAX_COFFEE_LIVES);
  const [bugHp, setBugHp] = useState(PHASE_CONFIG[1].maxHp);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_DURATION_SECONDS);
  const [feedback, setFeedback] = useState<TurnFeedback | null>(null);
  const [hitFlash, setHitFlash] = useState(false);
  const [gameResult, setGameResult] = useState<'playing' | 'victory' | 'defeat'>('playing');

  const lastTickSecondRef = useRef<number>(QUESTION_DURATION_SECONDS);
  const currentQuestion = deck[questionIdx];
  const currentBoss = PHASE_CONFIG[currentQuestion?.phase ?? 1];

  useEffect(() => {
    document.body.dataset.state = gameResult === 'playing' ? 'playing' : 'gameover';
  }, [gameResult]);

  const handleAnswer = useCallback(
    (chosenAnswer: boolean | null) => {
      if (feedback || gameResult !== 'playing' || !currentQuestion) return;

      const result = resolveArenaTurn({
        question: currentQuestion,
        chosenAnswer,
        timeLeft,
        bugHp,
        coffeeLives,
        streak,
      });

      setAnsweredCount((c) => c + 1);

      if (result.isCorrect) {
        soundEngine.playHit();
        setHitFlash(true);
        setTimeout(() => setHitFlash(false), 360);
        setScore((s) => s + result.pointsEarned);
        setStreak((st) => st + 1);
        setCorrectCount((c) => c + 1);
        setBugHp(result.newBugHp);
      } else {
        soundEngine.playDamage();
        setStreak(0);
        setCoffeeLives(result.newCoffeeLives);
      }

      setFeedback({
        isCorrect: result.isCorrect,
        timedOut: chosenAnswer === null,
        chosenAnswer,
        pointsEarned: result.pointsEarned,
        damageDealt: result.damageDealt,
        phaseCleared: result.phaseCleared,
      });
    },
    [bugHp, coffeeLives, currentQuestion, feedback, gameResult, streak, timeLeft]
  );

  const handleAdvance = useCallback(() => {
    if (!feedback) return;
    soundEngine.playClick();

    // Verifica derrota
    if (coffeeLives <= 0) {
      soundEngine.playDefeat();
      onSaveBestScore(score);
      setGameResult('defeat');
      return;
    }

    const nextIdx = questionIdx + 1;
    // Verifica vitória completa (derrotou todas as 3 fases / ou completou o deck)
    if (nextIdx >= deck.length) {
      soundEngine.playVictory();
      onSaveBestScore(score);
      setGameResult('victory');
      return;
    }

    const nextQuestion = deck[nextIdx];
    const prevPhase = currentQuestion.phase;

    // Se mudou de fase (ou derrotou o bug atual), reseta o HP do próximo Bug
    if (nextQuestion.phase !== prevPhase) {
      setBugHp(PHASE_CONFIG[nextQuestion.phase].maxHp);
    }

    setQuestionIdx(nextIdx);
    setFeedback(null);
    setTimeLeft(QUESTION_DURATION_SECONDS);
    lastTickSecondRef.current = QUESTION_DURATION_SECONDS;
  }, [coffeeLives, currentQuestion, deck, feedback, onSaveBestScore, questionIdx, score]);

  const handleRestart = () => {
    soundEngine.playClick();
    setDeck(buildArenaDeck(true));
    setQuestionIdx(0);
    setCoffeeLives(MAX_COFFEE_LIVES);
    setBugHp(PHASE_CONFIG[1].maxHp);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setAnsweredCount(0);
    setTimeLeft(QUESTION_DURATION_SECONDS);
    lastTickSecondRef.current = QUESTION_DURATION_SECONDS;
    setFeedback(null);
    setGameResult('playing');
  };

  // Cronômetro regressivo de 10 segundos por questão
  useEffect(() => {
    if (feedback || gameResult !== 'playing') return;

    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        const next = Math.max(0, Number((prev - 0.1).toFixed(1)));
        const wholeSec = Math.ceil(next);
        if (wholeSec <= 3 && wholeSec >= 1 && wholeSec !== lastTickSecondRef.current) {
          lastTickSecondRef.current = wholeSec;
          soundEngine.playTickUrgent();
        }
        if (next <= 0) {
          window.clearInterval(interval);
        }
        return next;
      });
    }, 100);

    return () => window.clearInterval(interval);
  }, [feedback, gameResult, questionIdx]);

  // Dispara timeout quando timeLeft chega a 0
  useEffect(() => {
    if (timeLeft <= 0 && !feedback && gameResult === 'playing') {
      handleAnswer(null);
    }
  }, [feedback, gameResult, handleAnswer, timeLeft]);

  // Atalhos de teclado: Seta Esquerda = TRUE, Seta Direita = FALSE, Enter/Espaço = Próxima
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (gameResult !== 'playing') return;

      if (!feedback) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handleAnswer(true);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleAnswer(false);
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleAdvance();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [feedback, gameResult, handleAdvance, handleAnswer]);

  const urgency = getTimerUrgency(timeLeft);
  const timerPercent = Math.max(0, Math.min(100, (timeLeft / QUESTION_DURATION_SECONDS) * 100));
  const bugHpPercent = Math.max(0, Math.min(100, (bugHp / currentBoss.maxHp) * 100));

  const timerBarColor =
    urgency === 'critical'
      ? 'bg-rose-500'
      : urgency === 'warning'
      ? 'bg-amber-400'
      : 'bg-emerald-500';

  const timerLabel =
    urgency === 'critical'
      ? 'CRÍTICO'
      : urgency === 'warning'
      ? 'ATENÇÃO'
      : 'TEMPO';

  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  return (
    <div className="min-h-screen w-full bg-[#0f172a] tech-grid-bg text-slate-100 flex flex-col">
      {/* Barra superior do Modo 1 */}
      <header className="w-full border-b border-slate-800 bg-slate-900/90">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onExitToTitle();
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Início</span>
            </button>
            <div className="truncate">
              <span className="font-display font-bold text-sm sm:text-base text-white block truncate">
                Arena de Batalha Booleana
              </span>
              <span className="text-xs text-slate-400 block truncate">
                Aluno/Equipe: {studentName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-400 block">Pontuação</span>
              <span className="font-mono font-bold text-base text-emerald-400 tabular-nums">
                {score} pts
              </span>
            </div>

            <button
              type="button"
              onClick={onToggleMute}
              aria-label={muted ? 'Ativar som' : 'Mutar som'}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {muted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span className="hidden sm:inline">{muted ? 'Mudo' : 'Som'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Área principal da batalha */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col justify-center gap-6">
        {gameResult === 'playing' && currentQuestion ? (
          <>
            {/* HUD de Combate: Status do Aluno (Cafés) vs HP do Bug */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-slate-900/95 border border-slate-800 rounded-xl p-5">
              {/* Lado do Estudante */}
              <div className="md:col-span-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    ENERGIA / CAFÉ ({coffeeLives}/{MAX_COFFEE_LIVES})
                  </span>
                  <span className="sm:hidden font-mono text-xs font-bold text-emerald-400 tabular-nums">
                    {score} pts
                  </span>
                </div>
                <div className="flex items-center gap-2.5" aria-label={`Vidas de café restantes: ${coffeeLives} de ${MAX_COFFEE_LIVES}`}>
                  {Array.from({ length: MAX_COFFEE_LIVES }).map((_, idx) => (
                    <CoffeeLifeIcon key={idx} active={idx < coffeeLives} className="w-8 h-8" />
                  ))}
                  {streak >= 2 && (
                    <span className="ml-2 text-xs font-mono font-semibold text-emerald-400 tabular-nums">
                      Combo x{streak}
                    </span>
                  )}
                </div>
              </div>

              {/* Centro: Progresso de Questão e Fase */}
              <div className="md:col-span-3 flex flex-col items-start md:items-center justify-center border-y md:border-y-0 md:border-x border-slate-800 py-3 md:py-0 md:px-4">
                <span className="text-xs font-medium text-emerald-400">
                  Questão {questionIdx + 1} de {deck.length}
                </span>
                <span className="font-display font-bold text-sm text-white text-left md:text-center mt-0.5">
                  {currentBoss.subtitle}
                </span>
              </div>

              {/* Lado do Bug Inimigo */}
              <div className="md:col-span-6 flex items-center gap-4">
                <BugSprite
                  phase={currentQuestion.phase as ArenaPhase}
                  hitFlash={hitFlash}
                  defeated={bugHp === 0}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 mb-1.5">
                    <span className="font-display font-bold text-sm sm:text-base text-white">
                      {currentBoss.name}
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-300 tabular-nums shrink-0">
                      HP {bugHp}/{currentBoss.maxHp}
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                    <div
                      className={`h-full transition-all duration-300 ${
                        currentQuestion.phase === 1
                          ? 'bg-emerald-500'
                          : currentQuestion.phase === 2
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${bugHpPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Barra de Tempo Regressiva + Expressão Central */}
            <section className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-6 sm:p-8 flex flex-col gap-6">
              {/* Cronômetro */}
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="inline-flex items-center gap-1.5 text-slate-300 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{timerLabel}</span>
                  </span>
                  <span
                    className={`font-bold tabular-nums ${
                      urgency === 'critical'
                        ? 'text-rose-400'
                        : urgency === 'warning'
                        ? 'text-amber-300'
                        : 'text-emerald-400'
                    }`}
                  >
                    {timeLeft.toFixed(1)}s / {QUESTION_DURATION_SECONDS}s
                  </span>
                </div>
                <div
                  className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800"
                  role="progressbar"
                  aria-valuenow={Math.round(timeLeft)}
                  aria-valuemin={0}
                  aria-valuemax={QUESTION_DURATION_SECONDS}
                  aria-label="Tempo restante para responder"
                >
                  <div
                    className={`h-full transition-colors duration-200 ${timerBarColor}`}
                    style={{ width: `${timerPercent}%` }}
                  />
                </div>
              </div>

              {/* Variáveis (Fase 3 Estilo Prova) */}
              {currentQuestion.variables && (
                <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-4">
                  <span className="text-xs font-medium text-slate-400 block mb-2">
                    Valores das variáveis em memória:
                  </span>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm">
                    {Object.entries(currentQuestion.variables).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-1.5">
                        <span className="text-slate-300">{key}</span>
                        <span className="text-slate-500">=</span>
                        <span
                          className={
                            typeof val === 'boolean'
                              ? val
                                ? 'text-emerald-400 font-semibold'
                                : 'text-rose-400 font-semibold'
                              : 'text-amber-300 font-semibold'
                          }
                        >
                          {String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expressão Lógica Central */}
              <div className="py-4 px-4 sm:px-6 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-xs font-medium text-slate-400 block mb-2">
                  Qual é o resultado booleano desta expressão?
                </span>
                <p
                  data-testid="boolean-expression"
                  className="font-mono font-bold text-xl sm:text-2xl md:text-3xl text-white tracking-tight break-words"
                >
                  {currentQuestion.expression}
                </p>
              </div>

              {/* Botões TRUE / FALSE */}
              {!feedback ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleAnswer(true)}
                    className="group flex items-center justify-between px-6 py-5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/70 text-emerald-300 hover:text-white font-display font-bold text-lg sm:text-xl transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
                  >
                    <span>TRUE (Verdadeiro)</span>
                    <kbd className="font-mono text-xs px-2.5 py-1 rounded bg-slate-950/80 text-emerald-300 border border-emerald-500/40 whitespace-nowrap">
                      ← Seta Esq.
                    </kbd>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAnswer(false)}
                    className="group flex items-center justify-between px-6 py-5 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/70 text-rose-300 hover:text-white font-display font-bold text-lg sm:text-xl transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
                  >
                    <span>FALSE (Falso)</span>
                    <kbd className="font-mono text-xs px-2.5 py-1 rounded bg-slate-950/80 text-rose-300 border border-rose-500/40 whitespace-nowrap">
                      Seta Dir. →
                    </kbd>
                  </button>
                </div>
              ) : (
                /* Quadro "Resolução Passo a Passo" */
                <div
                  data-testid="step-resolution"
                  className={`rounded-xl border p-5 sm:p-6 ${
                    feedback.isCorrect
                      ? 'bg-emerald-950/35 border-emerald-500/60'
                      : 'bg-rose-950/35 border-rose-500/60'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      {feedback.isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <h3 className="font-display font-bold text-lg text-white">
                          {feedback.isCorrect
                            ? `Acertou! -${feedback.damageDealt} HP no Bug (+${feedback.pointsEarned} pts)`
                            : feedback.timedOut
                            ? 'Tempo Esgotado! Você perdeu 1 Café.'
                            : 'Resposta Incorreta! Você perdeu 1 Café.'}
                        </h3>
                        <p className="text-xs text-slate-300">
                          Resultado correto:{' '}
                          <strong className="font-mono text-white">
                            {currentQuestion.expectedAnswer ? 'TRUE (Verdadeiro)' : 'FALSE (Falso)'}
                          </strong>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAdvance}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
                    >
                      <span>
                        {coffeeLives <= 0
                          ? 'Ver Resultado'
                          : questionIdx + 1 >= deck.length
                          ? 'Concluir Arena'
                          : feedback.phaseCleared
                          ? 'Próxima Fase'
                          : 'Próxima Questão'}
                      </span>
                    </button>
                  </div>

                  <div className="bg-slate-950/85 border border-slate-800 rounded-lg p-4">
                    <span className="text-xs font-semibold text-emerald-400 block mb-2">
                      Resolução Passo a Passo
                    </span>
                    <ul className="space-y-1.5 text-sm text-slate-200 font-mono">
                      {currentQuestion.steps.map((step, i) => (
                        <li key={i} className="leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </section>
          </>
        ) : (
          /* Tela de Vitória / Derrota da Arena */
          <section className="my-auto max-w-2xl w-full mx-auto bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-500/15 border border-emerald-500/40 mb-5">
              {gameResult === 'victory' ? (
                <Sparkles className="w-7 h-7 text-emerald-400" />
              ) : (
                <XCircle className="w-7 h-7 text-rose-400" />
              )}
            </div>

            <p className="text-xs font-semibold text-emerald-400 mb-2">
              {gameResult === 'victory' ? 'TODOS OS BUGS COMPILADOS!' : 'CAFÉ ZERADO NA ARENA'}
            </p>
            <h2 className="font-display font-extrabold text-3xl text-white mb-3">
              {gameResult === 'victory'
                ? 'Vitória na Arena Booleana!'
                : 'Game Over · Recarregue o Café!'}
            </h2>
            <p className="text-sm text-slate-300 mb-8 max-w-lg mx-auto leading-relaxed">
              {gameResult === 'victory'
                ? `Parabéns, ${studentName}! Você derrotou os Bugs de Sintaxe, Precedência e Prova Final com domínio da lógica booleana.`
                : `Boa tentativa, ${studentName}! Revise a resolução passo a passo de precedência e operadores lógicos para tentar novamente.`}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8 text-left">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400 block">Pontuação</span>
                <span className="font-mono font-bold text-xl text-emerald-400 tabular-nums">
                  {score} pts
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400 block">Acertos</span>
                <span className="font-mono font-bold text-xl text-white tabular-nums">
                  {correctCount}/{answeredCount} ({accuracy}%)
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400 block">Fase Máxima</span>
                <span className="font-mono font-bold text-xl text-white tabular-nums">
                  Fase {currentQuestion?.phase ?? 1}/3
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                data-start="true"
                onClick={handleRestart}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Jogar Novamente</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onExitToTitle();
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Voltar ao Início</span>
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
