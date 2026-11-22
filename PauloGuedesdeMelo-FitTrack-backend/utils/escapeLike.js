// No LIKE, % significa "qualquer coisa" e _ significa "qualquer caractere".
// Sem escape, digitar %% casaria com TUDO (e "a_c" casaria com "abc").
// Escapar com \ (o escape padrão do LIKE no MySQL) faz esses caracteres
// valerem como texto comum. A própria barra também precisa ser escapada.
//
// Extraída do searchService já na Aula 15: a busca pública e as buscas do
// painel de administração (usuários e treinos) precisam da MESMA função.
function escapeLike(text) {
  return text.replace(/[\\%_]/g, '\\$&');
}

module.exports = escapeLike;
