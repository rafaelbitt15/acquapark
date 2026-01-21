# Contracts - Acqua Park Website

## Frontend Implementation Status
✅ **CONCLUÍDO** - Frontend com 4 páginas totalmente funcionais usando dados mock

### Páginas Criadas:
1. **Home** (`/`) - Página inicial com hero, sobre o parque, atrações em destaque, depoimentos
2. **Atrações** (`/atracoes`) - Grid de 8 atrações com filtros por categoria
3. **Ingressos** (`/ingressos`) - Sistema de venda com 3 tipos de ingressos e checkout
4. **Contato** (`/contato`) - Formulário de contato, informações, FAQ, mapa

### Dados Mock Implementados:
Arquivo: `/app/frontend/src/mock.js`
- `parkInfo` - Informações do parque, contato, horários
- `attractions` - 8 atrações com imagens, categorias, restrições
- `tickets` - 3 tipos de ingressos (Inteiro, Meia-Entrada, Pacote Família)
- `faqs` - 5 perguntas frequentes
- `testimonials` - 3 depoimentos de clientes
- `mockPurchaseTicket()` - Simula compra de ingressos
- `mockSendContact()` - Simula envio de formulário de contato

---

## Backend Integration Plan

### 1. Database Models (MongoDB)

#### Collection: `attractions`
```python
{
  "_id": ObjectId,
  "name": str,
  "description": str,
  "image": str (URL),
  "category": str (enum: "Radical", "Família", "Infantil"),
  "minHeight": str,
  "ageRestriction": str,
  "isActive": bool,
  "createdAt": datetime,
  "updatedAt": datetime
}
```

#### Collection: `tickets`
```python
{
  "_id": ObjectId,
  "ticketId": str (enum: "adult", "child", "family"),
  "name": str,
  "price": float,
  "description": str,
  "features": list[str],
  "isActive": bool,
  "createdAt": datetime,
  "updatedAt": datetime
}
```

#### Collection: `orders`
```python
{
  "_id": ObjectId,
  "orderId": str (unique),
  "customer": {
    "name": str,
    "email": str,
    "phone": str,
    "document": str (CPF)
  },
  "items": [
    {
      "ticketId": str,
      "quantity": int,
      "unitPrice": float
    }
  ],
  "totalAmount": float,
  "visitDate": str (ISO date),
  "paymentStatus": str (enum: "pending", "approved", "rejected", "refunded"),
  "paymentId": str (Mercado Pago ID),
  "mercadoPagoPreferenceId": str,
  "createdAt": datetime,
  "updatedAt": datetime
}
```

#### Collection: `contacts`
```python
{
  "_id": ObjectId,
  "name": str,
  "email": str,
  "phone": str (optional),
  "subject": str,
  "message": str,
  "status": str (enum: "new", "read", "replied"),
  "createdAt": datetime,
  "updatedAt": datetime
}
```

---

### 2. API Endpoints to Create

#### Attractions API
```
GET /api/attractions
- Returns all active attractions
- Query params: ?category=Radical (optional filter)

GET /api/attractions/:id
- Returns single attraction by ID
```

#### Tickets API
```
GET /api/tickets
- Returns all active ticket types with prices

GET /api/tickets/:id
- Returns single ticket type by ID
```

#### Orders API (Mercado Pago Integration)
```
POST /api/orders
- Creates new order in database
- Body: { customer, items, totalAmount, visitDate }
- Returns: { orderId, status }

POST /api/payments/create-preference
- Creates Mercado Pago payment preference
- Body: { orderId, items, payer, amount }
- Returns: { preferenceId, initPoint }

GET /api/orders/:orderId
- Returns order details by orderId

POST /api/webhooks/mercadopago
- Webhook endpoint to receive Mercado Pago notifications
- Updates order payment status
```

#### Contact API
```
POST /api/contact
- Saves contact form submission
- Body: { name, email, phone, subject, message }
- Returns: { success, message }

GET /api/contact (Admin only - future)
- Returns all contact submissions
```

---

### 3. Frontend Integration Points

#### Remove from mock.js and integrate with backend:

**Page: Ingressos (Tickets)**
- Replace `mockPurchaseTicket()` with API call to `/api/orders` + `/api/payments/create-preference`
- Redirect to Mercado Pago checkout URL (initPoint)
- Create success/pending/failure pages for payment callbacks

**Page: Contato (Contact)**
- Replace `mockSendContact()` with API call to `/api/contact`

**Page: Atrações (Attractions)**
- Fetch attractions from `/api/attractions` instead of mock data
- Implement category filtering on backend or frontend

**Page: Home**
- Fetch featured attractions from `/api/attractions`
- Fetch testimonials from database (future enhancement)

---

### 4. Mercado Pago Integration Requirements

**Environment Variables Needed:**
```
MERCADO_PAGO_ACCESS_TOKEN=your_access_token
MERCADO_PAGO_PUBLIC_KEY=your_public_key
MERCADO_PAGO_WEBHOOK_SECRET=your_webhook_secret
```

**Frontend Environment Variables:**
```
REACT_APP_MERCADO_PAGO_PUBLIC_KEY=your_public_key
```

**Payment Flow:**
1. User fills checkout form on frontend
2. Frontend POST to `/api/orders` (creates order in DB)
3. Backend creates Mercado Pago preference via SDK
4. Backend returns initPoint URL to frontend
5. Frontend redirects user to Mercado Pago checkout
6. User completes payment on Mercado Pago
7. Mercado Pago sends webhook to `/api/webhooks/mercadopago`
8. Backend updates order status in database
9. User redirected back to success/failure page

**Success/Failure URLs:**
```
success: http://localhost:3000/pagamento/sucesso?orderId=xxx
failure: http://localhost:3000/pagamento/falha?orderId=xxx
pending: http://localhost:3000/pagamento/pendente?orderId=xxx
```

---

### 5. Dependencies to Install

**Backend (requirements.txt):**
```
mercadopago==2.3.0
```

**Frontend (package.json):**
```
Already installed: axios (for API calls)
```

---

### 6. Testing Checklist

**After Backend Integration:**
- [ ] Test ticket purchase flow end-to-end
- [ ] Test Mercado Pago sandbox payment
- [ ] Test webhook notifications from Mercado Pago
- [ ] Test contact form submission
- [ ] Test attractions loading on all pages
- [ ] Test error handling for failed payments
- [ ] Test order status tracking

---

### 7. Current Mock Behavior (TO BE REPLACED)

**Ingressos Page:**
- Currently shows success message after 1.5s delay
- No real payment processing
- Cart stored in React state only

**Contato Page:**
- Currently shows success message after 1s delay
- No email notifications
- No data persistence

**Atrações & Home:**
- Load static data from mock.js
- No dynamic updates possible

---

## Next Steps

1. **USER CONFIRMATION**: Ask user if they want to proceed with backend implementation
2. **Get Mercado Pago Credentials**: User needs to provide test/production keys
3. **Implement Backend Models**: Create MongoDB models
4. **Implement API Routes**: Create FastAPI endpoints
5. **Integrate Mercado Pago SDK**: Implement payment preference creation and webhook handling
6. **Update Frontend**: Replace mock functions with API calls
7. **Create Payment Result Pages**: Success, failure, pending pages
8. **Test Integration**: Test complete flow with Mercado Pago sandbox
9. **Deploy**: Deploy to production with production credentials
