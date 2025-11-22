# React Vite CRUD / CRUD com React e Vite

Multilingual README: English first, Português logo abaixo.

---

## English

### Overview

This project is a single-page React application bootstrapped with Vite, featuring a complete CRUD (Create, Read, Update, Delete) system for user registrations. It includes user authentication (login/register), protected routes, and a dashboard to manage records. The application connects to an ASP.NET Core backend API to persist data.

### Features

- **User Authentication**: Secure login and registration pages.
- **Protected Routes**: Dashboard and reporting pages are only accessible to authenticated users.
- **Dashboard**: A central hub for authenticated users.
- **CRUD Operations**:
    - **Create**: Register new users through multiple form styles.
    - **Read**: View all registrations in a detailed report table.
    - **Update**: Edit existing registrations via a modal form.
    - **Delete**: Remove registrations from the system.
- **Modern UI**:
    - Glassmorphism-inspired and simple card-based form layouts.
    - Client-side validation and real-time CPF formatting.
    - Responsive design for various screen sizes.
- **Education Network Management**: Dedicated screen to register and list school units, aligning future class and student assignments per unit.

### Tech Stack

- Vite 5 with React 18 (`StrictMode`).
- **Routing**: `react-router-dom` for navigation and protected routes.
- **State Management**: React Hooks (`useState`, `useContext`) and custom hooks for modular logic (`useAuth`, `useRegistrationsReport`).
- **Authentication**: JWT-based authentication with state managed by `AuthContext`.
- **API Communication**: `axios` instance for making RESTful API calls to the backend.
- **Styling**: CSS Modules and global stylesheets for a flexible and maintainable design.

### Getting Started

1.  Clone the repository.
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Set up the backend API (see Backend API section).
4.  Create a `.env` file in the root of the project and add the API base URL:
    ```
    VITE_API_BASE_URL=http://localhost:5128
    ```
    *Adjust the port if your backend runs on a different one.*
5.  Run the development server:
    ```bash
    npm run dev
    ```
Open the URL provided by Vite (usually `http://localhost:5173`).

### Backend API

The application requires the companion ASP.NET Core project located at `../aspnetcore-api`.

1.  **Configure**: Set your MySQL credentials in `aspnetcore-api/appsettings.Development.json`.
2.  **Run**: Restore and run the API with HTTPS enabled:
    ```powershell
    cd ..\aspnetcore-api
    dotnet restore
    dotnet run --launch-profile https
    ```
3.  **Verify**: Ensure the Swagger UI is available at `https://localhost:7242/swagger` and keep the server running.

### Available Scripts

-   `npm run dev`: Starts the development server with Hot Module Replacement.
-   `npm run build`: Bundles the app for production into the `dist/` directory.
-   `npm run preview`: Serves the production bundle locally for testing.

### Project Structure

```
src/
├── assets/                  # Static assets
├── components/              # Shared components (e.g., ProtectedRoute)
│   └── ProtectedRoute.jsx
├── context/                 # React context providers (e.g., AuthContext)
│   └── AuthContext.jsx
├── hooks/                   # Custom hooks for state and logic
│   ├── useAuth.js
│   ├── useEducationUnits.js
│   └── useRegistrationsReport.js
├── pages/                   # Top-level page components
│   ├── DashboardPage.jsx
│   ├── EducationUnitsPage.jsx
│   ├── EditRegistrationModal.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   └── Reports.jsx
├── services/                # API communication layer
│   └── api.js
├── App.css                  # Main application styles
├── App.jsx                  # Root component with routing
├── index.css                # Global styles and resets
└── main.jsx                 # Application entry point
```

---

## Português

### Visão Geral

Este projeto é uma aplicação React de página única (SPA) criada com Vite, apresentando um sistema CRUD (Create, Read, Update, Delete) completo para cadastros de usuários. Inclui autenticação de usuário (login/registro), rotas protegidas e um painel para gerenciar os registros. A aplicação se conecta a uma API backend ASP.NET Core para persistir os dados.

