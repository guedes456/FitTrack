<script setup>
// FormCard extrai o wrapper repetido em Login/Registro/Perfil: um título
// com a cor de marca e um card do Bootstrap com o detalhe de borda
// superior (card-brand-accent). Cada tela só entra com o formulário
// dentro do slot padrão.
defineProps({
  title: { type: String, required: true },
  maxWidth: { type: String, default: '420px' },
  centered: { type: Boolean, default: true },
})
</script>

<template>
  <div class="container" :class="{ 'py-5': centered }">
    <div class="row" :class="{ 'justify-content-center': centered }">
      <div class="col-12 col-md-8 col-lg-6" :style="{ maxWidth }">
        <div class="card shadow-sm border-0 card-brand-accent">
          <div class="card-body p-4">
            <h1 class="h3 mb-4 text-center brand-title">{{ title }}</h1>
            <slot />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
