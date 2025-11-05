#!/bin/bash

# Script pour insérer des données de test dans l'API Game Collection
# Usage: ./seed.sh

API_URL="http://localhost:3000/api/games"

echo "🌱 Insertion de données de test dans la base de données..."
echo "=================================================="

# Fonction pour créer un jeu
create_game() {
  local response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "$1")
  
  local http_code=$(echo "$response" | tail -n1)
  local body=$(echo "$response" | head -n-1)
  
  if [ "$http_code" -eq 201 ]; then
    local title=$(echo "$body" | grep -o '"title":"[^"]*"' | cut -d'"' -f4)
    echo "✅ Créé: $title"
  else
    echo "❌ Erreur lors de la création"
  fi
}

# Jeu 1
create_game '{
  "title": "The Legend of Zelda: Breath of the Wild",
  "description": "Un jeu d action-aventure en monde ouvert où Link doit sauver Hyrule après un sommeil de 100 ans",
  "genre": "Adventure",
  "platform": ["Nintendo Switch", "Wii U"],
  "releaseYear": 2017,
  "publisher": "Nintendo",
  "rating": 9.8,
  "price": 59.99,
  "inStock": true
}'

# Jeu 2
create_game '{
  "title": "Elden Ring",
  "description": "Un action-RPG en monde ouvert signé FromSoftware et George R.R. Martin, difficile et immersif",
  "genre": "RPG",
  "platform": ["PS5", "Xbox Series X", "PC"],
  "releaseYear": 2022,
  "publisher": "Bandai Namco",
  "rating": 9.5,
  "price": 59.99,
  "inStock": true
}'

# Jeu 3
create_game '{
  "title": "God of War Ragnarök",
  "description": "Kratos et Atreus affrontent les dieux nordiques dans cette suite épique de God of War",
  "genre": "Action",
  "platform": ["PS5", "PS4"],
  "releaseYear": 2022,
  "publisher": "Sony Interactive Entertainment",
  "rating": 9.4,
  "price": 69.99,
  "inStock": true
}'

# Jeu 4
create_game '{
  "title": "FIFA 24",
  "description": "Le jeu de football le plus populaire revient avec des graphismes améliorés et le nouveau moteur HyperMotion",
  "genre": "Sports",
  "platform": ["PS5", "Xbox Series X", "PC", "Nintendo Switch"],
  "releaseYear": 2023,
  "publisher": "EA Sports",
  "rating": 7.5,
  "price": 69.99,
  "inStock": true
}'

# Jeu 5
create_game '{
  "title": "Resident Evil 4 Remake",
  "description": "Le remake complet du classique survival horror avec des graphismes modernes et un gameplay amélioré",
  "genre": "Horror",
  "platform": ["PS5", "Xbox Series X", "PC"],
  "releaseYear": 2023,
  "publisher": "Capcom",
  "rating": 9.2,
  "price": 59.99,
  "inStock": true
}'

# Jeu 6
create_game '{
  "title": "Mario Kart 8 Deluxe",
  "description": "Le jeu de course arcade de Nintendo avec Mario et ses amis, parfait pour jouer en famille",
  "genre": "Racing",
  "platform": ["Nintendo Switch"],
  "releaseYear": 2017,
  "publisher": "Nintendo",
  "rating": 9.0,
  "price": 59.99,
  "inStock": true
}'

# Jeu 7
create_game '{
  "title": "Cyberpunk 2077",
  "description": "Un RPG futuriste en monde ouvert se déroulant dans Night City, une mégalopole obsédée par le pouvoir",
  "genre": "RPG",
  "platform": ["PS5", "Xbox Series X", "PC"],
  "releaseYear": 2020,
  "publisher": "CD Projekt Red",
  "rating": 8.5,
  "price": 49.99,
  "inStock": true
}'

# Jeu 8
create_game '{
  "title": "The Witcher 3: Wild Hunt",
  "description": "Un RPG d action épique où vous incarnez Geralt de Riv, chasseur de monstres professionnel",
  "genre": "RPG",
  "platform": ["PS4", "Xbox One", "PC", "Nintendo Switch"],
  "releaseYear": 2015,
  "publisher": "CD Projekt Red",
  "rating": 9.8,
  "price": 39.99,
  "inStock": true
}'

# Jeu 9
create_game '{
  "title": "Street Fighter 6",
  "description": "Le dernier opus de la série légendaire de jeux de combat avec un système de combat modernisé",
  "genre": "Fighting",
  "platform": ["PS5", "Xbox Series X", "PC"],
  "releaseYear": 2023,
  "publisher": "Capcom",
  "rating": 8.8,
  "price": 59.99,
  "inStock": true
}'

# Jeu 10
create_game '{
  "title": "Tetris Effect: Connected",
  "description": "Une expérience de puzzle hypnotique qui fusionne le Tetris classique avec de la musique et des visuels époustouflants",
  "genre": "Puzzle",
  "platform": ["PS4", "Xbox Series X", "PC", "Nintendo Switch"],
  "releaseYear": 2020,
  "publisher": "Enhance Games",
  "rating": 8.5,
  "price": 29.99,
  "inStock": false
}'

echo "=================================================="
echo "✅ Insertion terminée!"
echo ""
echo "📊 Vérifiez le résultat:"
echo "   curl http://localhost:3000/api/games"

