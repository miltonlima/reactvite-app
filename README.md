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
- **Submission panel** showing a confirmation badge and the captured data once the form is submitted.

### Tech Stack

- Vite 5 with React 18 (`StrictMode` + `createRoot`).
- Functional components and the `useState` hook manage local state and input control.
- CSS modules (`App.css`, `index.css`) define gradients, blur layers, responsive grid and focus states.

### Getting Started

```bash
npm install
npm run dev
```

Open the URL provided by Vite (usually `http://localhost:5173`). Edits under `src/` hot-reload instantly thanks to Vite's HMR pipeline.

### Available Scripts

- `npm run dev` – start the development server with hot module replacement.
- `npm run build` – build the production bundle in `dist/`.
- `npm run preview` – serve the production bundle locally for smoke testing.

### Project Structure (excerpt)

```
src/
	App.jsx      # Registration form component
	App.css      # Form-specific styling
	main.jsx     # Application bootstrap (React + StrictMode)
	index.css    # Global theme, fonts and resets
```

### Customization Notes

- Adjust layout tokens (colors, radii, grid) inside `App.css` to reflect your brand.
- To persist submissions, replace the `useState` mock with API calls (e.g., inside `handleSubmit`).
- Input masking currently handles CPF client-side; move it to a shared utility if more fields require formatting.

### Requirements

- Node.js LTS (18+ recommended)
- npm 9+ (or pnpm/yarn with equivalent scripts)

---

## Português

### Visão Geral

Este projeto é uma aplicação React de página única criada com Vite. Ele disponibiliza um formulário moderno para registrar o nome completo, data de nascimento, CPF e e-mail de uma pessoa, com layout estilo glassmorphism, validações no cliente e formatação de CPF em tempo real.

### Telas e Comportamento

- **Seção de destaque** que apresenta o fluxo de cadastro e sinaliza que um novo registro pode ser criado imediatamente.
- **Formulário em grid** com quatro campos controlados:
	- `Nome completo` (`text`)
	- `Data de nascimento` (`date`, limitada até a data atual)
	- `CPF` (`text`, autoformatado como `000.000.000-00`)
	- `E-mail` (`email`)
- **Painel de submissão** exibindo um selo de confirmação e os dados informados após salvar.

### Stack Tecnológica

- Vite 5 com React 18 (`StrictMode` + `createRoot`).
- Componentes funcionais e o hook `useState` controlam o estado local e os inputs.
- CSS modular (`App.css`, `index.css`) define gradientes, camadas com blur, grid responsiva e estados de foco.

### Como Executar

```bash
npm install
npm run dev
```

Abra a URL informada pelo Vite (geralmente `http://localhost:5173`). Alterações dentro de `src/` recarregam automaticamente graças ao HMR.

### Scripts Disponíveis

- `npm run dev` – inicia o servidor de desenvolvimento com hot reload.
- `npm run build` – gera o bundle de produção na pasta `dist/`.
- `npm run preview` – serve localmente o bundle de produção para testes rápidos.

### Estrutura do Projeto (trecho)

```
src/
	App.jsx      # Componente do formulário de cadastro
	App.css      # Estilos específicos do formulário
	main.jsx     # Bootstrap da aplicação (React + StrictMode)
	index.css    # Tema global, fontes e resets
```

### Notas de Personalização

- Ajuste tokens de layout (cores, bordas, grid) em `App.css` para refletir a identidade visual desejada.
- Para persistir dados, substitua o mock com `useState` por chamadas a uma API no `handleSubmit`.
- A máscara de CPF roda no cliente; mova-a para uma utilidade compartilhada caso novos campos precisem de formatação similar.

### Requisitos

- Node.js LTS (recomendado 18 ou superior)
- npm 9+ (ou pnpm/yarn com scripts equivalentes)
