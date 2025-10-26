// =======================================================
// ARQUIVO: firebase-module.js
// FUNÇÕES: Inicializa o Firebase e exporta as funções de acesso ao DB
// =======================================================

// Importa as funções necessárias dos SDKs do Firebase (Modular V9/V10+)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    query, 
    orderByChild, 
    limitToLast, 
    push, 
    onValue 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA2qDojGCGuLZ6OFYbfYbzmGb7Thixb-W0",
    authDomain: "ia-search-ranking.firebaseapp.com",
    databaseURL: "https://ia-search-ranking-default-rtdb.firebaseio.com",
    projectId: "ia-search-ranking",
    storageBucket: "ia-search-ranking.firebasestorage.app",
    messagingSenderId: "571835547295",
    appId: "1:571835547295:web:6756551f199863755aecaa"
};

// Inicializa o Firebase e obtém a referência ao Realtime Database
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// --- FUNÇÃO DE ESCRITA (Para Quiz.js) ---
/**
 * Salva a pontuação de um jogador no nó 'ranking'.
 * @param {string} nomeUsuario - Nome do jogador
 * @param {number} pontuacao - Pontuação do jogador
 */
export async function salvarPontuacao(nomeUsuario, pontuacao) {
    const rankingRef = ref(database, 'ranking');

    const novoRegistro = {
        nome: nomeUsuario,
        pontos: pontuacao,
        dataRegistro: Date.now()
    };

    try {
        await push(rankingRef, novoRegistro);
        console.log(`Pontuação de ${nomeUsuario} (${pontuacao} pts) salva com sucesso!`);
    } catch (error) {
        console.error("Erro ao salvar pontuação:", error);
    }
}

// --- FUNÇÃO DE LEITURA (Para ranking.js) ---
/**
 * Carrega o Top 10 dos jogadores do Firebase, ordenado por pontuação.
 * @param {function} callback - Função chamada com o array de ranking completo e ordenado
 */
export function carregarRankingFirebase(callback) {
    try {
        // Consulta: ordenar por 'pontos' e pegar os 10 mais altos
        const rankingQuery = query(ref(database, 'ranking'), orderByChild('pontos'), limitToLast(10));

        // Escuta os dados em tempo real
        onValue(rankingQuery, (snapshot) => {
            let ranking = [];

            snapshot.forEach(child => {
                ranking.push(child.val());
            });

            // Ordena do maior para o menor
            ranking.sort((a, b) => b.pontos - a.pontos);

            // Chama a função callback com os dados
            callback(ranking);

        }, (error) => {
            console.error('Erro ao escutar ranking Firebase:', error);
            callback([]);
        });

    } catch (err) {
        console.error('Erro ao inicializar ranking Firebase:', err);
        callback([]);
    }
}
