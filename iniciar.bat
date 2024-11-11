@echo off

:: Atualiza o repositório
echo Atualizando repositorio...
cmd /c "git pull origin master"

:: Navega até o diretório do frontend
cd transcript-frontend

:: Instala dependências do frontend em um novo terminal e aguarda
echo Instalando dependencias do frontend...
start /wait cmd /c "npm install"

:: Faz o build do frontend
echo Fazendo build do frontend...
start /wait cmd /c "npm run build"

:: Navega até o diretório do backend
cd ../transcript-backend

:: Instala dependências do backend
echo Instalando dependencias do backend...
start /wait cmd /c "pip3 install -r .\requirements.txt"

:: Executa o script do backend
echo Iniciando Transcript Backend...
start cmd /k "python .\transcript.py"

:: Navega de volta ao diretório principal do projeto
cd ..

:: Inicia o frontend
echo Iniciando Transcript Frontend...
start cmd /k "cd transcript-frontend && npm start"

echo Todos os serviços foram iniciados.

:: Mantém a janela aberta
pause