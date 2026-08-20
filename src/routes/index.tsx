import { createFileRoute } from "@tanstack/react-router";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  return (
    <div className="p-8 max-w-4xl mx-auto whitespace-pre-wrap font-sans text-gray-900 bg-[#fcfbf8] min-h-screen">
      Perfeito — agora entendi. **Você não quer criar um novo site semelhante ao Veo AI Free e nem necessariamente integrar a API dele.**

Você quer **incorporar dentro do seu aplicativo já criado no Lovable um painel de geração**, inspirado na estrutura da página que você mostrou, para que o usuário possa gerar **imagens, vídeos e prompts dentro do seu próprio app**.

Use este comando no Lovable:

Quero incorporar ao meu aplicativo atual um **Painel de Geração com Inteligência Artificial**, integrado à estrutura e ao design já existentes no projeto.

IMPORTANTE: Não criar um novo aplicativo e não substituir as funcionalidades existentes.

Apenas adicionar um novo módulo/painel de geração dentro do app atual.

Utilizar como referência de estrutura e experiência de uso o painel mostrado na imagem enviada e o fluxo de funcionalidades da página Veo AI Free, porém criar uma interface própria e integrada visualmente ao meu aplicativo.

# OBJETIVO

Criar dentro do aplicativo um painel único chamado:

# AI Generator

Esse painel deve permitir que o usuário gere conteúdos através de quatro funcionalidades:

1. **Image to Video**
2. **Image Generator**
3. **Video Generator**
4. **Prompt Generator**

O painel deve estar completamente integrado ao menu, autenticação, banco de dados, projetos e sistema de usuários já existentes no aplicativo.

---

# 1. ADICIONAR NOVO MÓDULO AO MENU

Adicionar um novo item no menu lateral:

**AI Generator**

Ao clicar, abrir a página principal do painel de geração.

Dentro da página, criar abas no topo:

* Image to Video
* Image Generator
* Video Generator
* Prompt Generator

As abas devem funcionar sem sair da página.

---

# 2. ESTRUTURA VISUAL DO PAINEL

Utilizar como referência a estrutura do painel mostrado na imagem.

Criar uma área central de geração contendo:

* título da ferramenta;
* descrição curta;
* campo grande para digitação do prompt;
* botão **Enhance**;
* área para upload de imagem quando necessário;
* configurações de geração;
* botão principal **Generate**.

Manter o mesmo padrão visual já utilizado no meu aplicativo.

Não copiar marca, logotipo ou identidade visual de outros sites.

O painel deve parecer uma funcionalidade nativa do meu app.

---

# 3. ABA — IMAGE TO VIDEO

Título:

**Image to Video Generator**

Descrição:

Permita que o usuário envie uma imagem e utilize Inteligência Artificial para transformá-la em vídeo.

Criar:

### Campo de Prompt

Placeholder:

`Descreva o movimento, a ação ou a animação que deseja criar...`

Exemplo:

`A câmera se aproxima lentamente do personagem enquanto o vento movimenta seus cabelos.`

### Botão Enhance

Adicionar botão:

**✨ Enhance**

Quando clicado, utilizar o sistema de IA conectado ao aplicativo para melhorar e detalhar o prompt.

O prompt aprimorado deve considerar:

* objeto ou personagem;
* ação;
* movimento;
* ambiente;
* iluminação;
* movimento de câmera;
* estilo cinematográfico;
* composição;
* qualidade.

O usuário deve poder:

* manter o prompt original;
* utilizar o prompt aprimorado.

### Upload de Imagem

Criar área:

**Arraste uma imagem ou clique para enviar**

Permitir:

* JPG
* PNG
* WEBP

Após upload:

* mostrar preview;
* remover;
* substituir;
* utilizar a imagem como referência para geração.

### Configurações

Adicionar:

* Modelo
* Duração
* Proporção
* Resolução
* Intensidade de movimento
* Movimento de câmera
* Número de variações
* Gerar áudio, quando suportado

### Botão

**GENERATE VIDEO**

---

# 4. ABA — IMAGE GENERATOR

Criar uma ferramenta:

**Text to Image**

Campo:

`Descreva a imagem que deseja criar...`

Adicionar:

* Enhance Prompt;
* seleção de modelo;
* estilo;
* proporção;
* qualidade;
* número de imagens.

Botão:

**GENERATE IMAGE**

Após gerar a imagem, mostrar:

* preview;
* download;
* copiar prompt;
* criar variação;
* salvar;
* favoritar.

Adicionar botão:

**Animate Image**

Quando clicado, transferir automaticamente a imagem para a aba:

**Image to Video**

---

# 5. ABA — VIDEO GENERATOR

Criar ferramenta:

**Text to Video**

Campo:

`Descreva o vídeo que deseja criar...`

Adicionar botão:

**✨ Enhance**

Adicionar configurações:

* Modelo
* Duração
* Proporção
* Resolução
* Movimento da câmera
* Estilo
* Áudio
* Número de variações

Botão:

**GENERATE VIDEO**

A geração deve funcionar através do sistema de integração de IA configurado no aplicativo.

---

# 6. ABA — PROMPT GENERATOR

Criar uma ferramenta específica para ajudar o usuário a criar prompts.

Campo:

`Descreva sua ideia...`

Exemplo:

`Quero criar um vídeo de um carro futurista dirigindo em uma cidade com luzes neon.`

Botão:

**GENERATE PROMPT**

O sistema deve transformar a ideia em um prompt profissional.

Mostrar o resultado dividido em:

* Prompt principal;
* Estilo;
* Ambiente;
* Iluminação;
* Movimento;
* Câmera;
* Qualidade;
* Negative Prompt.

Adicionar botões:

* Copy Prompt
* Use for Image
* Use for Video
* Use for Image to Video

Ao clicar, transferir automaticamente o prompt para a ferramenta correspondente.

---

# 7. INTEGRAÇÃO ENTRE AS FERRAMENTAS

As ferramentas precisam conversar entre si.

Implementar os fluxos:

```text
IDEIA
↓
PROMPT GENERATOR
↓
IMAGE GENERATOR
↓
IMAGEM GERADA
↓
ANIMATE IMAGE
↓
IMAGE TO VIDEO
↓
VÍDEO FINAL
```

E também:

```text
IDEIA
↓
PROMPT GENERATOR
↓
VIDEO GENERATOR
↓
VÍDEO FINAL
```

O usuário não deve precisar copiar manualmente prompts ou arquivos entre as ferramentas.

---

# 8. PAINEL DE CONFIGURAÇÕES

Criar um botão de configurações no canto superior direito do painel.

Ao clicar, abrir uma área lateral ou modal.

Permitir configurar:

* modelo padrão para imagem;
* modelo padrão para vídeo;
* proporção padrão;
* resolução;
* duração padrão;
* qualidade;
* quantidade padrão de variações.

As configurações devem ser persistentes para cada usuário.

---

# 9. RESULTADO DA GERAÇÃO

Abaixo ou ao lado do painel, criar uma área:

# Generated Results

Enquanto estiver gerando:

* mostrar loading;
* status;
* barra de progresso.

Status:

* Queued
* Processing
* Completed
* Failed

Quando concluído:

### Para imagens

* Preview
* Download
* Favorite
* Delete
* Create Variation
* Animate Image

### Para vídeos

* Player
* Download
* Favorite
* Delete
* Create Variation
* Save to Project

---

# 10. INTEGRAÇÃO COM A API JÁ CONFIGURADA

O painel deve utilizar a arquitetura de APIs já existente no aplicativo.

Não criar uma segunda estrutura independente.

Integrar o painel aos serviços já utilizados para:

* geração de imagens;
* geração de vídeos;
* melhoria de prompts;
* upload;
* armazenamento;
* autenticação.

Caso ainda não exista uma API configurada, criar uma camada centralizada de integração para que o administrador possa conectar posteriormente os provedores de IA.

A arquitetura deve utilizar:

```text
AIProviderService
```

Com funções:

```text
generateImage()
generateVideo()
generateImageToVideo()
enhancePrompt()
getGenerationStatus()
```

O frontend nunca deve conter API Keys.

Todas as chamadas devem ocorrer através de backend ou funções seguras.

---

# 11. INTEGRAÇÃO COM O APP ATUAL

Muito importante:

O novo painel deve utilizar:

* o sistema de login já existente;
* o usuário autenticado atual;
* banco de dados existente;
* sistema de projetos existente;
* sistema de créditos existente, se já houver;
* armazenamento de arquivos existente;
* layout e componentes visuais existentes.

Não criar novos sistemas duplicados caso eles já existam.

Reutilizar a arquitetura atual sempre que possível.

---

# 12. HISTÓRICO

Adicionar todas as gerações realizadas pelo usuário ao histórico existente do aplicativo.

Salvar:

* tipo de geração;
* prompt original;
* prompt aprimorado;
* imagem de entrada;
* resultado;
* modelo;
* configurações;
* status;
* data.

O usuário deve visualizar apenas suas próprias gerações.

---

# 13. COMPORTAMENTO RESPONSIVO

O painel deve funcionar em:

* Desktop
* Tablet
* Mobile

No celular:

* as abas devem ser adaptadas;
* os controles devem ser empilhados;
* a área de resultados deve continuar acessível;
* uploads devem funcionar corretamente.

---

# RESULTADO FINAL

Incorporar ao meu aplicativo atual um **painel profissional de geração por Inteligência Artificial**, semelhante em conceito à experiência de um gerador de imagens e vídeos, mas totalmente integrado ao meu sistema.

O resultado deve permitir que o usuário faça:

```text
PROMPT
↓
ENHANCE COM IA
↓
GERAR IMAGEM OU VÍDEO
↓
ACOMPANHAR PROCESSAMENTO
↓
VISUALIZAR RESULTADO
↓
GERAR VARIAÇÃO
↓
TRANSFORMAR IMAGEM EM VÍDEO
↓
SALVAR NO PROJETO
```

IMPORTANTE:

* Não criar um novo app.
* Não remover funcionalidades existentes.
* Não duplicar sistemas já existentes.
* Incorporar este painel ao aplicativo atual.
* Reutilizar autenticação, banco de dados e estrutura existente.
* Manter o padrão visual do app.
* Fazer o painel funcionar como uma parte nativa da plataforma.
    </div>
  );
}
