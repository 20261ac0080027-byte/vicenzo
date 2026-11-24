import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  BatteryCharging,
  Coffee,
  FastForward,
  HardDrive,
  Home,
  RotateCcw,
  Terminal,
  Trophy,
  Volume2,
  VolumeX,
  Wifi,
} from 'lucide-react';
import {
  CAMPUS_ENDINGS,
  CAMPUS_SCENES,
  CampusState,
  EndingId,
  INITIAL_CAMPUS_STATE,
  applyCampusChoice,
} from '../game/campusAdventure';
import { soundEngine } from '../utils/sound';

interface CampusAdventureModeProps {
  studentName: string;
  muted: boolean;
  onToggleMute: () => void;
  onExitToTitle: () => void;
  unlockedEndings: EndingId[];
  onUnlockEnding: (endingId: EndingId) => void;
}

export const CampusAdventureMode: React.FC<CampusAdventureModeProps> = ({
  studentName,
  muted,
  onToggleMute,
  onExitToTitle,
  unlockedEndings,
  onUnlockEnding,
}) => {
  const [state, setState] = useState<CampusState>(INITIAL_CAMPUS_STATE);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const typingIntervalRef = useRef<number | null>(null);

  const currentScene = CAMPUS_SCENES[state.sceneId];
  const fullNarrative = currentScene ? currentScene.narrative(state) : '';
  const activeEnding = state.endingId ? CAMPUS_ENDINGS[state.endingId] : null;

  useEffect(() => {
    document.body.dataset.state = activeEnding ? 'gameover' : 'playing';
  }, [activeEnding]);

  // Efeito de digitação no terminal
  useEffect(() => {
    if (typingIntervalRef.current !== null) {
      window.clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    if (activeEnding) return;

    setTypedText('');
    setIsTyping(true);

    let index = 0;
    const interval = window.setInterval(() => {
      index += 3;
      if (index >= fullNarrative.length) {
        setTypedText(fullNarrative);
        setIsTyping(false);
        window.clearInterval(interval);
        typingIntervalRef.current = null;
      } else {
        setTypedText(fullNarrative.slice(0, index));
        if (index % 9 === 0) {
          soundEngine.playTypeBlip();
        }
      }
    }, 16);

    typingIntervalRef.current = interval;

    return () => {
      window.clearInterval(interval);
      typingIntervalRef.current = null;
    };
  }, [activeEnding, fullNarrative, state.sceneId]);

  const handleSkipTyping = () => {
    if (typingIntervalRef.current !== null) {
      window.clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    setTypedText(fullNarrative);
    setIsTyping(false);
  };

  const handleSelectChoice = (choiceId: string) => {
    soundEngine.playClick();
    const nextState = applyCampusChoice(state, choiceId);
    setState(nextState);

    if (nextState.endingId) {
      onUnlockEnding(nextState.endingId);
      if (nextState.endingId === 'nota_10' || nextState.endingId === 'ultimo_segundo') {
        soundEngine.playVictory();
      } else {
        soundEngine.playDefeat();
      }
    }
  };

  const handleRestart = () => {
    soundEngine.playClick();
    setState(INITIAL_CAMPUS_STATE);
  };

  return (
    <div className="min-h-screen w-full bg-[#0f172a] tech-grid-bg text-slate-100 flex flex-col">
      {/* Barra superior do Modo 2 */}
      <header className="w-full border-b border-slate-800 bg-slate-900/90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
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
                Aventura no Campus · IFPR
              </span>
              <span className="text-xs text-slate-400 block truncate">
                Calouro(a): {studentName} · Finais: {unlockedEndings.length}/4
              </span>
            </div>
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
      </header>

      {/* Layout em duas colunas: Terminal à esquerda + Painel Status do Aluno à direita */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Principal: Terminal Narrativo e Escolhas */}
        <section className="lg:col-span-8 flex flex-col gap-5">
          {!activeEnding && currentScene ? (
            <>
              {/* Janela estilo Terminal */}
              <div className="bg-slate-950 border border-slate-700/80 rounded-xl overflow-hidden">
                {/* Barra de título do terminal */}
                <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-mono text-xs text-emerald-400 truncate">
                      {currentScene.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-xs text-slate-400 tabular-nums">
                      Prazo: {state.minutosRestantes} min
                    </span>
                    {isTyping && (
                      <button
                        type="button"
                        onClick={handleSkipTyping}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <FastForward className="w-3 h-3" />
                        <span>Completar</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Corpo do Terminal */}
                <div className="p-5 sm:p-6">
                  <h2 className="font-display font-bold text-xl sm:text-2xl text-white mb-3">
                    {currentScene.title}
                  </h2>
                  <p
                    data-testid="terminal-narrative"
                    className="font-mono text-sm sm:text-base text-slate-200 leading-relaxed min-h-[5.5rem]"
                  >
                    {typedText}
                    {isTyping && (
                      <span
                        aria-hidden="true"
                        className="inline-block w-2 h-4 ml-1 bg-emerald-400 align-middle animate-cursor-blink"
                      />
                    )}
                  </p>
                </div>
              </div>

              {/* Opções de Decisão com Código Real abaixo de cada botão */}
              <div className="flex flex-col gap-3.5">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Escolha sua próxima ação
                </h3>

                {currentScene.choices.map((choice, idx) => (
                  <div
                    key={choice.id}
                    className="bg-slate-900/95 border border-slate-700/80 hover:border-emerald-500/70 rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectChoice(choice.id)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-emerald-500/10 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-400"
                    >
                      <span className="font-display font-semibold text-base text-white">
                        {idx + 1}. {choice.label}
                      </span>
                      <span className="font-mono text-xs font-semibold text-emerald-400 shrink-0">
                        Executar →
                      </span>
                    </button>

                    {/* Trecho de código real abaixo do botão */}
                    <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-800/90">
                      <pre className="font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
                        <code>{choice.codeSnippet}</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : activeEnding ? (
            /* Tela de Final da Aventura */
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4 mb-4">
                <span
                  className={`font-mono text-xs font-bold ${
                    activeEnding.tone === 'emerald'
                      ? 'text-emerald-400'
                      : activeEnding.tone === 'amber'
                      ? 'text-amber-300'
                      : activeEnding.tone === 'rose'
                      ? 'text-rose-400'
                      : 'text-violet-300'
                  }`}
                >
                  {activeEnding.badge} · {activeEnding.gradeLabel}
                </span>
                <Trophy className="w-6 h-6 text-emerald-400 shrink-0" />
              </div>

              <h2
                data-testid="ending-title"
                className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-3"
              >
                {activeEnding.title}
              </h2>

              <p className="text-base text-slate-200 leading-relaxed mb-6">
                {activeEnding.summary}
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6">
                <span className="text-xs font-semibold text-emerald-400 block mb-1">
                  Lição de Algoritmos e Lógica
                </span>
                <p className="font-mono text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {activeEnding.lesson}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  data-start="true"
                  onClick={handleRestart}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Tentar Outro Caminho</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onExitToTitle();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-colors cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  <span>Voltar ao Início</span>
                </button>
              </div>
            </div>
          ) : null}
        </section>

        {/* Coluna Lateral: Painel "Status do Aluno" com Variáveis em Tempo Real */}
        <aside className="lg:col-span-4 flex flex-col gap-5">
          <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-5">
            <h2 className="font-display font-bold text-base text-white mb-1">
              Status do Aluno
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Variáveis em memória atualizadas a cada decisão
            </p>

            <div className="space-y-3 font-mono text-xs sm:text-sm">
              {/* pendriveSalvo */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="inline-flex items-center gap-2 text-slate-300">
                  <HardDrive className="w-4 h-4 text-slate-400" />
                  <span>pendriveSalvo</span>
                </span>
                <span
                  data-testid="var-pendrive"
                  className={`font-bold ${
                    state.pendriveSalvo ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {String(state.pendriveSalvo)}
                </span>
              </div>

              {/* bateriaNotebook */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-2 text-slate-300">
                    <BatteryCharging className="w-4 h-4 text-slate-400" />
                    <span>bateriaNotebook</span>
                  </span>
                  <span
                    data-testid="var-bateria"
                    className={`font-bold tabular-nums ${
                      state.bateriaNotebook > 50
                        ? 'text-emerald-400'
                        : state.bateriaNotebook > 20
                        ? 'text-amber-300'
                        : 'text-rose-400'
                    }`}
                  >
                    {state.bateriaNotebook}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      state.bateriaNotebook > 50
                        ? 'bg-emerald-500'
                        : state.bateriaNotebook > 20
                        ? 'bg-amber-400'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${state.bateriaNotebook}%` }}
                  />
                </div>
              </div>

              {/* internetLabFuncionando */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="inline-flex items-center gap-2 text-slate-300">
                  <Wifi className="w-4 h-4 text-slate-400" />
                  <span>internetLabFuncionando</span>
                </span>
                <span
                  data-testid="var-internet"
                  className={`font-bold ${
                    state.internetLabFuncionando ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {String(state.internetLabFuncionando)}
                </span>
              </div>

              {/* tomouCafe */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="inline-flex items-center gap-2 text-slate-300">
                  <Coffee className="w-4 h-4 text-slate-400" />
                  <span>tomouCafe</span>
                </span>
                <span
                  data-testid="var-cafe"
                  className={`font-bold ${
                    state.tomouCafe ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {String(state.tomouCafe)}
                </span>
              </div>

              {/* Tempo e Progresso */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">minutosRestantes</span>
                  <span className="font-bold text-white tabular-nums">
                    {state.minutosRestantes} min
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">progressoCodigo</span>
                  <span className="font-bold text-emerald-400 tabular-nums">
                    {state.progressoTrabalho}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Registro de Execução (Log do Terminal) */}
          <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-5">
            <h3 className="font-display font-bold text-sm text-white mb-3">
              Histórico de Execução
            </h3>
            <ul className="space-y-2 font-mono text-xs text-slate-300 max-h-48 overflow-y-auto pr-1">
              {state.log.map((entry, idx) => (
                <li key={idx} className="leading-relaxed border-b border-slate-800/70 pb-1.5 last:border-b-0">
                  <span className="text-emerald-400 mr-1.5">&gt;</span>
                  {entry}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
};
