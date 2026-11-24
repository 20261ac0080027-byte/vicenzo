import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CAMPUS_SCENES,
  CAMPUS_ENDINGS,
  INITIAL_CAMPUS_STATE,
  applyCampusChoice,
} from './campusAdventure';

test('aventura possui pelo menos 8 cenas conectadas e todos os destinos são válidos', () => {
  const sceneIds = Object.keys(CAMPUS_SCENES);
  assert.ok(sceneIds.length >= 8, `Esperado >= 8 cenas, encontrado ${sceneIds.length}`);

  for (const scene of Object.values(CAMPUS_SCENES)) {
    assert.ok(scene.choices.length >= 2 && scene.choices.length <= 3);
    for (const choice of scene.choices) {
      assert.ok(choice.codeSnippet.length > 0);
      const res = choice.resolve(INITIAL_CAMPUS_STATE);
      if (res.nextSceneId) {
        assert.ok(
          CAMPUS_SCENES[res.nextSceneId],
          `Cena destino inválida: ${res.nextSceneId}`
        );
      }
      if (res.endingId) {
        assert.ok(
          CAMPUS_ENDINGS[res.endingId],
          `Final inválido: ${res.endingId}`
        );
      }
    }
  }
});

test('todos os 4 finais são alcançáveis pelas decisões da história', () => {
  // 1. Final Nota 10: Cantina (café) -> Lab (salva pendrive) -> Sala Prof -> Corredor CPD -> Revisão -> Terminal
  let s1 = { ...INITIAL_CAMPUS_STATE };
  s1 = applyCampusChoice(s1, 'ir_cantina');
  assert.equal(s1.sceneId, 'cantina_ifpr');
  s1 = applyCampusChoice(s1, 'pedir_cafe');
  assert.equal(s1.tomouCafe, true);
  s1 = applyCampusChoice(s1, 'salvar_antes_compilar');
  assert.equal(s1.pendriveSalvo, true);
  s1 = applyCampusChoice(s1, 'aplicar_dica_professor');
  s1 = applyCampusChoice(s1, 'usar_cabo_cpd');
  s1 = applyCampusChoice(s1, 'ir_para_terminal_agora');
  s1 = applyCampusChoice(s1, 'executar_envio_seguro');
  assert.equal(s1.endingId, 'nota_10');

  // 2. Final Salvamento de Último Segundo (sem café, mas salvou e tem internet)
  let s2 = { ...INITIAL_CAMPUS_STATE };
  s2 = applyCampusChoice(s2, 'ir_patio');
  s2 = applyCampusChoice(s2, 'salvar_pendrive_patio');
  s2 = applyCampusChoice(s2, 'correr_terminal_direto');
  s2 = applyCampusChoice(s2, 'executar_envio_seguro');
  assert.equal(s2.endingId, 'ultimo_segundo');

  // 3. Final Tela Azul (não salvou no pendrive e forçou envio)
  let s3 = { ...INITIAL_CAMPUS_STATE };
  s3 = applyCampusChoice(s3, 'ir_patio');
  s3 = applyCampusChoice(s3, 'ignorar_backup_patio');
  s3 = applyCampusChoice(s3, 'ir_biblioteca_lab');
  s3 = applyCampusChoice(s3, 'enviar_sem_carregar');
  s3 = applyCampusChoice(s3, 'usar_4g_rapido');
  s3 = applyCampusChoice(s3, 'forcar_envio_sem_validar');
  assert.equal(s3.endingId, 'tela_azul');

  // 4. Final Loop Infinito (debugar sem salvar e insistir no while true)
  let s4 = { ...INITIAL_CAMPUS_STATE };
  s4 = applyCampusChoice(s4, 'ir_lab');
  s4 = applyCampusChoice(s4, 'debugar_sem_salvar');
  s4 = applyCampusChoice(s4, 'continuar_loop_debug');
  assert.equal(s4.endingId, 'loop_infinito');
});
