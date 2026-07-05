#!/usr/bin/env bash
# FishNote 로컬 DB 셋업 (멱등 — 여러 번 실행해도 안전)
# 사전: brew install postgresql@16  (한 번만)
set -e

# Homebrew postgres 경로를 PATH에 추가 (Apple Silicon / Intel 둘 다)
export PATH="/opt/homebrew/opt/postgresql@16/bin:/usr/local/opt/postgresql@16/bin:$PATH"

echo "▶ PostgreSQL 서비스 시작..."
brew services start postgresql@16 || true
sleep 3

echo "▶ postgres 역할 생성 (이미 있으면 통과)..."
createuser -s postgres 2>/dev/null && echo "  postgres 역할 생성됨" || echo "  postgres 역할 이미 존재"

echo "▶ fishnote DB 생성 (이미 있으면 통과)..."
createdb -O postgres fishnote 2>/dev/null && echo "  fishnote DB 생성됨" || echo "  fishnote DB 이미 존재"

echo ""
echo "✅ DB 준비 완료. 다음:"
echo "   1) 백엔드:  cd BE && ./gradlew bootRun"
echo "   2) 프론트:  cd FE && npm run dev   (포트 5173 권장)"
echo "   3) 확인:    curl http://localhost:8080/api/v1/health"
