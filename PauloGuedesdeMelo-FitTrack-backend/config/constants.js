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
    DESCRIPTION_MAX: 300
  }
};