### Funcionalidades

- **Autenticação de Usuário**: Páginas seguras de login and registro.
- **Rotas Protegidas**: O painel e as páginas de relatório são acessíveis apenas para usuários autenticados.
- **Dashboard**: Um hub central para usuários autenticados.
- **Operações CRUD**:
    - **Criar**: Registre novos usuários através de múltiplos estilos de formulário.
    - **Ler**: Visualize todos os registros em uma tabela de relatório detalhada.
    - **Atualizar**: Edite registros existentes através de um formulário modal.
    - **Deletar**: Remova registros do sistema.
- **UI Moderna**:
    - Layouts de formulário inspirados em Glassmorphism e baseados em cartões simples.
    - Validação no lado do cliente e formatação de CPF em tempo real.
    - Design responsivo para vários tamanhos de tela.
- **Gestão da Rede de Ensino**: Tela dedicada para cadastrar e listar unidades escolares, preparando o sistema para turmas e alunos vinculados.

### Stack Tecnológica

- Vite 5 com React 18 (`StrictMode`).
- **Roteamento**: `react-router-dom` para navegação e rotas protegidas.
- **Gerenciamento de Estado**: React Hooks (`useState`, `useContext`) e hooks customizados para lógica modular (`useAuth`, `useRegistrationsReport`).
- **Autenticação**: Autenticação baseada em JWT com estado gerenciado pelo `AuthContext`.
- **Comunicação com API**: Instância `axios` para fazer chamadas à API RESTful no backend.
- **Estilização**: CSS Modules e folhas de estilo globais para um design flexível e de fácil manutenção.

### Como Executar

1.  Clone o repositório.
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Configure a API de backend (veja a seção Backend API).
4.  Crie um arquivo `.env` na raiz do projeto e adicione a URL base da API:
    ```
    VITE_API_BASE_URL=http://localhost:5128
    ```
    *Ajuste a porta se o seu backend rodar em uma diferente.*
5.  Execute o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
Abra a URL fornecida pelo Vite (geralmente `http://localhost:5173`).

### API Backend

A aplicação requer o projeto ASP.NET Core complementar localizado em `../aspnetcore-api`.

1.  **Configure**: Defina suas credenciais do MySQL em `aspnetcore-api/appsettings.Development.json`.
2.  **Execute**: Restaure e execute a API com HTTPS ativado:
    ```powershell
    cd ..\aspnetcore-api
    dotnet restore
    dotnet run --launch-profile https
    ```
3.  **Verifique**: Garanta que a UI do Swagger esteja disponível em `https://localhost:7242/swagger` e mantenha o servidor em execução.

### Scripts Disponíveis

-   `npm run dev`: Inicia o servidor de desenvolvimento com Hot Module Replacement.
-   `npm run build`: Empacota a aplicação para produção no diretório `dist/`.
-   `npm run preview`: Serve o pacote de produção localmente para teste.

### Estrutura do Projeto

```
src/
├── assets/                  # Assets estáticos
├── components/              # Componentes compartilhados (ex: ProtectedRoute)
│   └── ProtectedRoute.jsx
├── context/                 # Provedores de contexto React (ex: AuthContext)
│   └── AuthContext.jsx
├── hooks/                   # Hooks customizados para estado e lógica
│   ├── useAuth.js
│   ├── useEducationUnits.js
│   └── useRegistrationsReport.js
├── pages/                   # Componentes de página de nível superior
│   ├── DashboardPage.jsx
│   ├── EducationUnitsPage.jsx
│   ├── EditRegistrationModal.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   └── Reports.jsx
├── services/                # Camada de comunicação com a API
│   └── api.js
├── App.css                  # Estilos principais da aplicação
├── App.jsx                  # Componente raiz com roteamento
├── index.css                # Estilos globais e resets
└── main.jsx                 # Ponto de entrada da aplicação
```