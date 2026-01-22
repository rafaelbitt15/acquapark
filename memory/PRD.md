# Acqua Park Prazeres da Serra - PRD (Product Requirements Document)

## Visão Geral
Website completo e pronto para lançamento para o parque aquático "Acqua Park Prazeres da Serra", com sistema de vendas de ingressos online integrado ao Mercado Pago.

## Data de Última Atualização
22 de Janeiro de 2026

## Status do Projeto
✅ MVP Completo com Sistema de Ingressos

---

## Funcionalidades Implementadas

### 1. Website Público
- [x] Página inicial (Home) com hero, atrações em destaque, depoimentos
- [x] Página de atrações com filtros por categoria
- [x] Página de ingressos com seletor de quantidade e data
- [x] Página de contato com formulário
- [x] Política de Privacidade (LGPD)
- [x] Termos de Uso (LGPD)
- [x] Cookie Banner (LGPD)
- [x] Header e Footer responsivos
- [x] Logo e favicon personalizados

### 2. Sistema de Clientes
- [x] Cadastro de clientes (nome, email, telefone, CPF)
- [x] Login de clientes
- [x] Página "Minha Conta" com histórico de pedidos
- [x] **Exibição de QR Code do ingresso** para pedidos aprovados
- [x] Código alfanumérico copiável para cada ingresso

### 3. Painel Administrativo
- [x] Login seguro (JWT)
- [x] Dashboard com estatísticas
- [x] Gerenciamento de atrações (CRUD)
- [x] **Gerenciamento de tipos de ingressos (CRUD completo)**
  - Adicionar novos tipos
  - Editar informações
  - Remover tipos
- [x] **Gerenciamento de disponibilidade por data**
  - Definir quantidade total de ingressos por dia
  - Visualizar vendidos vs disponíveis
  - Barra de progresso visual
- [x] **Gerenciamento de funcionários (staff)**
  - Cadastrar funcionários
  - Remover funcionários
- [x] Gerenciamento de informações do parque
- [x] Gerenciamento de depoimentos
- [x] Gerenciamento de FAQs
- [x] Configuração do Mercado Pago

### 4. Sistema de Validação de Ingressos (NOVO)
- [x] Login de funcionário (`/funcionario/login`)
- [x] Página de check-in (`/check-in`)
- [x] Busca de ingresso por código
- [x] Validação do ingresso com marcação "utilizado"
- [x] Prevenção de reutilização de ingressos
- [x] Exibição de informações do cliente e pedido

### 5. Integração Mercado Pago
- [x] SDK instalado
- [x] Configuração de credenciais via admin
- [x] Criação de preferência de pagamento
- [x] Webhook para atualização de status
- [x] Verificação de disponibilidade antes da compra

---

## Arquitetura Técnica

### Stack
- **Frontend**: React 19, TailwindCSS, Shadcn/UI, Zustand
- **Backend**: FastAPI (Python), Motor (MongoDB async)
- **Database**: MongoDB
- **Pagamentos**: Mercado Pago SDK

### Estrutura de Arquivos
```
/app
├── backend
│   ├── server.py           # Aplicação FastAPI principal
│   ├── routes.py           # Rotas admin e conteúdo
│   ├── customer_routes.py  # Rotas de clientes e pagamentos
│   ├── ticket_routes.py    # Rotas de disponibilidade e validação
│   ├── models.py           # Modelos Pydantic
│   ├── ticket_models.py    # Modelos do sistema de ingressos
│   ├── customer_models.py  # Modelos de clientes
│   └── auth.py             # Autenticação JWT
└── frontend
    └── src
        ├── pages
        │   ├── admin/          # Painel administrativo
        │   ├── CheckIn.jsx     # Validação de ingressos
        │   ├── StaffLogin.jsx  # Login funcionário
        │   └── CustomerAccount.jsx  # Conta do cliente com QR
        └── components/
```

---

## Credenciais de Teste

### Admin
- URL: `/admin/login`
- Email: `bitencourt.rafandrade@gmail.com`
- Senha: `Rafa2188`

### Funcionário (Staff)
- URL: `/funcionario/login`
- Email: `joao@acquapark.com`
- Senha: `123456`

---

## Testes Realizados
- **Backend**: 22/22 testes passando (100%)
- **Frontend**: Todos os fluxos testados e funcionando

---

## Tarefas Pendentes (P0 - Alta Prioridade)

### 1. Configuração de Domínio Personalizado
- [ ] Configurar `www.acquaparkps.com.br` na plataforma Emergent
- [ ] Orientar usuário sobre DNS e migração do locaweb

---

## Tarefas Futuras (P1/P2)

### P1 - Médio Prazo
- [ ] Testes completos do fluxo de pagamento Mercado Pago em produção
- [ ] Página de pedidos completa no admin (atualmente placeholder)
- [ ] Página de mensagens completa no admin (atualmente placeholder)
- [ ] Relatórios de vendas e dashboard avançado

### P2 - Backlog
- [ ] Notificações por email (confirmação de compra)
- [ ] Sistema de cupons de desconto
- [ ] Integração com calendário (Google Calendar)
- [ ] App mobile (PWA)
- [ ] Scanner de QR Code com câmera no check-in

---

## Changelog

### 22/01/2026
- ✅ Implementado sistema completo de inventário de ingressos
- ✅ Implementado sistema de validação de ingressos com QR Code
- ✅ Implementado login de funcionário e página de check-in
- ✅ Implementado CRUD completo de tipos de ingressos
- ✅ Implementado gerenciamento de funcionários
- ✅ Adicionado QR Code na conta do cliente
- ✅ 22 testes de backend criados e passando

### 21/01/2026
- Website público completo
- Painel administrativo base
- Sistema de clientes
- Integração Mercado Pago iniciada
- LGPD compliance (cookies, políticas)
