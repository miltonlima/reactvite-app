# React Vite Registration Form / Formulário React Vite

Multilingual README: English first, Português logo abaixo.

---

## English

### Overview

This project is a single-page React application bootstrapped with Vite. It delivers a modern registration form that collects a person's full name, birth date, CPF and email. The user experience embraces a glassmorphism-inspired layout, client-side validation and real-time CPF formatting.

### Screens & Behavior

- **Hero section** introducing the registration flow and highlighting that the form is ready for new records.
- **Form grid** with four controlled inputs:
	- `Full name` (`text`)
	- `Birth date` (`date`, capped at the current day)
	- `CPF` (`text`, auto-formatted as `000.000.000-00`)
	- `Email` (`email`)
- **Navigation** toggles between the original modern layout (`/`) and a compact white-card variation (`/simple`) while reusing the same backend integration.
- **Submission panel** showing a confirmation badge and the captured data once the form is submitted.

### Tech Stack

- Vite 5 with React 18 (`StrictMode` + `createRoot`).
- Functional components and the `useState` hook manage local state and input control.
- Client-side routing with `react-router-dom` hosts multiple form variants on dedicated routes.
- CSS modules (`App.css`, `index.css`) define gradients, blur layers, responsive grid and focus states.

### Getting Started

```bash
npm install
npm run dev
```

Open the URL provided by Vite (usually `http://localhost:5173`). Edits under `src/` hot-reload instantly thanks to Vite's HMR pipeline.

### Backend API

The form submits to the companion ASP.NET Core project located at `../aspnetcore-api`.

1. Configure MySQL credentials inside `aspnetcore-api/appsettings.Development.json` (`ConnectionStrings:DefaultConnection`).
2. Restore and run the API with HTTPS enabled (required by the frontend):
	```powershell
	cd ..\aspnetcore-api
	dotnet restore
	dotnet run --launch-profile https
	```
	If the binary is locked from a previous run, finalize the old process first (Ctrl+C no terminal antigo).
3. Confirm the Swagger UI is available at `https://localhost:7242/swagger` and keep the server running. Accept the certificate warning the first time if prompted.
4. The React app reads the API base URL from `.env` (`VITE_API_BASE_URL`). Adjust this value if the backend runs on a different host or port. Remember to restart `npm run dev` whenever `.env` changes.

### Available Scripts

- `npm run dev` – start the development server with hot module replacement.
- `npm run build` – build the production bundle in `dist/`.
- `npm run preview` – serve the production bundle locally for smoke testing.

### Project Structure (excerpt)

```
src/
	App.jsx                 # Application shell with navigation and routes
	App.css                 # Shared styling for the form variants
	main.jsx                # Application bootstrap (React + BrowserRouter)
	hooks/
		useRegistrationForm.js # Shared state + submission workflow
	pages/
		ModernForm.jsx        # Glassmorphism-inspired layout
		SimpleForm.jsx        # Compact white-card layout
	index.css               # Global theme, fonts and resets
```

### Customization Notes

- Adjust layout tokens (colors, radii, grid) inside `App.css` to reflect your brand.
- Customize the payload or response handling in `hooks/useRegistrationForm.js` if your API contract changes.
- Input masking currently handles CPF client-side; move it to a shared utility if more fields require formatting.
- Update `.env` whenever the API base URL changes.

### Requirements

- Node.js LTS (18+ recommended)
- npm 9+ (or pnpm/yarn with equivalent scripts)

---

## Português

### Visão Geral

Este projeto é uma aplicação React de página única criada com Vite. Ele disponibiliza um formulário moderno para registrar o nome completo, data de nascimento, CPF e e-mail de uma pessoa, com layout estilo glassmorphism, validações no cliente e formatação de CPF em tempo real.

### Telas e Comportamento

- **Seção de destaque** apresenta o fluxo de cadastro e indica que um novo registro pode ser criado imediatamente.
- **Formulário em grid** traz quatro campos controlados:
	- `Nome completo` (`text`)
	- `Data de nascimento` (`date`, limitada até a data atual)
	- `CPF` (`text`, autoformatado como `000.000.000-00`)
	- `E-mail` (`email`)
- **Navegação** permite alternar entre o layout moderno original (`/`) e a variação compacta em cartão branco (`/simple`) que compartilha a mesma integração com a API.
- **Painel de submissão** exibe um selo de confirmação e os dados informados após salvar.

### Stack Tecnológica

- Vite 5 com React 18 (`StrictMode` + `createRoot`).
- Componentes funcionais e o hook `useState` controlam o estado local e os inputs.
- Roteamento no cliente via `react-router-dom` viabiliza múltiplas variantes de formulário em rotas distintas.
- CSS modular (`App.css`, `index.css`) define gradientes, camadas com blur, grid responsiva e estados de foco.

### Como Executar

```bash
npm install
npm run dev
```

Abra a URL informada pelo Vite (geralmente `http://localhost:5173`). Alterações em `src/` recarregam automaticamente graças ao HMR.

### API Backend

O formulário envia os dados para o projeto ASP.NET Core localizado em `../aspnetcore-api`.

1. Ajuste as credenciais do MySQL em `aspnetcore-api/appsettings.Development.json` (`ConnectionStrings:DefaultConnection`).
2. Restaure e execute a API com HTTPS habilitado (requisito do frontend):
	```powershell
	cd ..\aspnetcore-api
	dotnet restore
	dotnet run --launch-profile https
	```
	Se o executável estiver bloqueado por uma execução anterior, finalize o processo antigo (Ctrl+C no terminal anterior) antes de executar novamente.
3. Confirme a disponibilidade do Swagger em `https://localhost:7242/swagger` e mantenha o servidor ativo. Aceite o aviso de certificado na primeira visita, se aparecer.
4. O app React lê o endpoint da API via `.env` (`VITE_API_BASE_URL`). Ajuste o valor caso a API rode em outra porta ou host e reinicie o `npm run dev` sempre que alterar o arquivo.

### Scripts Disponíveis

- `npm run dev` – inicia o servidor de desenvolvimento com hot reload.
- `npm run build` – gera o bundle de produção na pasta `dist/`.
- `npm run preview` – serve localmente o bundle de produção para testes rápidos.

### Estrutura do Projeto (trecho)

```
src/
	App.jsx                 # Shell com navegação e rotas
	App.css                 # Estilos compartilhados entre as variantes
	main.jsx                # Bootstrap (React + BrowserRouter)
	hooks/
		useRegistrationForm.js # Estado compartilhado + lógica de envio
	pages/
		ModernForm.jsx        # Layout glassmorphism
		SimpleForm.jsx        # Layout compacto em cartão branco
	index.css               # Tema global, fontes e resets
```

### Notas de Personalização

- Ajuste tokens de layout (cores, bordas, grid) em `App.css` para refletir a identidade visual desejada.
- Personalize o payload ou o tratamento da resposta em `hooks/useRegistrationForm.js` caso o contrato da API mude.
- A máscara de CPF roda no cliente; mova-a para uma utilidade compartilhada caso novos campos precisem de formatação similar.
- Lembre-se de atualizar o `.env` sempre que o endpoint da API for alterado.

### Requisitos

- Node.js LTS (recomendado 18 ou superior)
- npm 9+ (ou pnpm/yarn com scripts equivalentes)
