import React, { useState } from 'react';
import { Volume2, VolumeX, Terminal, ShieldAlert, ArrowRight, Trophy } from 'lucide-react';
import { LogicQuestCrest } from './BugSprite';
import { EndingId } from '../game/campusAdventure';

interface TitleScreenProps {
  studentName: string;
  onChangeStudentName: (name: string) => void;
  onStartMode: (mode: 'arena' | 'campus') => void;
  muted: boolean;
  onToggleMute: () => void;
  unlockedEndings: EndingId[];
  bestArenaScore: number;
}

const BACKDROP_URL = '/src/assets/images/ifpr_logic_backdrop_1795517680066.jpg';

export const TitleScreen: React.FC<TitleScreenProps> = ({
  studentName,
  onChangeStudentName,
  onStartMode,
  muted,
  onToggleMute,
  unlockedEndings,
  bestArenaScore,
}) => {
  const [nameError, setNameError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const handleLaunch = (mode: 'arena' | 'campus') => {
    const trimmed = studentName.trim();
    if (!trimmed) {
      setNameError('Informe o nome do aluno ou da equipe antes de iniciar.');
      return;
    }
    setNameError(null);
    onStartMode(mode);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0f172a] text-slate-100 overflow-hidden flex flex-col justify-between">
      {/* Camada de fundo ilustrada com scrim calibrado */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {!imageError ? (
          <img
            src={BACKDROP_URL}
            alt="Campus noturno do IFPR com laboratórios de informática iluminados em verde esmeralda"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center opacity-55"
          />
        ) : (
          <div className="w-full h-full tech-grid-bg bg-gradient-to-br from-[#0f172a] via-[#111c33] to-[#064e3b]/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/90 to-[#0f172a]/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-[#0f172a]/70" />
      </div>

      {/* Barra superior compacta do jogo */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LogicQuestCrest className="w-10 h-10 shrink-0" />
          <div className="leading-tight">
            <span className="font-display font-bold text-base tracking-tight text-white block whitespace-nowrap">
              IFPR LogicQuest
            </span>
            <span className="text-xs text-slate-400 block whitespace-nowrap">
              1º Ano · Técnico em Informática
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? 'Ativar efeitos sonoros' : 'Mutar efeitos sonoros'}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/90 border border-slate-700/80 text-slate-200 hover:border-emerald-500/60 hover:text-emerald-300 transition-colors text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-400"
        >
          {muted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          <span>{muted ? 'Som Mutado' : 'Som Ativo'}</span>
        </button>
      </header>

      {/* Conteúdo principal */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 md:py-12 flex-1 flex flex-col justify-center">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-emerald-400 mb-3">
            Algoritmos e Lógica de Programação · Trabalho Interativo
          </p>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight text-white leading-[1.08] mb-5 [text-wrap:balance]">
            IFPR LogicQuest: Sobrevivendo ao 1º Ano
          </h1>

          <p className="text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed mb-8">
            Domine operadores booleanos enfrentando bugs de compilação em tempo real ou encare os imprevistos do campus usando{' '}
            <code className="font-mono text-emerald-300 bg-slate-800/80 px-1.5 py-0.5 rounded">if/else</code> e{' '}
            <code className="font-mono text-emerald-300 bg-slate-800/80 px-1.5 py-0.5 rounded">switch/case</code> para entregar o trabalho no Moodle.
          </p>

          {/* Identificação do Aluno / Equipe */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-5 mb-8 max-w-xl">
            <label
              htmlFor="student-name-input"
              className="block text-sm font-semibold text-slate-200 mb-2"
            >
              Nome do Aluno ou Equipe
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="student-name-input"
                type="text"
                value={studentName}
                onChange={(e) => {
                  onChangeStudentName(e.target.value);
                  if (nameError && e.target.value.trim()) {
                    setNameError(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLaunch('arena');
                  }
                }}
                placeholder="Ex: Ana Clara & Lucas · Turma 1º Info"
                maxLength={60}
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 text-sm"
              />
            </div>
            {nameError && (
              <p role="alert" className="mt-2 text-xs font-medium text-rose-400">
                {nameError}
              </p>
            )}
          </div>

          {/* Seleção dos 2 Modos de Jogo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* MODO 1 */}
            <div className="group bg-slate-900/90 border border-slate-700/90 hover:border-emerald-500/70 rounded-xl p-6 flex flex-col justify-between transition-colors">
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-xs font-semibold text-emerald-400 tracking-wide">
                    MODO 1 · TREINO PARA A PROVA
                  </span>
                  <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0" />
                </div>
                <h2 className="font-display font-bold text-xl text-white mb-2">
                  Arena de Batalha Booleana
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed mb-5">
                  Enfrente Bugs de Compilação em 3 fases progressivas (&&, ||, !, parênteses e variáveis). Você tem 10s por questão e 3 cafés de energia.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
                <span className="text-xs text-slate-400 font-mono tabular-nums whitespace-nowrap">
                  {bestArenaScore > 0 ? `Recorde: ${bestArenaScore} pts` : '← TRUE · → FALSE'}
                </span>
                <button
                  type="button"
                  data-start="true"
                  onClick={() => handleLaunch('arena')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
                >
                  <span>Entrar na Arena</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* MODO 2 */}
            <div className="group bg-slate-900/90 border border-slate-700/90 hover:border-emerald-500/70 rounded-xl p-6 flex flex-col justify-between transition-colors">
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-xs font-semibold text-emerald-400 tracking-wide">
                    MODO 2 · HISTÓRIA INTERATIVA
                  </span>
                  <Terminal className="w-5 h-5 text-emerald-400 shrink-0" />
                </div>
                <h2 className="font-display font-bold text-xl text-white mb-2">
                  Aventura no Campus
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed mb-5">
                  Passe pelo Lab, Cantina, Biblioteca e Sala dos Professores gerenciando variáveis reais até entregar o trabalho no SIGAA/Moodle.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-mono tabular-nums">
                  <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{unlockedEndings.length}/4 finais</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleLaunch('campus')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/50 text-emerald-300 font-semibold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
                >
                  <span>Explorar Campus</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé limpo com dicas de controle */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-5 pt-2 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <span>Disciplina de Algoritmos e Lógica de Programação · IFPR</span>
        <span>Atalhos: ← TRUE · → FALSE · M Mutar · 100% no Navegador</span>
      </footer>
    </div>
  );
};
