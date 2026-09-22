<script setup>
// BaseInput centraliza o padrão repetido em todo formulário do projeto:
// label + campo (input ou textarea) + mensagem de erro abaixo, com as
// classes do Bootstrap já aplicadas.
//
// defineModel() substitui a dança manual de "props: ['modelValue'] +
// emits: ['update:modelValue']" que cada componente com v-model precisava
// declarar na mão. Aqui, chamar defineModel() já cria uma variável
// reativa (model) ligada automaticamente ao v-model do componente pai —
// sem precisar escrever handler de emit nenhum.
const model = defineModel({ type: [String, Number], default: '' })

defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  multiline: { type: Boolean, default: false },
  rows: { type: Number, default: 3 },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  maxlength: { type: Number, default: null },
  autocomplete: { type: String, default: null },
  required: { type: Boolean, default: false },
})
</script>

<template>
  <div class="mb-3">
    <label :for="id" class="form-label">{{ label }}</label>

    <textarea
      v-if="multiline"
      :id="id"
      v-model="model"
      class="form-control"
      :class="{ 'is-invalid': error }"
      :rows="rows"
      :maxlength="maxlength"
      :required="required"
    ></textarea>

    <input
      v-else
      :id="id"
      v-model="model"
      :type="type"
      class="form-control"
      :class="{ 'is-invalid': error }"
      :maxlength="maxlength"
      :autocomplete="autocomplete"
      :required="required"
    />

    <div class="d-flex justify-content-between">
      <span v-if="error" class="text-danger small">{{ error }}</span>
      <span v-else-if="hint" class="text-muted small">{{ hint }}</span>
      <span v-if="multiline && maxlength" class="text-muted small ms-auto">
        {{ model.length }}/{{ maxlength }}
      </span>
    </div>
  </div>
</template>
