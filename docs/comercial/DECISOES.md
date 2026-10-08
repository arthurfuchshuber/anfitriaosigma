# Decisões da Inteligência Comercial (atualizado 08/10/2026)

1. Peso = direcionador da distribuição da meta total; SEM teto por produto. Atingimento = total de pontos ÷ meta total. O Objetivo de Caixa é só o direcionamento final de onde a empresa quer chegar; os produtos são contabilizados por PONTOS (conversão de valores em pontos em "Valores e Pontos por Venda").
2. Distribuição: objetivo-alvo da empresa → peso de senioridade × nº de vendedores ativos por senioridade → meta individual em pontos (SEMPRE 100%; sem redução por rampa; sem sobra a redistribuir) → peso do produto → quantidade por produto.
3. Produto sem caixa: o campo Bruto é o mesmo do valor estimado (obrigatório); Líquido em branco = bruto. NÃO existe confirmação da venda pelo gestor: a venda segue o mesmo ciclo das demais (pagamento confirmado → prazo → validação automática).
4. "Corte" (dia 25) só serve à sugestão de metas pelo histórico dos últimos 3 meses.
5. Pontos realizados = valor LÍQUIDO real da venda. Venda mista (cartão + PIX + boleto/PIX parcelado + recorrência): conta SÓ o que foi pago no mês.
6. Degraus da régua: o usuário edita depois.
7. Cancelamento: prazo editável em dias corridos (padrão 7, Parâmetros > Operação), contado a partir do PRIMEIRO PAGAMENTO CONFIRMADO da venda (ex.: prazo 10 dias, 1º pagamento em 23/09 → termina em 03/10). Pagamentos posteriores da mesma venda NÃO abrem nova janela: valem a janela da venda. Venda cancelada no prazo sai do atingimento automaticamente. Pagamento do bônus (dia 10) editável.
8. Atingimento: do 1º ao último dia do mês, sem considerar dia útil.
9. Registro da venda detalha as formas de pagamento (várias na mesma venda), cada uma com líquido, parcelas, data e o que conta no mês (Confirmado ou Previsto).
10. Rampagem = GATILHO mínimo: Mês 1 70%, Mês 2 80%, Mês 3 90%, Mês 4 em diante 100%; vale sempre (inclusive veteranos). Meta continua 100%. MÊS DE ENTRADA: gatilho PROPORCIONAL = 70% × dias úteis restantes ÷ dias úteis do mês, contando o dia da entrada (ex.: entrada em 15/10, 12 de 21 dias úteis → 40%). Mês 1 é o mês seguinte ao da entrada.
11. Régua ancorada no gatilho: faixas abaixo de 100% descem junto. Para gatilho 100% a faixa 2 não existe (tudo ou nada). A aba Ganho tem seletor de gatilho (70/80/90/100%).
12. Quantidade por produto fecha SEMPRE exatamente 100% dos pontos: meta em pontos ÷ pontos por venda, vendas fracionadas (2 casas); a última quantidade absorve o resíduo. Time (30.000 pts): Gestão 10,50 · Marketing 0,77 · ConciergeIA 9,02 · Orks 3,34. Ana (7.500 pts): Gestão Parcial 2,67 · Marketing Cartão 0,19 · ConciergeIA 2,25 · Orks 0,83 (5,94 vendas).
13. Telas: só o dado (sem textos descritivos); títulos com iniciais maiúsculas; altura de cada tela = altura do conteúdo.
14. Bônus = salário fixo × atingimento AJUSTADO (atingimento base × fator da régua, como na planilha: "multiplicador extra sobre esse valor"). Sem teto. Ex.: 100% × 1,0 → bônus = salário; 150% × 1,6 → 240% do salário. A régua pode ser desligada (na planilha o padrão é desligada) ou ter os degraus editados.
15. Gatilho de 100% (veterano) = tudo ou nada. O gestor pode EDITAR manualmente o atingimento depois que o resultado do mês é congelado (com motivo obrigatório e histórico).
16. Meta individual sempre 100% para todos; rampagem muda só o gatilho mínimo.
17. Taxas por forma de pagamento ficam no PRODUTO. O valor líquido deve ser conciliado com as taxas do produto: quando há taxas, o líquido é corrigido por elas (ex.: Cartão 18.000 com taxa 13,3% → 15.606; recorrência no cartão 3.000 → 2.601; boleto 5.000 com 2,5% → 4.875). O líquido também pode ser digitado ao lado do bruto.
18. Recorrência: só o que é pago no mês vigente conta para a meta (intencional).
19. Entrada/saída de vendedor depois do dia 28 só vale a partir do mês seguinte.
20. Dados do vendedor só preenchidos pelo gestor ou admin.
21. Jornada do gestor: Menu → Produtos → Vendedores → Sugestão → Parâmetros (Meta, Pesos, Ganho, Operação, Projeção; "Salvar e Publicar" só no último passo) → Meses Programados. Vendedor: Registrar venda → validação → Calculadora/Painel.
22. Senioridades editáveis em Parâmetros > Meta (peso + salário padrão). Senioridade com vendedores ativos não pode ser excluída.
23. Salário do vendedor = salário padrão da senioridade; edição manual só pelo ADMIN.
24. Cancelamento dentro do prazo, ainda antes do congelamento, sai do atingimento do mês em que a venda foi registrada (mesmo que ocorra já no mês seguinte).
25. Bônus só é pago após a validação do atingimento (resultado congelado).
26. A Projeção mostra o custo do bônus por mês.
27. Mês em vigor já está travado (dia 28 do mês anterior): "Definir para" mostra Outubro bloqueado; existe o estado "Mês Travado" (Meta, Pesos, Ganho e Operação em somente leitura). Alterar mês travado: gestor pede, admin autoriza.
28. Mobile: toque ≥ 40–44 px, texto mínimo 11 px, cinza #6f6781.
29. A venda é registrada na data do PRIMEIRO PAGAMENTO confirmado, e é essa data que inicia o prazo de cancelamento e a validação; cada forma de pagamento de recebimento imediato é registrada com a sua data; só o pago no mês conta.
30. Só produtos com peso contam para a meta.
31. Operação mostra o calendário (dias úteis e feriados nacionais) de CADA mês selecionado em "Definir para" (nov/2026: 19; dez/2026: 22).
32. O prazo de cancelamento tem que ser MENOR que o dia de pagamento do bônus: o sistema BLOQUEIA o avanço se for igual ou maior (estado "Operação · Bloqueio"; com bônus no dia 10, máximo 9 dias).
33. Um produto pode ter mais de uma forma de cobrança (integral e recorrência), cadastrada pelo gestor; cada cobrança tem seu valor bruto e líquido e a meta é contabilizada proporcionalmente aos pontos de cada uma. Não há valor mínimo/máximo na venda: só bruto e líquido.
34. Parcelamento: CARTÃO de crédito, em qualquer número de parcelas, conta o valor líquido INTEGRAL (descontadas as taxas) no momento do pagamento. PIX à vista conta o líquido na hora. "Boleto | PIX Parcelado": conta só a parcela que cair no MESMO MÊS da venda, e SOMENTE quando for paga (antes disso aparece como "Previsto no Mês"; ao confirmar o pagamento passa a "Confirmado"). As demais parcelas nunca contam. O Produto configura "Permite Parcelar · Até Quantas Vezes" no cartão, no PIX e no boleto.
35. Ciclo da venda: Aguardando Pagamento → Em Prazo (pagamento confirmado, dentro do prazo de cancelamento) → Validada (automática). Cancelada é o estado alternativo. Só a venda com pagamento confirmado conta pontos. NÃO existe "Aguardando Gestor" nem botão "Confirmar Venda".
36. Confirmação do primeiro pagamento (com a data): VENDEDOR e GESTOR/ADMIN podem confirmar, inclusive em produto sem caixa.
37. Validação AUTOMÁTICA: sem mudança manual para "Cancelada", a venda vira "Validada" ao fim do SEU prazo de cancelamento. Até esse prazo final existe só o botão "Cancelar Venda", usado pelo próprio VENDEDOR, pelo GESTOR ou pelo ADMIN. CONGELAMENTO do resultado do mês, automático: às 23h59 do dia (final da validação − 3) (prazo 10 → dia 7; prazo 7 → dia 4). Sem prazo de validação, ou se o cálculo cair antes do mês virar (prazo de 3 dias ou menos), congela às 23h59 do último dia do mês. Aparece em Operação como "Congelamento do Resultado", logo abaixo do Fechamento do Mês.
38. Depois do congelamento, cancelamento (ainda dentro do prazo da venda) NÃO recalcula nada sozinho. O gestor decide caso a caso entre "Manter Resultado Congelado" e "Ajustar Manualmente" (motivo obrigatório, diferença do bônus calculada e histórico).
39. Parâmetros operacionais (prazo de cancelamento, dia do bônus, dia da folha, corte) e cadastros (vendedores, produtos, senioridades) são editáveis por GESTOR e ADMIN; o VENDEDOR não edita nenhum dos dois.
40. Visibilidade: gestor e admin veem e selecionam QUALQUER vendedor, incluindo "Todos" (tela 8a: resultado do time e o nome do vendedor em cada venda); o vendedor só seleciona o próprio nome (seletor "Vendedor" em Vendas, Registrar Venda e Calculadora).
41. Vendas mostra o aviso "Abaixo do Gatilho" quando o atingimento está abaixo do gatilho mínimo do vendedor e a data do próximo congelamento. A base do bônus é o atingimento no CONGELAMENTO (vendas confirmadas e não canceladas, inclusive as ainda Em Prazo), não só as validadas.
42. Vendedor: campos Data de Saída, Mês de Casa e Histórico de Alterações (salário, peso, senioridade e gatilho gravados por mês).
43. Registrar Venda mostra pontos Confirmados, Previsto no Mês e o efeito no atingimento do vendedor.
44. CONFIRMADO (08/10/2026): vendedor que sai no meio do mês — a meta dele NÃO é realocada e permanece na meta total do time; as vendas dele continuam contando no resultado do time.

## Em aberto
- Telas sem desenho (user: "ainda não"): Fechamento do Mês e Painéis (vendedor e gestor). O Menu não aponta para elas (o item Painel da barra inferior abre um placeholder).
- Estados sem desenho: detalhe de venda Validada e Cancelada; Operação com prazo ≤ 3 dias ("Último Dia do Mês · 23h59").
- Algoritmos não definidos nos mockups (premissas implementadas no banco, ajustáveis): Projeção (média de pontos por dia útil dos 2 últimos meses fechados + ritmo do mês corrente), Sugestão (+5 p.p. se ≥2 dos últimos 3 meses ≥100%; −5 p.p. se média <90%; senão mantém) e quantidades iniciais da Calculadora.
