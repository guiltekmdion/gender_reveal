#!/bin/bash
# Script de débogage pour capturer les logs de build Docker

LOG_FILE="/home/mdion/Documents/GitHub/gender_reveal/.cursor/debug.log"
TIMESTAMP=$(date +%s)

# Fonction pour logger
log() {
    echo "{\"id\":\"log_${TIMESTAMP}_$(date +%N)\",\"timestamp\":$(date +%s)000,\"location\":\"build-debug.sh\",\"message\":\"$1\",\"data\":$2,\"sessionId\":\"debug-session\",\"runId\":\"docker-build\",\"hypothesisId\":\"$3\"}" >> "$LOG_FILE"
}

log "Docker build started" "{\"command\":\"docker-compose build\"}" "A"

# Exécuter le build et capturer la sortie
if docker-compose build 2>&1 | tee /tmp/docker-build.log; then
    log "Docker build succeeded" "{\"status\":\"success\"}" "A"
    exit 0
else
    BUILD_ERROR=$(cat /tmp/docker-build.log | tail -50)
    log "Docker build failed" "{\"status\":\"failed\",\"error\":\"$BUILD_ERROR\"}" "A"
    exit 1
fi
