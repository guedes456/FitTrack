#!/usr/bin/env bash
# Atividade 11 — Parte A, Etapa 4. Rode com a API no ar e três contas criadas.
# Uso: TA=<token A> TB=<token B> TC=<token C> IDB=<id de B> IDA=<id de A> ./testes-curl.sh
# (tokens: POST /api/login; ids: GET /api/profile/<username> -> data.id)
API=${API:-http://localhost:3000/api}
H() { echo "Authorization: Bearer $1"; }
run() { echo; echo "### $1"; shift; "$@"; echo; }

run "1a. sem token -> 401"        curl -s -i -X POST $API/users/$IDB/toggle-follow
run "1b. id abc -> 400"           curl -s -X POST -H "$(H $TA)" $API/users/abc/toggle-follow
run "1c. a si mesmo -> 400"       curl -s -X POST -H "$(H $TA)" $API/users/$IDA/toggle-follow
run "1d. inexistente -> 404"      curl -s -X POST -H "$(H $TA)" $API/users/99999/toggle-follow
run "2a. A segue B -> 201 (1)"    curl -s -i -X POST -H "$(H $TA)" $API/users/$IDB/toggle-follow
run "2b. A de novo -> 200 (0)"    curl -s -i -X POST -H "$(H $TA)" $API/users/$IDB/toggle-follow
run "2c. A de novo -> 201 (1)"    curl -s -i -X POST -H "$(H $TA)" $API/users/$IDB/toggle-follow
run "2d. C segue B -> (2)"        curl -s -X POST -H "$(H $TC)" $API/users/$IDB/toggle-follow
run "2e. B segue A"               curl -s -X POST -H "$(H $TB)" $API/users/$IDA/toggle-follow
run "3. contadores (troque os usernames)" bash -c "for u in \$USER_B \$USER_A \$USER_C; do curl -s $API/profile/\$u | head -c 300; echo; done"
run "4a. follow-status A->B true" curl -s -H "$(H $TA)" $API/users/$IDB/follow-status
run "4b. perfil B visto por A"    curl -s -H "$(H $TA)" $API/profile/$USER_B
run "4c. perfil B visitante"      curl -s $API/profile/$USER_B
run "5a. followers de B"          curl -s $API/users/$IDB/followers
run "5b. following de A"          curl -s $API/users/$IDA/following
run "5c. usuário inexistente 404" curl -s -i $API/users/99999/followers
run "6a. feed sem token -> 401"   curl -s -i $API/following-workouts
run "6b. feed de A"               curl -s -H "$(H $TA)" "$API/following-workouts"
run "6c. página 2 limit 1"        curl -s -H "$(H $TA)" "$API/following-workouts?page=2&limit=1"
