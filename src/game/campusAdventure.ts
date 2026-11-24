export type EndingId = 'nota_10' | 'ultimo_segundo' | 'tela_azul' | 'loop_infinito';

export interface CampusState {
  pendriveSalvo: boolean;
  bateriaNotebook: number;
  internetLabFuncionando: boolean;
  tomouCafe: boolean;
  minutosRestantes: number;
  progressoTrabalho: number;
  sceneId: string;
  endingId: EndingId | null;
  log: string[];
}

export interface CampusChoice {
  id: string;
  label: string;
  codeSnippet: string;
  isAvailable?: (state: CampusState) => boolean;
  unavailableReason?: string;
  resolve: (state: CampusState) => {
    nextSceneId?: string;
    endingId?: EndingId;
    updates: Partial<CampusState>;
    logEntry: string;
  };
}

export interface CampusScene {
  id: string;
  location: string;
  title: string;
  narrative: (state: CampusState) => string;
  choices: CampusChoice[];
}

export interface CampusEnding {
  id: EndingId;
  title: string;
  badge: string;
  gradeLabel: string;
  summary: string;
  lesson: string;
  tone: 'emerald' | 'amber' | 'rose' | 'violet';
}

export const INITIAL_CAMPUS_STATE: CampusState = {
  pendriveSalvo: false,
  bateriaNotebook: 100,
  internetLabFuncionando: true,
  tomouCafe: false,
  minutosRestantes: 20,
  progressoTrabalho: 70,
  sceneId: 'entrada_bloco',
  endingId: null,
  log: ['23:40 — Você abriu o terminal no campus do IFPR para finalizar o trabalho de Lógica.'],
};

export const CAMPUS_ENDINGS: Record<EndingId, CampusEnding> = {
  nota_10: {
    id: 'nota_10',
    title: 'Final Nota 10',
    badge: 'SUCESSO ABSOLUTO',
    gradeLabel: 'Nota: 10,0 · Aprovado com louvor',
    summary:
      'Você salvou o código no pendrive, manteve a bateria carregada, garantiu a conexão e enviou o algoritmo no SIGAA/Moodle sem nenhum bug antes do prazo!',
    lesson:
      'Na vida e na programação: backup (pendriveSalvo) + energia + validação de condições garantem execução sem exceções.',
    tone: 'emerald',
  },
  ultimo_segundo: {
    id: 'ultimo_segundo',
    title: 'Final Salvamento de Último Segundo',
    badge: 'POR UM TRIZ',
    gradeLabel: 'Nota: 8,5 · Enviado às 23:59',
    summary:
      'Faltava apenas 1 minuto no relógio do Moodle! Mesmo enfrentando imprevistos de conexão ou bateria baixa, sua decisão rápida salvou o envio no limite.',
    lesson:
      'Estruturas condicionais bem aplicadas evitam que um único imprevisto derrube todo o fluxo do algoritmo.',
    tone: 'amber',
  },
  tela_azul: {
    id: 'tela_azul',
    title: 'Final Tela Azul',
    badge: 'EXCEÇÃO CRÍTICA',
    gradeLabel: 'Nota: 0,0 · Código perdido',
    summary:
      'O sistema travou ou a bateria zerou antes de você salvar no pendrive. Sem backup e sem tempo restante, a entrega no SIGAA/Moodle expirou.',
    lesson:
      'Nunca execute operações arriscadas quando pendriveSalvo == false ou bateriaNotebook <= 10. Salve antes de testar!',
    tone: 'rose',
  },
  loop_infinito: {
    id: 'loop_infinito',
    title: 'Final Loop Infinito',
    badge: 'WHILE (TRUE)',
    gradeLabel: 'Nota: 2,0 · Tempo esgotado',
    summary:
      'Você ficou preso procurando um ponto e vírgula fantasma sem atualizar a condição de parada. O relógio bateu 00:00 e o Moodle fechou.',
    lesson:
      'Todo laço precisa de uma condição de saída clara. Sem descanso ou revisão estruturada, é fácil cair em um loop infinito.',
    tone: 'violet',
  },
};

