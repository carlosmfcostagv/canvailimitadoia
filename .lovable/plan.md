# Liberação de créditos para assinantes

## Objetivo
Permitir que o administrador localize assinantes e adicione ou remova créditos com segurança, mantendo o histórico de cada ajuste.

## Implementação
- Criar operações protegidas no banco para listar assinantes e ajustar saldos somente quando o usuário atual for administrador.
- Registrar cada liberação ou retirada no histórico de transações, incluindo administrador, motivo e saldo final.
- Adicionar à página Administração uma seção “Créditos dos assinantes” com busca, valor, motivo e ação de liberar créditos.
- Atualizar o saldo exibido após cada ajuste e mostrar mensagens claras para sucesso, saldo inválido e acesso negado.
- Verificar o erro informado em `utils.ts` e validar a aplicação após as mudanças.

## Segurança
- O navegador não terá acesso privilegiado direto.
- A autorização será conferida no banco em cada operação.
- Não será permitido deixar o saldo negativo.
