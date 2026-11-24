export type ArenaPhase = 1 | 2 | 3;

export interface BugBoss {
  phase: ArenaPhase;
  name: string;
  subtitle: string;
  maxHp: number;
  damagePerHit: number;
  questionsToDefeat: number;
}

export interface BooleanQuestion {
  id: string;
  phase: ArenaPhase;
  expression: string;
  variables?: Record<string, number | boolean>;
  expectedAnswer: boolean;
  steps: string[];
}

export type TimerUrgency = 'normal' | 'warning' | 'critical';

export const QUESTION_DURATION_SECONDS = 10;
export const MAX_COFFEE_LIVES = 3;

export const PHASE_CONFIG: Record<ArenaPhase, BugBoss> = {
  1: {
    phase: 1,
    name: 'SyntaxError: Ponto e Vírgula',
    subtitle: 'Fase 1 · Básico (&&, ||, !)',
    maxHp: 90,
    damagePerHit: 30,
    questionsToDefeat: 3,
  },
  2: {
    phase: 2,
    name: 'PrecedenceBug: Parênteses Perdidos',
    subtitle: 'Fase 2 · Intermediário (Precedência)',
    maxHp: 100,
    damagePerHit: 25,
    questionsToDefeat: 4,
  },
  3: {
    phase: 3,
    name: 'NullPointer Boss: Prova Final',
    subtitle: 'Fase 3 · Estilo Prova (Variáveis e Relacionais)',
    maxHp: 125,
    damagePerHit: 25,
    questionsToDefeat: 5,
  },
};

export const QUESTION_BANK: BooleanQuestion[] = [
  // FASE 1: Operadores básicos &&, ||, !
  {
    id: 'p1_1',
    phase: 1,
    expression: 'true && !false',
    expectedAnswer: true,
    steps: [
      '1. Primeiro resolvemos a negação: !false resulta em true.',
      '2. A expressão fica: true && true.',
      '3. No operador E (&&), ambos precisam ser verdadeiros: true && true = true.',
    ],
  },
  {
    id: 'p1_2',
    phase: 1,
    expression: 'false || !true',
    expectedAnswer: false,
    steps: [
      '1. Primeiro resolvemos a negação: !true resulta em false.',
      '2. A expressão fica: false || false.',
      '3. No operador OU (||), como ambos são falsos, o resultado é false.',
    ],
  },
  {
    id: 'p1_3',
    phase: 1,
    expression: '!false || false',
    expectedAnswer: true,
    steps: [
      '1. Primeiro resolvemos !false, que resulta em true.',
      '2. A expressão fica: true || false.',
      '3. No operador OU (||), basta um lado ser true para resultar em true.',
    ],
  },
  {
    id: 'p1_4',
    phase: 1,
    expression: 'true && false || true',
    expectedAnswer: true,
    steps: [
      '1. O operador && tem precedência sobre ||: (true && false) resulta em false.',
      '2. A expressão fica: false || true.',
      '3. No operador OU (||), false || true resulta em true.',
    ],
  },
  {
    id: 'p1_5',
    phase: 1,
    expression: '!true && !false',
    expectedAnswer: false,
    steps: [
      '1. Resolvemos as negações: !true = false e !false = true.',
      '2. A expressão fica: false && true.',
      '3. No operador E (&&), basta um valor falso para resultar em false.',
    ],
  },
  {
    id: 'p1_6',
    phase: 1,
    expression: 'false || true && !false',
    expectedAnswer: true,
    steps: [
      '1. Resolvemos !false = true.',
      '2. O operador && executa antes do ||: true && true = true.',
      '3. Por fim, false || true resulta em true.',
    ],
  },

  // FASE 2: Precedência e parênteses
  {
    id: 'p2_1',
    phase: 2,
    expression: '!(true && false)',
    expectedAnswer: true,
    steps: [
      '1. Resolvemos primeiro o que está dentro dos parênteses: true && false = false.',
      '2. Aplicamos a negação fora dos parênteses: !false.',
      '3. !false resulta em true.',
    ],
  },
  {
    id: 'p2_2',
    phase: 2,
    expression: '(true && !false) || (false && true)',
    expectedAnswer: true,
    steps: [
      '1. Primeiro parêntese: !false = true, então true && true = true.',
      '2. Segundo parêntese: false && true = false.',
      '3. Combinando com OU: true || false resulta em true.',
    ],
  },
  {
    id: 'p2_3',
    phase: 2,
    expression: '!(true || false) && true',
    expectedAnswer: false,
    steps: [
      '1. Dentro dos parênteses: true || false = true.',
      '2. Aplicando a negação: !true = false.',
      '3. Por fim, false && true resulta em false.',
    ],
  },
  {
    id: 'p2_4',
    phase: 2,
    expression: '!(!true || false) && !false',
    expectedAnswer: true,
    steps: [
      '1. Dentro dos parênteses: !true = false, logo false || false = false.',
      '2. Negando os parênteses: !false = true.',
      '3. Do outro lado, !false = true. Então true && true resulta em true.',
    ],
  },
  {
    id: 'p2_5',
    phase: 2,
    expression: '(false || !false) && !(true || false)',
    expectedAnswer: false,
    steps: [
      '1. Primeiro parêntese: false || true = true.',
      '2. Segundo parêntese: true || false = true, e !true = false.',
      '3. Combinando com E: true && false resulta em false.',
    ],
  },
  {
    id: 'p2_6',
    phase: 2,
    expression: '!(false && !true) || false',
    expectedAnswer: true,
    steps: [
      '1. Dentro dos parênteses: !true = false, então false && false = false.',
      '2. Negando os parênteses: !false = true.',
      '3. Por fim, true || false resulta em true.',
    ],
  },

  // FASE 3: Estilo Prova (expressões mistas com números e variáveis)
  {
    id: 'p3_1',
    phase: 3,
    variables: { nota: 7, frequencia: 80, reprovado: false },
    expression: '(nota >= 6 && frequencia >= 75) || !reprovado',
    expectedAnswer: true,
    steps: [
      '1. nota >= 6 (7 >= 6) é true; frequencia >= 75 (80 >= 75) é true.',
      '2. O parêntese (true && true) resulta em true.',
      '3. !reprovado (!false) é true. Logo, true || true resulta em true.',
    ],
  },
  {
    id: 'p3_2',
    phase: 3,
    variables: { nota: 5, frequencia: 70, reprovado: true },
    expression: '(nota >= 6 && frequencia >= 75) || !reprovado',
    expectedAnswer: false,
    steps: [
      '1. nota >= 6 (5 >= 6) é false; frequencia >= 75 (70 >= 75) é false.',
      '2. O parêntese (false && false) resulta em false.',
      '3. !reprovado (!true) é false. Logo, false || false resulta em false.',
    ],
  },
  {
    id: 'p3_3',
    phase: 3,
    variables: { bateria: 15, carregador: false, modoEco: true },
    expression: '(bateria > 20 || carregador) && modoEco',
    expectedAnswer: false,
    steps: [
      '1. bateria > 20 (15 > 20) é false, e carregador é false.',
      '2. Dentro dos parênteses: false || false = false.',
      '3. Mesmo com modoEco = true, false && true resulta em false.',
    ],
  },
  {
    id: 'p3_4',
    phase: 3,
    variables: { faltas: 4, limiteFaltas: 10, entregouTrabalho: true },
    expression: '!(faltas > limiteFaltas) && entregouTrabalho',
    expectedAnswer: true,
    steps: [
      '1. faltas > limiteFaltas (4 > 10) é false.',
      '2. Negando os parênteses: !false = true.',
      '3. entregouTrabalho é true, portanto true && true resulta em true.',
    ],
  },
  {
    id: 'p3_5',
    phase: 3,
    variables: { idade: 16, autorizado: false, turmaIFPR: true },
    expression: '(idade >= 18 || autorizado) && turmaIFPR',
    expectedAnswer: false,
    steps: [
      '1. idade >= 18 (16 >= 18) é false; autorizado também é false.',
      '2. Logo, (false || false) resulta em false.',
      '3. false && true resulta em false.',
    ],
  },
  {
    id: 'p3_6',
    phase: 3,
    variables: { pontos: 85, bonus: 15, bugAtivo: false },
    expression: '(pontos + bonus >= 100) && !bugAtivo',
    expectedAnswer: true,
    steps: [
      '1. Somamos primeiro: pontos + bonus = 85 + 15 = 100.',
      '2. 100 >= 100 resulta em true.',
      '3. !bugAtivo (!false) é true. Portanto, true && true resulta em true.',
    ],
  },
  {
    id: 'p3_7',
    phase: 3,
    variables: { nota: 6, frequencia: 60, reprovado: true },
    expression: '(nota >= 6 && frequencia >= 75) && !reprovado',
    expectedAnswer: false,
    steps: [
      '1. nota >= 6 é true, mas frequencia >= 75 (60 >= 75) é false.',
      '2. O parêntese (true && false) resulta em false.',
      '3. !reprovado é false, e false && false resulta em false.',
    ],
  },
];

