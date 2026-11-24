import { useCallback, useEffect, useState } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { BooleanArenaMode } from './components/BooleanArenaMode';
import { CampusAdventureMode } from './components/CampusAdventureMode';
import { EndingId } from './game/campusAdventure';
import { soundEngine } from './utils/sound';

type AppScreen = 'title' | 'arena' | 'campus';

const STORAGE_ENDINGS_KEY = 'ifpr_logicquest_endings';
const STORAGE_SCORE_KEY = 'ifpr_logicquest_best_score';
const STORAGE_NAME_KEY = 'ifpr_logicquest_student_name';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('title');
  const [studentName, setStudentName] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_NAME_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [muted, setMuted] = useState<boolean>(false);
  const [unlockedEndings, setUnlockedEndings] = useState<EndingId[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_ENDINGS_KEY);
      return raw ? (JSON.parse(raw) as EndingId[]) : [];
    } catch {
      return [];
    }
  });
  const [bestArenaScore, setBestArenaScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem(STORAGE_SCORE_KEY) ?? 0);
    } catch {
      return 0;
    }
  });

  // Suporte a ?autostart=1 (para pular diretamente para a tela principal do jogo)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      if (!studentName.trim()) {
        setStudentName('Equipe IFPR 1º Ano');
      }
      const modeParam = params.get('mode');
      setScreen(modeParam === 'campus' ? 'campus' : 'arena');
    }
  }, []);

  useEffect(() => {
    if (screen === 'title') {
      document.body.dataset.state = 'title';
    }
  }, [screen]);

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      return next;
    });
  }, []);

  // Atalho global 'M' para mutar/desmutar (quando não estiver digitando em input)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleToggleMute]);

  const handleChangeStudentName = (name: string) => {
    setStudentName(name);
    try {
      localStorage.setItem(STORAGE_NAME_KEY, name);
    } catch {
      // Ignorar erro de storage
    }
  };

  const handleStartMode = (mode: 'arena' | 'campus') => {
    soundEngine.playClick();
    setScreen(mode);
  };

  const handleUnlockEnding = (endingId: EndingId) => {
    setUnlockedEndings((prev) => {
      if (prev.includes(endingId)) return prev;
      const next = [...prev, endingId];
      try {
        localStorage.setItem(STORAGE_ENDINGS_KEY, JSON.stringify(next));
      } catch {
        // Ignorar
      }
      return next;
    });
  };

  const handleSaveBestScore = (score: number) => {
    setBestArenaScore((prev) => {
      const next = Math.max(prev, score);
      try {
        localStorage.setItem(STORAGE_SCORE_KEY, String(next));
      } catch {
        // Ignorar
      }
      return next;
    });
  };

  if (screen === 'arena') {
    return (
      <BooleanArenaMode
        studentName={studentName.trim() || 'Aluno IFPR'}
        muted={muted}
        onToggleMute={handleToggleMute}
        onExitToTitle={() => setScreen('title')}
        onSaveBestScore={handleSaveBestScore}
      />
    );
  }

  if (screen === 'campus') {
    return (
      <CampusAdventureMode
        studentName={studentName.trim() || 'Calouro IFPR'}
        muted={muted}
        onToggleMute={handleToggleMute}
        onExitToTitle={() => setScreen('title')}
        unlockedEndings={unlockedEndings}
        onUnlockEnding={handleUnlockEnding}
      />
    );
  }

  return (
    <TitleScreen
      studentName={studentName}
      onChangeStudentName={handleChangeStudentName}
      onStartMode={handleStartMode}
      muted={muted}
      onToggleMute={handleToggleMute}
      unlockedEndings={unlockedEndings}
      bestArenaScore={bestArenaScore}
    />
  );
}
