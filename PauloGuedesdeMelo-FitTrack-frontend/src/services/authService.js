import api from './api'

export function register(payload) {
  return api.post('/register', payload, { silent: true })
}

export function login(payload) {
  return api.post('/login', payload, { silent: true })
}

// O segundo argumento é UNDEFINED (sem corpo). Com `null`, o Axios envia o
// corpo "null" com Content-Type application/json; o express.json() recusa
// esse corpo (400 de parse) e, com o cors configurado depois dos parsers,
// a resposta saía sem Access-Control-Allow-Origin: o Console mostrava "erro
// de CORS" em vez do 400 verdadeiro. O terceiro argumento é o config.
export function logout() {
  return api.post('/logout', undefined, { silent: true })
}
