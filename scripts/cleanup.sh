#!/bin/bash

# Remove unnecessary directories
rm -rf dist/
rm -rf test/
rm -rf docker/

# Create new structure
mkdir -p apps/backend/src/modules/{docs,auth,chat,tasks,cache}
mkdir -p apps/frontend/src/{components,stores,views}
mkdir -p notes/{concepts,guides,best-practices}
mkdir -p notes/concepts/{cqrs,caching,websockets,auth}

# Move relevant files
mv src/modules/docs/* apps/backend/src/modules/docs/ 2>/dev/null
mv src/modules/auth/* apps/backend/src/modules/auth/ 2>/dev/null

# Clean up old directories
rm -rf src/

# Create placeholder files for documentation
touch notes/concepts/cqrs/README.md
touch notes/concepts/caching/README.md
touch notes/concepts/websockets/README.md
touch notes/concepts/auth/README.md

echo "Project structure cleaned and reorganized!"
