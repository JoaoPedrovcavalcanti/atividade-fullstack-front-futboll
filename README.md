# Futebol - Frontend Mobile (React Native + Expo)

App mobile feito com **React Native (Expo)** que consome a API do backend (Node + Express + Mongoose) e faz o **CRUD completo de jogadores de futebol**. Todos os dados são salvos no backend (MongoDB).

## Funcionalidades

- **Cadastrar** jogador (nome, clube, posição, número da camisa e gols)
- **Listar** jogadores, com busca por nome ou clube e atualização puxando a tela para baixo
- **Editar** os dados de um jogador
- **Excluir** jogador, com confirmação

Se a API estiver fora do ar, o app mostra um aviso com o botão "Tentar de novo".

## Como rodar

**Pré-requisitos:** Node.js 18+ e o app **Expo Go** no celular (ou um emulador).

1. **Suba o backend primeiro** (veja o README do repositório do backend).
2. Clone este repositório e entre na pasta:
   ```bash
   git clone https://github.com/JoaoPedrovcavalcanti/Futebol-Frontend.git
   cd Futebol-Frontend
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Abra `src/config.js` e coloque o endereço da API:
   ```js
   export const API_URL = 'http://SEU_IPV4:3000';
   ```
   - Celular com Expo Go: IPv4 do PC (`ipconfig` no Windows), com celular e PC na mesma rede Wi-Fi
   - Emulador Android: `http://10.0.2.2:3000`
5. Inicie o app:
   ```bash
   npx expo start
   ```
   Escaneie o QR Code com o Expo Go.

## Estrutura

```text
├── src/config.js    # endereço da API
├── App.js           # telas e CRUD
├── app.json
├── index.js
└── package.json
```
