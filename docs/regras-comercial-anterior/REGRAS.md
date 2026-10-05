# Regras de negócio do sistema Comercial anterior

Arquivo de consulta para discutirmos **antes** de desenhar o sistema novo. Nada aqui está sendo aplicado em tela: as telas foram apagadas. As regras seguem gravadas no banco (`supabase/migrations`) e copiadas ao lado: `motor-sql-referencia.sql` (cálculo) e `calc-front-referencia.ts` (simulação no front).

## 1. Quem usa

- Três papéis: **closer** (vendedor), **gestor** e **admin**. O primeiro acesso de `sigma@anfitriaosigma.com.br` vira admin com todas as áreas.
- Só e-mails `@anfitriaosigma.com.br` entram (barrado no banco).
- Cada área da Intranet exige acesso. Quem não tem **solicita**, o gestor é avisado por e-mail e **aprova ou nega**. Gestor/admin entram direto.
- Gestor vê CPF/CNPJ/RG/PIX/banco **mascarados**; só o dono altera.
- Log de auditoria **imutável** (login, telas acessadas, exportações, alterações).

## 2. Parâmetros (com vigência por data)

| Parâmetro | Valor inicial | Para que serve |
|---|---|---|
| `multiplo` | 6,5 | Múltiplo-base do time |
| `fator_base` | 2 | Fator na fórmula da meta (salário × 2) |
| `ajuste_historico` | 0 (desligado) | Liga o ajuste automático do múltiplo pelo histórico |
| `ajuste_min` / `ajuste_max` | 0,9 / 1,25 | Limites do ajuste mensal do múltiplo |
| `dias_validar` | 10 | Dias até uma venda pendente virar validada |
| `dia_corte` | 25 | Dia em que a meta do mês seguinte pode ser fechada |
| `limite_comissao` | 15% | Teto de Comissão ÷ caixa (gera alerta) |
| `rampa_entrada` / `m1` / `m2` / `m3` | 70% / 80% / 90% / 100% | Rampa de novos vendedores |
| `retroativo_dias` | 20 | Quantos dias para trás se pode lançar uma venda |

Feriados nacionais 2026 e 2027 ficam em tabela e entram na contagem de dias úteis.

## 3. Produtos (com vigência por mês)

Cada produto tem, por vigência: **pontos**, **piso** (preço mínimo) e **% de caixa** (parte do valor que entra em caixa). Alterar vale "já neste mês" ou "a partir do mês seguinte".

| Produto | Recorrente | Pontos | Piso | % caixa |
|---|---|---|---|---|
| Gestão Completa | sim | 1000 | 800 | 0% |
| Gestão Parcial | sim | 1000 | 800 | 0% |
| ConciergeIA | sim | 499 | 399 | 0% |
| Cherry CC 12x | não | 15600 | 12000 | 60% |
| Cherry MENSAL | sim | 3000 | 2400 | 30% |
| Orks Tech | não | 899 | 700 | 0% |

## 4. Meta individual

**Meta = salário vigente × fator_base (2) × rampa × múltiplo do time × escala individual**

- **Salário vigente**: o do mês; reajuste **não é retroativo**.
- **Rampa** = etapa × (dias úteis trabalhados ÷ dias úteis do mês). Etapa: mês de entrada 70%, mês 1 80%, mês 2 90%, mês 3 em diante 100%. Quem não começou ou já saiu no mês: rampa 0 (fora da folha).
- **Escala individual**: ajuste manual do gestor por vendedor (1 = sem ajuste), com motivo, valendo "já neste mês" ou "a partir do mês seguinte". Não muda mês já fechado.
- **Meta fechada**: o gestor confirma a meta do mês seguinte **só depois do dia de corte (25)**. Isso grava uma "foto" das metas, que não muda mais.

## 5. Múltiplo do time

- O gestor pode **fixar** o múltiplo de um mês (vale já ou no mês seguinte; não muda se a meta do mês já foi fechada).
- Sem fixação: usa o `multiplo` base (6,5). Com `ajuste_historico` ligado, o sistema recalcula pelo desempenho do time:
  - Considera só vendedores "rampados" (mês 3+ trabalhando o mês inteiro).
  - Soma pontos e salários do mês anterior (até o dia 25, proporcional em dias corridos) e dos dois meses antes (inteiros).
  - Alvo = pontos ÷ (fator_base × salários). O múltiplo novo = anterior × ajuste, limitado entre 0,9× e 1,25× do anterior.

