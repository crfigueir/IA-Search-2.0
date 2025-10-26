// 🔹 Importa a função de salvamento do módulo Firebase
import { salvarPontuacao } from "./firebase-module.js";

// QUIZ.JS - Versão Final
(function () {
    'use strict';

    // Variável global para armazenar o nome do jogador
    let nomeJogador = "";

    // Função utilitária para mostrar debug na página
    function showDebug(msg) {
        const box = document.getElementById('debug');
        if (!box) return;
        box.style.display = 'block';
        box.textContent = typeof msg === 'string' ? msg : JSON.stringify(msg, null, 2);
        console.error('DEBUG:', msg);
    }

    // Carregar quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', () => {
        try {
            // Seletores principais
            const quizEl = document.getElementById('quiz');
            const scoreEl = document.getElementById('score');
            const totalEl = document.getElementById('total');
            const nextBtn = document.getElementById('next-btn');

            // Seletores de Tela
            const startScreen = document.getElementById('start-screen');
            const startBtn = document.getElementById('start-btn');
            const nomeInput = document.getElementById('nome-jogador');
            const quizMainContent = document.getElementById('quiz-main-content');
            const resultScreen = document.getElementById('result-screen');
            const finalMessageEl = document.getElementById('final-message');
            const finalScoreEl = document.getElementById('final-score');

            // Verificação inicial dos elementos
            if (!quizEl || !totalEl || !nextBtn || !startScreen || !startBtn || !nomeInput || !quizMainContent || !resultScreen) {
                showDebug('ERRO FATAL: Elementos HTML obrigatórios estão ausentes ou com IDs incorretos.');
                return;
            }

            // Função para criar áudio de forma segura
            function safeAudio(src) {
                try {
                    return new Audio(src);
                } catch (err) {
                    console.warn('Falha ao criar Audio para', src);
                    return { play: () => {} };
                }
            }

            const somAcerto = safeAudio('acerto.mp3');
            const somErro = safeAudio('erro.mp3');
            const somClick = safeAudio('click.mp3');

            // === Dados do quiz ===
            const quizData = [
                {
                    id: 1,
                    titulo: 'Conversa por WhatsApp',
                    mensagens: [
                        { autor: 'Contato Desconhecido', texto: 'Olá! Sou da equipe de suporte do seu banco. Detectamos atividade suspeita na sua conta. Pode me passar o número do seu cartão e senha do app?' },
                        { autor: 'Você', texto: 'Mas como sei que você é realmente do banco?' },
                        { autor: 'Contato Desconhecido', texto: 'Entendo sua preocupação! Vou te enviar um código por SMS, me passe ele assim que receber.' }
                    ],
                    correta: 'golpe'
                },
                {
                    id: 2,
                    titulo: 'E-mail de atualização de dados',
                    mensagens: [
                        { autor: 'Banco Central', texto: 'Prezados clientes, para manter a segurança de suas contas, é necessário atualizar seus dados clicando no link abaixo.' },
                        { autor: 'Você', texto: 'O e-mail parece oficial, mas o endereço do remetente está estranho...' }
                    ],
                    correta: 'golpe'
                },
                {
                    id: 3,
                    titulo: 'Mensagem de empresa conhecida',
                    mensagens: [
                        { autor: 'Netflix', texto: 'Seu pagamento não foi processado. Atualize seus dados de cobrança para evitar o cancelamento.' },
                        { autor: 'Você', texto: 'Acabei de pagar minha assinatura. Isso é estranho.' }
                    ],
                    correta: 'golpe'
                },
                {
                    id: 4,
                    titulo: 'Contato de um amigo',
                    mensagens: [
                        { autor: 'Amigo João', texto: 'Oi! Tô com um problema no banco, pode me emprestar R$200 e te devolvo amanhã?' },
                        { autor: 'Você', texto: 'João, esse número é novo? Parece estranho...' }
                    ],
                    correta: 'golpe'
                },
                {
                    id: 5,
                    titulo: 'Mensagem de autenticação verdadeira',
                    mensagens: [
                        { autor: 'App do Banco', texto: 'Você solicitou um login em novo dispositivo. Caso não tenha sido você, ignore esta mensagem.' },
                        { autor: 'Você', texto: 'Ok, não pedi login. Vou ignorar.' }
                    ],
                    correta: 'nao-golpe'
                }
            ];

            let indice = 0;
            let pontuacao = 0;
            let respondeu = false;

            if (totalEl) totalEl.textContent = quizData.length;

            // === Início do Quiz ===
            startBtn.addEventListener('click', () => {
                nomeJogador = nomeInput.value.trim();
                if (nomeJogador === "") {
                    alert("Por favor, digite seu nome para começar o quiz!");
                    nomeInput.focus();
                    return;
                }

                startScreen.style.display = 'none';
                quizMainContent.style.display = 'block';
                renderPergunta();
            });

            // Renderiza a pergunta atual
            function renderPergunta() {
                respondeu = false;
                nextBtn.disabled = true;

                const pergunta = quizData[indice];

                // Verificação das mensagens
                if (!pergunta || !Array.isArray(pergunta.mensagens)) {
                    showDebug(`ERRO DE DADOS: O array 'mensagens' para a pergunta ${indice + 1} está ausente ou não é um array.`);
                    return;
                }

                const chatHtml = pergunta.mensagens.map(m => {
                    const classe = m.autor === 'Você' ? 'dialogo voce' : 'dialogo';
                    const autor = m.autor || 'Desconhecido';
                    const texto = m.texto || 'Mensagem Vazia';
                    return `<div class="${classe}"><strong>${autor}:</strong> ${texto}</div>`;
                }).join('');

                quizEl.innerHTML = `
                    <div class="quiz-card" role="region" aria-label="Pergunta ${indice + 1}">
                        <h2>${indice + 1}. ${pergunta.titulo}</h2>
                        <div class="chat">${chatHtml}</div>
                        <div class="botoes">
                            <button id="btn-golpe" class="golpe">🚨 É GOLPE</button>
                            <button id="btn-nao-golpe" class="nao-golpe">✅ NÃO É GOLPE</button>
                        </div>
                    </div>
                `;

                // Animação
                const card = quizEl.querySelector('.quiz-card');
                if (card) {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';
                    setTimeout(() => {
                        card.style.transition = 'all 0.45s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 40);
                }

                // Handlers dos botões
                const btnGolpe = document.getElementById('btn-golpe');
                const btnNaoGolpe = document.getElementById('btn-nao-golpe');

                if (btnGolpe && btnNaoGolpe) {
                    btnGolpe.addEventListener('click', () => handleResposta('golpe', btnGolpe, btnNaoGolpe));
                    btnNaoGolpe.addEventListener('click', () => handleResposta('nao-golpe', btnGolpe, btnNaoGolpe));
                } else {
                    showDebug('ERRO: Botões de resposta não encontrados após a renderização.');
                }
            }

            // Tratamento de resposta
            function handleResposta(resposta, btnA, btnB) {
                if (respondeu) return;
                respondeu = true;

                try { somClick.play(); } catch (e) { }

                btnA.disabled = true;
                btnB.disabled = true;

                const correta = quizData[indice].correta;

                if (resposta === correta) {
                    pontuacao++;
                    try { somAcerto.play(); } catch (e) { }
                    alert('✅ Resposta correta!');
                } else {
                    try { somErro.play(); } catch (e) { }
                    alert('❌ Resposta incorreta!');
                }

                if (scoreEl) scoreEl.textContent = pontuacao;
                nextBtn.disabled = false;
            }

            // Botão Próximo
            nextBtn.addEventListener('click', () => {
                try { somClick.play(); } catch (e) { }
                if (!respondeu) {
                    alert('Responda antes de avançar!');
                    return;
                }

                indice++;
                if (indice < quizData.length) {
                    renderPergunta();
                } else {
                    mostrarResultado();
                }
            });

            // Tela final
            function mostrarResultado() {
                salvarPontuacao(nomeJogador, pontuacao);

                quizMainContent.style.display = 'none';
                resultScreen.style.display = 'block';

                finalScoreEl.textContent = `${pontuacao} / ${quizData.length}`;

                let mensagem = `Parabéns, ${nomeJogador}! Você concluiu o teste.`;
                if (pontuacao === quizData.length) {
                    mensagem += " 🏆 Perfeito! Você acertou todas as questões!";
                } else if (pontuacao > quizData.length / 2) {
                    mensagem += " Bom trabalho, mas fique atento aos próximos golpes!";
                } else {
                    mensagem += " 🚨 Atenção! Reveja os exemplos para melhorar sua segurança.";
                }
                finalMessageEl.textContent = mensagem;

                quizEl.innerHTML = '';
                nextBtn.style.display = 'none';
            }

        } catch (err) {
            showDebug('ERRO INESPERADO: ' + (err && err.message ? err.message : err));
        }
    });
})();