export const CAMPUS_SCENES: Record<string, CampusScene> = {
  entrada_bloco: {
    id: 'entrada_bloco',
    location: 'Bloco de Informática · IFPR',
    title: 'O Prazo Final no SIGAA/Moodle',
    narrative: () =>
      'São 23h40. O trabalho final de Algoritmos e Lógica de Programação fecha às 00h00 no Moodle. Seu notebook está com 100% de bateria, mas o código ainda está só na memória RAM e faltam ajustes finais.',
    choices: [
      {
        id: 'ir_lab',
        label: 'Subir direto para o Laboratório de Informática 02',
        codeSnippet: 'if (minutosRestantes > 10) {\n  destino = "lab_informatica";\n}',
        resolve: (s) => ({
          nextSceneId: 'lab_informatica',
          updates: {
            minutosRestantes: Math.max(1, s.minutosRestantes - 3),
            bateriaNotebook: Math.max(0, s.bateriaNotebook - 15),
          },
          logEntry: 'Você subiu para o Lab 02 (-3 min, bateria -15%).',
        }),
      },
      {
        id: 'ir_cantina',
        label: 'Passar rápido na Cantina para tomar um café e focar',
        codeSnippet: 'if (!tomouCafe) {\n  destino = "cantina_ifpr";\n}',
        resolve: (s) => ({
          nextSceneId: 'cantina_ifpr',
          updates: {
            minutosRestantes: Math.max(1, s.minutosRestantes - 4),
            bateriaNotebook: Math.max(0, s.bateriaNotebook - 10),
          },
          logEntry: 'Você decidiu ir até a Cantina do IFPR (-4 min).',
        }),
      },
      {
        id: 'ir_patio',
        label: 'Parar no Pátio Central para revisar com um colega',
        codeSnippet: 'switch (escolha) {\n  case "patio": revisarComColega(); break;\n}',
        resolve: (s) => ({
          nextSceneId: 'patio_central',
          updates: {
            minutosRestantes: Math.max(1, s.minutosRestantes - 3),
            bateriaNotebook: Math.max(0, s.bateriaNotebook - 15),
          },
          logEntry: 'Você foi ao Pátio Central revisar o algoritmo (-3 min).',
        }),
      },
    ],
  },

  cantina_ifpr: {
    id: 'cantina_ifpr',
    location: 'Cantina do Campus',
    title: 'A Fila do Café Estratégico',
    narrative: () =>
      'A cantina está quase fechando, mas ainda há café passado na hora e pão de queijo. Tomar café melhora sua atenção para achar bugs de lógica, porém consome alguns minutos do relógio.',
    choices: [
      {
        id: 'pedir_cafe',
        label: 'Pedir um café expresso para manter o foco',
        codeSnippet: 'switch (pedido) {\n  case "cafe": tomouCafe = true; break;\n}',
        resolve: (s) => ({
          nextSceneId: 'lab_informatica',
          updates: {
            tomouCafe: true,
            minutosRestantes: Math.max(1, s.minutosRestantes - 3),
            bateriaNotebook: Math.max(0, s.bateriaNotebook - 10),
          },
          logEntry: 'Café tomado! tomouCafe = true. Você seguiu para o Lab 02.',
        }),
      },
      {
        id: 'pular_fila',
        label: 'Desistir da fila e correr para a Biblioteca',
        codeSnippet: 'if (filaGrande) {\n  irPara("biblioteca");\n}',
        resolve: (s) => ({
          nextSceneId: 'biblioteca',
          updates: {
            minutosRestantes: Math.max(1, s.minutosRestantes - 2),
            bateriaNotebook: Math.max(0, s.bateriaNotebook - 10),
          },
          logEntry: 'Você saiu da fila sem café e seguiu para a Biblioteca (-2 min).',
        }),
      },
    ],
  },

  patio_central: {
    id: 'patio_central',
    location: 'Pátio Central do Campus',
    title: 'Backup em Grupo e Bateria Caindo',
    narrative: () =>
      'Seu colega está terminando um fluxograma e te lembra: "Você já salvou seu código no pendrive? O Lab 02 às vezes cai a rede!". Seu notebook avisa que o compilador pesado está drenando bateria.',
    choices: [
      {
        id: 'salvar_pendrive_patio',
        label: 'Conectar o pendrive agora e fazer backup do projeto',
        codeSnippet: 'if (!pendriveSalvo) {\n  pendriveSalvo = true; // backup seguro\n}',
        resolve: (s) => ({
          nextSceneId: 'sala_professores',
          updates: {
            pendriveSalvo: true,
            progressoTrabalho: Math.min(100, s.progressoTrabalho + 10),
            minutosRestantes: Math.max(1, s.minutosRestantes - 3),
            bateriaNotebook: Math.max(0, s.bateriaNotebook - 20),
          },
          logEntry: 'Backup salvo no pendrive! pendriveSalvo = true.',
        }),
      },
      {
        id: 'ignorar_backup_patio',
        label: 'Deixar para salvar depois e correr para o Lab 02',
        codeSnippet: 'if (pressa) {\n  salvarDepois(); // risco alto\n}',
        resolve: (s) => ({
          nextSceneId: 'lab_informatica',
          updates: {
            minutosRestantes: Math.max(1, s.minutosRestantes - 2),
            bateriaNotebook: Math.max(0, s.bateriaNotebook - 20),
          },
          logEntry: 'Você correu para o Lab 02 sem salvar no pendrive.',
        }),
      },
    ],
  },

  lab_informatica: {
    id: 'lab_informatica',
    location: 'Laboratório de Informática 02',
    title: 'Oscilação na Rede do Laboratório',
    narrative: (s) =>
      `Você entra no Lab 02. ${
        s.tomouCafe
          ? 'Com o café na veia, você percebe rápido que o cabo de rede do laboratório piscou em vermelho!'
          : 'O cansaço bate forte e de repente o ícone de Wi-Fi do Lab exibe "Sem conexão"!'
      } Além disso, o compilador acusou um alerta na linha 42 do seu algoritmo.`,
    choices: [
      {
        id: 'salvar_antes_compilar',
        label: 'Salvar imediatamente no pendrive e investigar o alerta',
        codeSnippet: 'if (!pendriveSalvo) {\n  pendriveSalvo = true;\n} else {\n  validarAlerta();\n}',
        resolve: (s) => ({
          nextSceneId: 'sala_professores',
          updates: {
            pendriveSalvo: true,
            internetLabFuncionando: false,
            progressoTrabalho: Math.min(100, s.progressoTrabalho + 15),
            minutosRestantes: Math.max(1, s.minutosRestantes - 3),
            bateriaNotebook: Math.max(0, s.bateriaNotebook - 25),
          },
          logEntry: 'Código salvo no pendrive! Rede do Lab caiu (internetLabFuncionando = false).',
        }),
      },
      {
        id: 'debugar_sem_salvar',
        label: 'Ignorar o backup e tentar corrigir o ponto e vírgula na hora',
        codeSnippet: 'while (temErroSintaxe) {\n  procurarPontoEVirgula();\n}',
        resolve: (s) => ({
          nextSceneId: 'mesa_debug',
          updates: {
            internetLabFuncionando: false,
            minutosRestantes: Math.max(1, s.minutosRestantes - 5),
            bateriaNotebook: Math.max(0, s.bateriaNotebook - 35),
          },
          logEntry: 'Você começou a debugar sem salvar. Bateria caiu bastante!',
        }),
      },
      {
        id: 'ir_biblioteca_lab',
        label: 'Fechar o notebook e correr para a Biblioteca em busca de Wi-Fi',
        codeSnippet: 'if (!internetLabFuncionando) {\n  trocarLocal("biblioteca");\n}',
        resolve: (s) => ({
          nextSceneId: 'biblioteca',
          updates: {
            internetLabFuncionando: false,
            minutosRestantes: Math.max(1, s.minutosRestantes - 3),
            bateriaNotebook: Math.max(0, s.bateriaNotebook - 20),
          },
          logEntry: 'Rede do Lab falhou. Você partiu para a Biblioteca.',
        }),
      },
    ],
  },

  mesa_debug: {
    id: 'mesa_debug',
    location: 'Bancada 07 · Lab de Informática',
    title: 'Armadilha do Ponto e Vírgula Fantasma',
    narrative: (s) =>
      `O código não compila! Sua bateria está em ${s.bateriaNotebook}% e o relógio aponta apenas ${s.minutosRestantes} minutos restantes. Você ainda está olhando para um bloco "else" desalinhado.`,
    choices: [
      {
        id: 'continuar_loop_debug',
        label: 'Insistir linha por linha até encontrar o ponto e vírgula',
        codeSnippet: 'while (true) {\n  revisarLinha42(); // sem break!\n}',
        resolve: () => ({
          endingId: 'loop_infinito',
          updates: {
            minutosRestantes: 0,
          },
          logEntry: 'Você ficou preso no debug até 00:00 — Loop Infinito!',
        }),
      },
      {
        id: 'parar_e_pedir_ajuda',
        label: 'Usar break no debug, salvar no pendrive e ir à Sala dos Professores',
        codeSnippet: 'if (tempoCritico) {\n  pendriveSalvo = true;\n  break;\n}',
        resolve: (s) => ({
          nextSceneId: 'sala_professores',
          updates: {
            pendriveSalvo: true,
            progressoTrabalho: Math.min(100, s.progressoTrabalho + 15),
            minutosRestantes: Math.max(1, s.minutosRestantes - 3),
            bateriaNotebook: Math.max(0, s.bateriaNotebook - 15),
          },
          logEntry: 'Você interrompeu o loop, salvou no pendrive e foi pedir ajuda.',
        }),
      },
    ],
  },

  biblioteca: {
    id: 'biblioteca',
    location: 'Biblioteca do IFPR',
    title: 'Tomada Livre e Rede Eduroam',
    narrative: (s) =>
      `A Biblioteca está silenciosa e há uma tomada livre! A bateria do notebook está em ${s.bateriaNotebook}%. Você pode recarregar o equipamento e estabilizar o projeto.`,
    choices: [
      {
        id: 'plug_tomada_e_salvar',
        label: 'Conectar na tomada, salvar no pendrive e conectar no Wi-Fi',
        codeSnippet: 'bateriaNotebook = 100;\npendriveSalvo = true;\ninternetLabFuncionando = true;',
        resolve: (s) => ({
          nextSceneId: 'revisao_final',
          updates: {
            bateriaNotebook: 100,
            pendriveSalvo: true,
            internetLabFuncionando: true,
            progressoTrabalho: Math.min(100, s.progressoTrabalho + 20),
            minutosRestantes: Math.max(1, s.minutosRestantes - 3),
          },
          logEntry: 'Notebook carregado (100%), pendrive salvo e Wi-Fi conectado!',
        }),
      },
      {
        id: 'enviar_sem_carregar',
        label: 'Economizar tempo: só usar o Wi-Fi e pular a tomada',
        codeSnippet: 'if (bateriaNotebook > 15) {\n  internetLabFuncionando = true;\n}',
        resolve: (s) => ({
          nextSceneId: 'corredor_cpd',
          updates: {
            internetLabFuncionando: true,
            bateriaNotebook: Math.max(0, s.bateriaNotebook - 25),
            minutosRestantes: Math.max(1, s.minutosRestantes - 2),
          },
          logEntry: 'Você conectou no Wi-Fi sem carregar o notebook.',
        }),
      },
    ],
  },

  sala_professores: {
    id: 'sala_professores',
    location: 'Sala dos Professores · Bloco Tech',
    title: 'Orientação Relâmpago de Lógica',
    narrative: (s) =>
      `O professor de Algoritmos ainda está fechando o diário e olha seu código rapidamente: "Atenção na condição composta do seu switch/case! ${
        s.pendriveSalvo
          ? 'Que bom que já salvou no pendrive!'
          : 'Cuidado, você ainda não fez backup!'
      }"`,
    choices: [
      {
        id: 'aplicar_dica_professor',
        label: 'Corrigir a condição do switch/case e ir para a Biblioteca/Rede',
        codeSnippet: 'switch (casoTeste) {\n  case 1: validarSaida(); break;\n  default: tratarErro();\n}',
        resolve: (s) => ({
          nextSceneId: 'corredor_cpd',
          updates: {
            progressoTrabalho: 100,
            minutosRestantes: Math.max(1, s.minutosRestantes - 3),
            bateriaNotebook: Math.max(0, s.bateriaNotebook - 15),
          },
          logEntry: 'Lógica corrigida com orientação do professor! Trabalho 100%.',
        }),
      },
      {
        id: 'correr_terminal_direto',
        label: 'Agradecer e correr direto para o Terminal de Entrega',
        codeSnippet: 'if (progressoTrabalho >= 85) {\n  irPara("terminal_entrega");\n}',
        resolve: (s) => ({
          nextSceneId: 'terminal_entrega',
          updates: {
            progressoTrabalho: Math.min(100, s.progressoTrabalho + 15),
            minutosRestantes: Math.max(1, s.minutosRestantes - 2),
            bateriaNotebook: Math.max(0, s.bateriaNotebook - 15),
          },
          logEntry: 'Você seguiu direto para o Terminal do SIGAA/Moodle.',
        }),
      },
    ],
  },

  corredor_cpd: {
    id: 'corredor_cpd',
    location: 'Corredor do CPD · Rede do Campus',
    title: 'Ponto de Rede Estável ou Roteador 4G',
    narrative: (s) =>
      `No caminho para enviar o arquivo, você encontra um ponto de cabo Ethernet no corredor do CPD. Seu notebook marca ${s.bateriaNotebook}% de bateria e restam ${s.minutosRestantes} min.`,
    choices: [
      {
        id: 'usar_cabo_cpd',
        label: 'Plugar o cabo de rede do CPD e garantir o arquivo salvo',
        codeSnippet: 'internetLabFuncionando = true;\nif (!pendriveSalvo) pendriveSalvo = true;',
        resolve: (s) => ({
          nextSceneId: 'revisao_final',
          updates: {
            internetLabFuncionando: true,
            pendriveSalvo: true,
            progressoTrabalho: 100,
            minutosRestantes: Math.max(1, s.minutosRestantes - 2),
            bateriaNotebook: Math.max(0, s.bateriaNotebook - 10),
          },
          logEntry: 'Conexão cabeada estável e backup confirmado!',
        }),
      },
      {
        id: 'usar_4g_rapido',
        label: 'Rotear 4G do celular e pular direto para o envio',
        codeSnippet: 'if (sinal4G) {\n  internetLabFuncionando = true;\n}',
        resolve: (s) => ({
          nextSceneId: 'terminal_entrega',
          updates: {
            internetLabFuncionando: true,
            minutosRestantes: Math.max(1, s.minutosRestantes - 1),
            bateriaNotebook: Math.max(0, s.bateriaNotebook - 15),
          },
          logEntry: 'Você ativou o roteador 4G e abriu o SIGAA/Moodle.',
        }),
      },
    ],
  },

  revisao_final: {
    id: 'revisao_final',
    location: 'Área de Revisão · Moodle IFPR',
    title: 'Checklist Antes do Upload',
    narrative: (s) =>
      `O relógio marca ${s.minutosRestantes} min para o encerramento. Todos os testes unitários passaram no terminal. Falta apenas confirmar o envio final no portal acadêmico.`,
    choices: [
      {
        id: 'ir_para_terminal_agora',
        label: 'Abrir o Terminal de Entrega SIGAA/Moodle agora',
        codeSnippet: 'if (pendriveSalvo && internetLabFuncionando) {\n  abrirEntrega();\n}',
        resolve: (s) => ({
          nextSceneId: 'terminal_entrega',
          updates: {
            progressoTrabalho: 100,
            minutosRestantes: Math.max(1, s.minutosRestantes - 1),
          },
          logEntry: 'Portal SIGAA/Moodle carregado com sucesso.',
        }),
      },
      {
        id: 'otimizar_mais_um_pouco',
        label: 'Fazer uma última refatoração arriscada sem necessidade',
        codeSnippet: 'if (perfeccionismo) {\n  refatorarDeUltimaHora();\n}',
        resolve: () => ({
          endingId: 'loop_infinito',
          updates: {
            minutosRestantes: 0,
          },
          logEntry: 'Você quebrou o código na refatoração final e caiu num loop até 00:00.',
        }),
      },
    ],
  },

  terminal_entrega: {
    id: 'terminal_entrega',
    location: 'Portal SIGAA / Moodle · Envio Final',
    title: 'Submissão do Trabalho de Lógica',
    narrative: (s) =>
      `A tela de envio está aberta! Status atual: pendriveSalvo=${s.pendriveSalvo}, bateriaNotebook=${s.bateriaNotebook}%, internet=${s.internetLabFuncionando}, tomouCafe=${s.tomouCafe}. Restam ${s.minutosRestantes} minutos.`,
    choices: [
      {
        id: 'executar_envio_seguro',
        label: 'Executar script de validação e enviar trabalho no Moodle',
        codeSnippet:
          'if (pendriveSalvo && internetLabFuncionando && bateriaNotebook > 0) {\n  if (tomouCafe && minutosRestantes >= 3) return "NOTA_10";\n  return "ULTIMO_SEGUNDO";\n} else {\n  return "TELA_AZUL";\n}',
        resolve: (s) => {
          if (!s.pendriveSalvo || s.bateriaNotebook <= 0 || !s.internetLabFuncionando) {
            return {
              endingId: 'tela_azul',
              updates: {
                bateriaNotebook: !s.pendriveSalvo ? 0 : s.bateriaNotebook,
                minutosRestantes: 0,
              },
              logEntry:
                'Falha crítica no envio! Sem backup ou sem conexão/bateria, o sistema deu Tela Azul.',
            };
          }
          if (s.tomouCafe && s.minutosRestantes >= 3 && s.progressoTrabalho >= 90) {
            return {
              endingId: 'nota_10',
              updates: {},
              logEntry: 'Entrega confirmada com sucesso no Moodle! Nota 10!',
            };
          }
          return {
            endingId: 'ultimo_segundo',
            updates: {
              minutosRestantes: 1,
            },
            logEntry: 'Upload concluído faltando 1 minuto no relógio!',
          };
        },
      },
      {
        id: 'forcar_envio_sem_validar',
        label: 'Enviar arquivo direto da memória RAM sem checar backup',
        codeSnippet:
          'if (!pendriveSalvo) {\n  lancarExcecao("TelaAzulError");\n}',
        resolve: (s) => {
          if (!s.pendriveSalvo) {
            return {
              endingId: 'tela_azul',
              updates: { bateriaNotebook: 0, minutosRestantes: 0 },
              logEntry: 'O navegador travou e seu arquivo não salvo foi perdido!',
            };
          }
          return {
            endingId: 'ultimo_segundo',
            updates: { minutosRestantes: 1 },
            logEntry: 'Apesar do susto, o arquivo do pendrive salvou sua nota aos 45 do segundo tempo!',
          };
        },
      },
    ],
  },
};

export function applyCampusChoice(state: CampusState, choiceId: string): CampusState {
  const scene = CAMPUS_SCENES[state.sceneId];
  if (!scene) return state;
  const choice = scene.choices.find((c) => c.id === choiceId);
  if (!choice) return state;

  const result = choice.resolve(state);
  return {
    ...state,
    ...result.updates,
    sceneId: result.nextSceneId ?? state.sceneId,
    endingId: result.endingId ?? null,
    log: [...state.log, result.logEntry],
  };
}
