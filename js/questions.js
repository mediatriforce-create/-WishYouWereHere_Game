/**
 * DADOS OFICIAIS - WISH YOU WERE HERE
 */

window.tutorialData = [
    {
        id: "t1",
        type: "multiple_choice",
        prompt: "Exemplo de Múltipla Escolha",
        sourceText: "Hello, world!",
        options: ["Olá, mundo", "Adeus, terra", "Bom dia, gente"],
        correctAnswer: "Olá, mundo",
        explanation: "Neste modo, você escolhe a tradução correta. Acertos valem 10 pontos.",
        points: 10
    },
    {
        id: "t2",
        type: "typed_translation",
        prompt: "Exemplo de Tradução Digitada",
        sourceText: "I love music",
        correctAnswer: "Eu amo música",
        explanation: "Aqui você digita a tradução. O jogo calcula a porcentagem de acerto se você chegar perto da resposta real.",
        points: 10
    }
];

window.questionsData = [
    {
        id: 1,
        type: "multiple_choice",
        prompt: "Contextual Translation",
        sourceText: "So, so you think you can tell",
        options: ["Então, então você acha que consegue diferenciar", "Então, então você pensa que pode falar", "Assim, assim você acha que pode dizer", "Então, então você sabe que pode contar"],
        correctAnswer: "Então, então você acha que consegue diferenciar",
        explanation: "Context is key. 'Tell' here means to distinguish reality from illusion.",
        points: 10
    },
    {
        id: 2,
        type: "typed_translation",
        prompt: "Exact Translation",
        sourceText: "Heaven from hell",
        correctAnswer: "O paraíso do inferno",
        explanation: "The ultimate contrast. Differentiating the divine from the torturous.",
        points: 10
    },
    {
        id: 3,
        type: "true_false",
        prompt: "True or False?",
        sourceText: "'Blue skies from pain' significa 'Céus azuis da chuva'.",
        options: ["True", "False"],
        correctAnswer: "False",
        explanation: "It translates to 'Céus azuis da dor'.",
        points: 10
    },
    {
        id: 4,
        type: "typed_translation",
        prompt: "Complete the Meaning",
        sourceText: "Can you tell a green field",
        correctAnswer: "Você consegue diferenciar um campo verde",
        explanation: "The 'green field' symbolizes life and reality.",
        points: 10
    },
    {
        id: 5,
        type: "multiple_choice",
        prompt: "Symbolic Interpretation",
        sourceText: "From a cold steel rail?",
        options: ["De um trilho de aço frio?", "De uma grade de aço fria?", "De uma chuva de aço frio?", "De um metal frio correndo?"],
        correctAnswer: "De um trilho de aço frio?",
        explanation: "The cold steel rail represents industrial lifelessness.",
        points: 10
    },
    {
        id: 6,
        type: "typed_translation",
        prompt: "Translate the Metaphor",
        sourceText: "A smile from a veil?",
        correctAnswer: "Um sorriso de um véu?",
        explanation: "Differentiating genuine emotion from something concealed.",
        points: 10
    },
    {
        id: 7,
        type: "multiple_choice",
        prompt: "Confirm the Question",
        sourceText: "Do you think you can tell?",
        options: ["Você acha que consegue diferenciar?", "Você acha que consegue contar?", "Você acha que pode falar?", "Você acha que pode dizer?"],
        correctAnswer: "Você acha que consegue diferenciar?",
        explanation: "Requestioning the listener's grip on reality.",
        points: 10
    },
    {
        id: 8,
        type: "multiple_choice",
        prompt: "Deep Meaning",
        sourceText: "Did they get you to trade",
        options: ["Eles fizeram você trocar", "Eles pegaram você para trocar", "Eles conseguiram que você negociasse", "Eles te deram para trocar"],
        correctAnswer: "Eles fizeram você trocar",
        explanation: "'Get you to' implies persuasion or coercion.",
        points: 10
    },
    {
        id: 9,
        type: "typed_translation",
        prompt: "Your heroes for ghosts?",
        correctAnswer: "Seus heróis por fantasmas?",
        explanation: "Trading real inspirations for empty memories.",
        sourceText: "Your heroes for ghosts?",
        points: 10
    },
    {
        id: 10,
        type: "multiple_choice",
        prompt: "The Title",
        sourceText: "Wish you were here",
        options: ["Queria que você estivesse aqui", "Espero que você viaje", "Você mora aqui", "Desejo você aqui agora"],
        correctAnswer: "Queria que você estivesse aqui",
        explanation: "A profound expression of absence and longing.",
        points: 10
    }
];