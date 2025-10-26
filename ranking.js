// =======================================================
// ARQUIVO: ranking.js
// FUNÇÃO: Carrega os dados do firebase-module e renderiza a lista
// =======================================================

// Importa a função de carregamento do ranking do módulo Firebase
import { carregarRankingFirebase } from "./firebase-module.js"; 

document.addEventListener("DOMContentLoaded", () => {
    carregarRanking();
});

// --- FUNÇÃO: Carregar e exibir o ranking ---
function carregarRanking() {
    const rankingLista = document.getElementById("ranking-lista");

    if (!rankingLista) {
        console.error("Elemento #ranking-lista não encontrado no HTML (verifique ranking.html).");
        return;
    }

    rankingLista.innerHTML = "<li>Aguarde, carregando...</li>";

    // Chama a função que escuta o Firebase e recebe os dados
    carregarRankingFirebase((ranking) => {

        // Limpa a lista antes de inserir novos itens
        rankingLista.innerHTML = "";

        if (ranking.length === 0) {
            rankingLista.innerHTML = "<li>Nenhuma pontuação registrada ainda. Jogue o Quiz!</li>";
            return;
        }

        // Itera sobre o array de ranking totalmente ordenado
        ranking.forEach((item, index) => {
            const li = document.createElement("li");

            // Formata a data para melhor exibição
            const dataFormatada = new Date(item.dataRegistro).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Monta o item da lista
            li.textContent = `${index + 1}º. ${item.nome} - ${item.pontos} pontos (em ${dataFormatada})`;
            rankingLista.appendChild(li);
        });
    });
}