## 6. Pontos, validação e remuneração

- **Pontos de uma venda** = quantidade × pontos do produto vigente no mês da venda. Só entram vendas não canceladas e com piso OK/aprovado.
- **Pendente** → vira **Validada** sozinha após 10 dias da data da venda (rotina diária). Venda validada **não cancela**.
- **Atingimento** = pontos validados ÷ meta (**sem teto**: pode passar de 100%).
- **Bônus** = salário × atingimento.
- **Remuneração total** = salário + bônus. Só vendas **validadas** contam; as pendentes aparecem à parte.
- **Média do time** (para comparação) só aparece com 3 ou mais vendedores.
- **Foco sugerido** (simulação): para cada produto, a menor quantidade que fecha o que falta da meta; ordena pelo menor esforço.

## 7. Caixa e Comissão ÷ caixa

- **Caixa** = soma do valor de cada item vendido × % de caixa do produto.
- **Comissão ÷ caixa** = bônus total do time ÷ caixa (sem o salário fixo).
- Se passar do `limite_comissao` (15%), o gestor recebe alerta vermelho. Sem caixa, a razão fica indefinida.

## 8. Registro de vendas

- Dados: cliente, CPF/CNPJ, data, itens (produto, quantidade, valor), forma de pagamento, parcelas, recorrente, observações.
- Data não pode ser futura nem anterior a **20 dias**; não pode cair em mês já fechado.
- **Piso**: se o valor de algum item for menor que piso × quantidade, a venda fica "aguardando aprovação do gestor" e não conta pontos até aprovar. Se o gestor recusar, a venda é cancelada ("Piso não aprovado").
- **Duplicidade**: mesmo CPF/CNPJ + mesmo valor total + mesmo mês gera aviso ao vendedor e ao gestor (a venda é registrada, marcada como "possível duplicada").
- Cancelamento: só venda **pendente**, pelo dono ou pelo gestor, com motivo. O gestor pode ajustar a quantidade de um item.

## 9. Fechamento do mês e nota fiscal

- O mês só fecha **depois da janela de lançamento** (fim do mês + 20 dias) e **sem vendas pendentes** (o sistema valida as elegíveis antes).
- Fechar **congela a folha** (fixo, atingimento, bônus, total, caixa de cada vendedor).
- Folha pode ser exportada em CSV.
- **Nota fiscal (espelho)**: depois do fechamento, o vendedor gera o espelho (fixo + bônus), imprime e anexa a nota emitida na prefeitura (PDF/imagem). Status: pendente → enviada → aprovada → paga (gestor aprova e marca como paga).
- A NFS-e oficial é emitida no portal da prefeitura; o sistema não emite.

## 10. Cadastro obrigatório

- Qualquer campo obrigatório vazio **bloqueia** o acesso às áreas até preencher.
- Colaborador: PF (CPF + RG) ou PJ (CNPJ ativo na Receita + razão social), contato, endereço (CEP automático), contato de referência com endereço, PIX e banco. Gestor/admin preenchem também a empresa.
- Gestor/admin PJ: o banco espelha os dados pessoais para a empresa (não se pergunta duas vezes).
- O gestor liga/desliga a obrigatoriedade de cada campo ("desde" quando) e pode lembrar quem tem pendência.
- Todos os campos com máscara ou seleção (nunca texto livre quando existe formato).

## 11. Pontos para discutirmos antes de redesenhar

1. A fórmula de meta (salário × 2 × rampa × múltiplo × escala) continua? O fator 2 e o múltiplo 6,5 ainda fazem sentido?
2. Bônus = salário × atingimento, **sem teto**: manter? O limite de 15% de comissão ÷ caixa é só alerta ou deveria travar algo?
3. Validação automática em 10 dias: manter? E o cancelamento só de venda pendente?
4. Rampa de 4 etapas (70/80/90/100): manter?
5. Ajuste automático do múltiplo (hoje desligado): ligar, remover ou manter desligado?
6. Piso e duplicidade: as regras de aprovação do gestor continuam as mesmas?
7. Produtos: lista e valores atuais ainda valem? Precisa de comissão por produto?
8. Nota fiscal: manter o espelho e o fluxo de aprovação/pagamento dentro do sistema?
9. Lançamento retroativo de 20 dias e fechamento só após essa janela: manter?
10. Há algo novo que o sistema precisa cobrir (funil de leads, metas por equipe, ranking, metas por produto)?
