# Wany Website

Site que permite o upload, download e streaming sobre o desevolvimento de jogos independentes

## Preparação
- Execute o comando 'npm install' nas pastas Client e Server
- Na pasta Server, duplique o arquivo .env.example e renomeie para .env
- Edite o arquivo .env com os valores adequados:
    - HOST: o host onde a aplicação vai rodar (ex: localhost)
    - PORT: a porta onde a aplicação rodará
    - SECRET_TOKEN: digite alguma string grande e aleatória
    - DB_*: preencha cada campo com prefixo DB_ com a credencial equivalente do seu banco de dados mysql

## Como rodar
- Para iniciar o servidor, vá na pasta Server e execute pelo terminal:
    - 'npm run dev' para executar o ambiente de desenvolvimento
    - 'npm run build' para criar o ambiente de distribuição
    - 'npm run start' para executar o ambiente de distribuição
- Para iniciar o cliente, vá para a pasta Client e execute pelo terminal:
    - 'npm run dev' para executar o ambiente de desenvolvimento
    - 'npm run build' para criar o ambiente de distribuição
    - 'npm run start' para executar o ambiente de distribuição
