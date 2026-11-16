module.exports = {
  VALIDATION: {
    USERNAME_MIN: 3,
    USERNAME_MAX: 20,
    PASSWORD_MIN: 6,
    // Constante dedicada ao campo bio — criada de propósito em vez de
    // reaproveitar USERNAME_MAX (que, coincidentemente, também é um número
    // pequeno). São limites de campos diferentes por natureza: usar o mesmo
    // valor por acaso funcionar hoje quebraria silenciosamente no dia em que
    // um dos dois precisasse mudar sozinho.
    BIO_MAX: 160,
    // Limites da entidade Workout (Aula 07). Mesma lógica do BIO_MAX acima:
    // cada campo tem sua própria constante, mesmo que o valor coincida com
    // outro por enquanto.
    TITLE_MAX: 60,
    DESCRIPTION_MAX: 300,
    // Limite do texto de um comentário (Aula 10).
    COMMENT_MAX: 500,
    // Rotinas (Aula 13): a coleção pessoal de treinos do usuário. Cada campo
    // tem a sua constante (mesma lógica do BIO_MAX acima).
    ROUTINE_TITLE_MIN: 3,
    ROUTINE_TITLE_MAX: 100,
    ROUTINE_DESCRIPTION_MAX: 500
  },
  // Busca global (Aula 13). MIN_LENGTH evita consultar o banco com 1 letra
  // (devolveria quase tudo); MAX_LENGTH corta textos gigantes; LIMIT é o teto
  // de resultados POR LISTA (treinos e pessoas). Deve combinar com SEARCH do
  // front-end (MIN_LENGTH).
  SEARCH: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    LIMIT: 10
  },
  // Paginação dos feeds (Aula 08, consolidada no Checkpoint 2 / Aula 12).
  // MAX_LIMIT impede que o cliente peça ?limit=100000 e faça o banco devolver
  // a tabela inteira de uma vez. Deve combinar com PAGE_SIZE do front-end.
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12,
    MAX_LIMIT: 50
  },
  // Tamanho máximo dos uploads, em bytes. Ficam aqui (e não escritos nos dois
  // Multers) para que a mensagem de erro do errorHandler use o mesmo número.
  UPLOAD: {
    WORKOUT_IMAGE_MAX_BYTES: 8 * 1024 * 1024,
    PROFILE_IMAGE_MAX_BYTES: 5 * 1024 * 1024
  }
};
