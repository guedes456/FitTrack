# FitTrack - Arquitetura DDD (Avaliação N2)

Reorganização do backend do FitTrack em **contextos delimitados (DDD)** com **arquitetura hexagonal**.
Esta pasta contém apenas a organização (pastas e descrições), sem código-fonte, conforme a Questão 1 da N2 de
Projeto e Arquitetura de Software (prof. Luiz C. Camargo, 29/10/2026).

Autor: Paulo Guedes de Melo

## Contextos

| Contexto | Tipo | Responsabilidade |
|---|---|---|
| identity | Apoio | Cadastro, login, JWT, perfil |
| training | Core | Publicação e gestão de treinos (Workout é o agregado raiz) |
| engagement | Core | Curtidas e comentários |
| discovery | Leitura | Feed paginado e busca (modelos de leitura) |
| notifications | Apoio (novo) | Notificações geradas a partir de eventos (Questão 2) |

## Regra de dependência

`infrastructure -> application -> domain`. O domínio não importa Express, Sequelize, bcrypt, jsonwebtoken nem fs.
O domínio declara **portas** (interfaces); a infraestrutura fornece os **adaptadores**.
Contextos não importam os modelos uns dos outros: comunicam-se por IDs e por **eventos de domínio**.

## Documentos

- [docs/mapa-de-contextos.md](docs/mapa-de-contextos.md)
- [docs/linguagem-ubiqua.md](docs/linguagem-ubiqua.md)
- [docs/eventos.md](docs/eventos.md)

Projeto-base: https://github.com/guedes456/FitTrack
