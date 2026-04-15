#!/bin/bash

# Script para levantar el proyecto completo: Redis + Backend + Frontend
# Uso: bash startup.sh

set -e  # Detener si hay error

PROJECT_PATH="/Users/franciscorodriguezpons/Desktop/proyectobd2/Mate-ecommerce/mate-ecommerce-backend"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     INICIANDO PROYECTO: Redis + Backend + Frontend        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Verificar que Redis está disponible
echo "🔍 Verificando Redis..."
if ! command -v redis-server &> /dev/null; then
    echo "❌ Redis no está instalado"
    echo "   macOS: brew install redis"
    exit 1
fi
echo "✅ Redis disponible"
echo ""

# Verificar que Node.js está disponible
echo "🔍 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi
echo "✅ Node.js disponible ($(node --version))"
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║              INSTRUCCIONES DE TERMINAL                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "📍 TERMINAL 1 - Redis:"
echo "   Ejecuta esto en una nueva terminal:"
echo "   ► redis-server"
echo ""

echo "📍 TERMINAL 2 - Backend:"
echo "   Ejecuta esto en otra nueva terminal:"
echo "   ► cd $PROJECT_PATH/backend && npm run dev"
echo ""

echo "📍 TERMINAL 3 - Frontend:"
echo "   Ejecuta esto en otra nueva terminal:"
echo "   ► cd $PROJECT_PATH/frontend && npm run dev"
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║              O SI PREFIERES FAZLO AUTOMATICO               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

read -p "¿Deseas que abra las 3 terminales automáticamente? (s/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "Abriendo Terminal 1 (Redis)..."
    osascript -e "tell app \"Terminal\" to do script \"redis-server\"" &
    
    sleep 2
    
    echo "Abriendo Terminal 2 (Backend)..."
    osascript -e "tell app \"Terminal\" to do script \"cd '$PROJECT_PATH/backend' && npm run dev\"" &
    
    sleep 3
    
    echo "Abriendo Terminal 3 (Frontend)..."
    osascript -e "tell app \"Terminal\" to do script \"cd '$PROJECT_PATH/frontend' && npm run dev\"" &
    
    echo ""
    echo "✅ Todas las terminales abiertos!"
    echo "   Espera 5-10 segundos para que todo se inicie."
    echo ""
    echo "🌐 URLs:"
    echo "   Backend:  http://localhost:3000"
    echo "   Frontend: http://localhost:3001"
else
    echo "Recuerda ejecutar los 3 comandos en terminales separadas."
fi
