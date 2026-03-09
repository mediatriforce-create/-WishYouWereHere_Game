# Wish You Were Here | Translation Experience

Uma experiência interativa premium, cinematográfica e educacional baseada na profundidade emocional da música "Wish You Were Here" (Pink Floyd).

## 🎬 Direção de Arte
O design foi construído não como um simples "quiz de escola", mas como uma obra interativa:
- **Atmosfera Surreal:** Fundos profundos, pretos intensos e painéis de vidro translúcidos (*glassmorphism* avançado).
- **Sensório:** Uma simulação suave de "brasas/cinzas" flutuantes em um `canvas` ao fundo, representando fogo, fumaça e ausência. Overlays de granulação de filme ("film grain") e vinhetas dramáticas.
- **Tipografia Editorial:** Uso de *Cormorant Garamond* para títulos elegantes e equilibrados, contrastando com *Montserrat* para leitura clara em interfaces.
- **Microinterações:** Botões com efeitos de *glow* orgânico (brilho que pulsa levemente), barras de progresso contínuas e *feedback* visual em SVG desenhado por código que calcula a porcentagem visualmente ao vivo.

## 🚀 Funcionalidades e Modos

1. **Tutorial:** Demonstração rápida dos dois tipos de perguntas (Objetivas vs. Digitadas com cálculo de percentual de similaridade).
2. **Normal Mode:** O jogador enfrenta 10 rodadas cronometradas com mescla de tipos de questões.
3. **1v1 Versus (Modo Bloco):** Competição severa. O Jogador 1 responde às 10 perguntas. Uma tela teatral ("Relinquish Control") passa a vez para o Jogador 2 enfrentar os mesmos desafios.
4. **Desempate Robusto:** A tela final calcula o vencedor baseada em: 1. Maior Pontuação -> 2. Mais acertos de 100% (Perfects) -> 3. Melhor média geral de precisão -> 4. Menor tempo levado.

## ⚙️ Como Executar

Não requer instalação de Node.js, npm ou bundlers complexos.
Basta dar um duplo clique no arquivo `index.html` ou abri-lo pelo "Live Server" do VSCode. Tudo roda limpo no navegador com Vanilla JS e CSS puro.

## ✏️ Como Editar e Inserir o Conteúdo Real

Toda a lógica e apresentação já estão finalizadas. Para trocar as perguntas "mockadas" pelas questões reais do trabalho, você só precisa editar **1 arquivo**:

Abra o arquivo `js/questions.js`.
Nele existem duas listas (arrays): `tutorialData` e `questionsData`.
Edite os blocos dentro de `questionsData` conforme o exemplo abaixo:

```javascript
{
    id: 1, // Mantenha a ordem numérica
    type: "multiple_choice", // Pode ser: multiple_choice, true_false, interpretation, typed_translation, partial_translation
    prompt: "Choose the best translation", // O subtítulo da instrução
    sourceText: "So, so you think you can tell", // O trecho em inglês (Ou a minutagem que você deseja)
    options: [
        "Opção 1",
        "Opção 2",
        "Opção 3",
        "Opção 4"
    ], // Remova esse campo se for do tipo 'typed_translation'
    correctAnswer: "Opção 1", // Deve ser igual a uma das opções, ou a string exata para digitação
    explanation: "Explicação sobre o conceito após a pessoa responder.",
    points: 10
}
```

## 🎵 Preparado para o Futuro (Integração de Áudio)

Para inserir música real futuramente:
1. Adicione um arquivo `.mp3` na pasta (ex: `assets/wish.mp3`).
2. No `index.html`, insira a tag `<audio id="bg-audio" src="assets/wish.mp3"></audio>`.
3. No arquivo `js/main.js`, na função `setupGame()`, você pode capturar a tag (`document.getElementById('bg-audio').play()`) para iniciar a música logo quando o jogo começa.
4. Você pode usar o `sourceText` de cada questão para colocar minutagens (ex: `"0:45 - 0:52"`) e programar o áudio para pular para aquele `currentTime`!