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
  // Rotinas (Aula 13): iguais a VALIDATION.ROUTINE_* da API.
  ROUTINE_TITLE_MIN: 3,
  ROUTINE_TITLE_MAX: 100,
  ROUTINE_DESCRIPTION_MAX: 500,
}

// Busca (Aula 13). MIN_LENGTH é igual ao da API (SEARCH.MIN_LENGTH): abaixo
// disso nem fazemos requisição. DEBOUNCE_MS é quanto tempo, sem digitar, o
// termo precisa ficar parado antes de a busca disparar.
export const SEARCH = {
  MIN_LENGTH: 2,
  DEBOUNCE_MS: 400,
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
  REPORT_SENT: 'Denúncia enviada. Obrigado por avisar.',
  ROUTINE_DELETED: 'Rotina excluída com sucesso.',
  WORKOUT_REMOVED_FROM_ROUTINE: 'Treino removido da rotina.',
}

// Notificações (Aula 14). POLL_MS: de quanto em quanto tempo o sino pergunta
// "quantas não lidas?" (30 s: o aviso chega "quase na hora" sem martelar a
// API; ver stores/notifications.js).
export const NOTIFICATIONS = {
  POLL_MS: 30000,
}

// Texto de cada tipo de notificação: "@usuário" + este texto (+ título do
// treino, quando há). As chaves são as MESMAS que a API grava no ENUM.
export const NOTIFICATION_TEXT = {
  like: 'curtiu o seu treino',
  comment: 'comentou no seu treino',
  follow: 'começou a seguir você',
}

// Motivos de denúncia: a API guarda a CHAVE (key); a tela mostra o RÓTULO
// (label). A lista e a ordem são fixas para todos os projetos (a Aula 15 lê
// as denúncias com a mesma lista).
export const REPORT_REASONS = [
  { key: 'inappropriate_content', label: 'Conteúdo impróprio' },
  { key: 'harassment', label: 'Assédio ou discurso de ódio' },
  { key: 'spam', label: 'Spam ou golpes' },
  { key: 'copyright', label: 'Violação de direitos autorais' },
  { key: 'other', label: 'Outro' },
]