export function buildArenaDeck(randomize: boolean = true): BooleanQuestion[] {
  const deck: BooleanQuestion[] = [];
  ([1, 2, 3] as ArenaPhase[]).forEach((phase) => {
    const pool = QUESTION_BANK.filter((q) => q.phase === phase);
    const ordered = randomize
      ? [...pool].sort(() => Math.random() - 0.5)
      : [...pool];
    const count = PHASE_CONFIG[phase].questionsToDefeat;
    deck.push(...ordered.slice(0, count));
  });
  return deck;
}

export function getTimerUrgency(timeLeft: number): TimerUrgency {
  if (timeLeft <= 3) return 'critical';
  if (timeLeft <= 5.5) return 'warning';
  return 'normal';
}

export interface ArenaTurnResult {
  isCorrect: boolean;
  pointsEarned: number;
  damageDealt: number;
  newBugHp: number;
  newCoffeeLives: number;
  phaseCleared: boolean;
}

export function resolveArenaTurn(params: {
  question: BooleanQuestion;
  chosenAnswer: boolean | null; // null quando o tempo acaba
  timeLeft: number;
  bugHp: number;
  coffeeLives: number;
  streak: number;
}): ArenaTurnResult {
  const { question, chosenAnswer, timeLeft, bugHp, coffeeLives, streak } = params;
  const boss = PHASE_CONFIG[question.phase];
  const isCorrect = chosenAnswer !== null && chosenAnswer === question.expectedAnswer;

  if (isCorrect) {
    const speedBonus = Math.round(Math.max(0, timeLeft) * 12);
    const streakBonus = streak * 25;
    const pointsEarned = 100 + speedBonus + streakBonus;
    const newBugHp = Math.max(0, bugHp - boss.damagePerHit);
    return {
      isCorrect: true,
      pointsEarned,
      damageDealt: boss.damagePerHit,
      newBugHp,
      newCoffeeLives: coffeeLives,
      phaseCleared: newBugHp === 0,
    };
  }

  return {
    isCorrect: false,
    pointsEarned: 0,
    damageDealt: 0,
    newBugHp: bugHp,
    newCoffeeLives: Math.max(0, coffeeLives - 1),
    phaseCleared: false,
  };
}
