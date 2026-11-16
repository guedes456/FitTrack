// Constantes do front-end. Os limites de validação e o tamanho de página
// DEVEM combinar com config/constants.js da API (VALIDATION e PAGINATION):
// se um lado mudar, o outro precisa mudar junto.

// Chaves do localStorage. Ficam aqui (e não escritas à mão em api.js e na
// store) para um erro de digitação não criar duas chaves "quase iguais".
export const STORAGE_KEYS = {
  TOKEN: 'fittrack_token',
  USER: 'fittrack_user',
}

// Limites de validação dos formulários (espelham VALIDATION da API).
export const LIMITS = {
  USERNAME_MIN: 3,
  USERNAME_MAX: 20,
  PASSWORD_MIN: 6,
  BIO_MAX: 160,
  TITLE_MAX: 60,
  DESCRIPTION_MAX: 300,
  COMMENT_MAX: 500,
}

// Itens por página nos feeds (igual a PAGINATION.DEFAULT_LIMIT da API; o
// teto da API, MAX_LIMIT, é 50).
export const PAGE_SIZE = 12

// Quanto tempo cada tipo de toast fica na tela, em milissegundos.
export const TOAST_DURATION = {
  SUCCESS: 3000,
  INFO: 4000,
  ERROR: 5000,
}

// Mensagens padrão, usadas quando a API não devolve uma.
export const MESSAGES = {
  GENERIC_ERROR: 'Ocorreu um erro na requisição.',
  NETWORK_ERROR:
    'Não foi possível se conectar ao servidor. Verifique sua conexão ou tente novamente mais tarde.',
  REQUEST_SETUP_ERROR: 'Erro inesperado ao preparar a requisição.',
  LIKE_ERROR: 'Não foi possível registrar sua curtida.',
  FOLLOW_ERROR: 'Não foi possível concluir. Tente novamente.',
  WORKOUT_DELETED: 'Treino excluído com sucesso.',
}
