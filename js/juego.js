// ====== Estado ======
let tablero = Array(9).fill(null);   // null | "X" | "O"
let turno = "X";
let terminado = false;
let marcador = { X: 0, O: 0, E: 0 };

// Combinaciones ganadoras (índices del tablero)
const LINEAS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],   // filas
  [0, 3, 6], [1, 4, 7], [2, 5, 8],   // columnas
  [0, 4, 8], [2, 4, 6]               // diagonales
];

// ====== DOM ======
const celdas = document.querySelectorAll(".celda");
const mensaje = document.getElementById("mensaje");
const selModo = document.getElementById("modo");
const selNivel = document.getElementById("nivel");
const labelNivel = document.getElementById("labelNivel");

// ====== Lógica del juego ======
function buscarGanador(t) {
  for (const linea of LINEAS) {
    const [a, b, c] = linea;
    if (t[a] && t[a] === t[b] && t[a] === t[c]) {
      return { jugador: t[a], linea: linea };
    }
  }
  return null;
}

function hayEmpate(t) {
  return t.every(c => c !== null);
}

function jugar(i) {
  if (terminado || tablero[i]) return;

  tablero[i] = turno;
  pintar();

  const ganador = buscarGanador(tablero);
  if (ganador) {
    terminar(ganador);
    return;
  }
  if (hayEmpate(tablero)) {
    terminar(null);
    return;
  }

  turno = turno === "X" ? "O" : "X";
  mensaje.textContent = `Turno de ${turno}`;

  // Si juega la PC, le toca a "O"
  if (selModo.value === "pc" && turno === "O") {
    bloquear(true);
    setTimeout(() => {
      bloquear(false);
      jugar(elegirJugadaPC());
    }, 450);
  }
}

function terminar(ganador) {
  terminado = true;
  if (ganador) {
    marcador[ganador.jugador]++;
    ganador.linea.forEach(i => celdas[i].classList.add("ganadora"));
    mensaje.textContent = (selModo.value === "pc" && ganador.jugador === "O")
      ? "Ganó la PC"
      : `¡Ganó ${ganador.jugador}!`;
  } else {
    marcador.E++;
    mensaje.textContent = "¡Empate!";
  }
  actualizarMarcador();
}

// ====== Inteligencia de la PC ======
function elegirJugadaPC() {
  const libres = tablero.map((v, i) => v === null ? i : null).filter(i => i !== null);

  if (selNivel.value === "facil") {
    // Nivel fácil: casilla al azar
    return libres[Math.floor(Math.random() * libres.length)];
  }

  // Nivel imposible: algoritmo Minimax
  let mejor = -Infinity, jugada = libres[0];
  for (const i of libres) {
    tablero[i] = "O";
    const puntaje = minimax(tablero, false);
    tablero[i] = null;
    if (puntaje > mejor) { mejor = puntaje; jugada = i; }
  }
  return jugada;
}

// Devuelve +1 si gana O (PC), -1 si gana X, 0 si empata
function minimax(t, turnoPC) {
  const g = buscarGanador(t);
  if (g) return g.jugador === "O" ? 1 : -1;
  if (hayEmpate(t)) return 0;

  let mejor = turnoPC ? -Infinity : Infinity;
  for (let i = 0; i < 9; i++) {
    if (t[i] === null) {
      t[i] = turnoPC ? "O" : "X";
      const p = minimax(t, !turnoPC);
      t[i] = null;
      mejor = turnoPC ? Math.max(mejor, p) : Math.min(mejor, p);
    }
  }
  return mejor;
}

// ====== Interfaz ======
function pintar() {
  celdas.forEach((celda, i) => {
    celda.textContent = tablero[i] || "";
    celda.className = "celda" + (tablero[i] ? " " + tablero[i].toLowerCase() : "");
    celda.disabled = terminado || tablero[i] !== null;
  });
}

function bloquear(si) {
  celdas.forEach((c, i) => { c.disabled = si || terminado || tablero[i] !== null; });
}

function actualizarMarcador() {
  document.getElementById("puntosX").textContent = marcador.X;
  document.getElementById("puntosO").textContent = marcador.O;
  document.getElementById("puntosE").textContent = marcador.E;
}

function nuevaPartida() {
  tablero = Array(9).fill(null);
  turno = "X";
  terminado = false;
  mensaje.textContent = "Turno de X";
  pintar();
}

function reiniciarMarcador() {
  marcador = { X: 0, O: 0, E: 0 };
  actualizarMarcador();
  nuevaPartida();
}

// ====== Eventos ======
celdas.forEach(celda => {
  celda.addEventListener("click", () => jugar(Number(celda.dataset.i)));
});
document.getElementById("btnNueva").addEventListener("click", nuevaPartida);
document.getElementById("btnReiniciar").addEventListener("click", reiniciarMarcador);

selModo.addEventListener("change", () => {
  labelNivel.style.display = selModo.value === "pc" ? "flex" : "none";
  reiniciarMarcador();
});
selNivel.addEventListener("change", reiniciarMarcador);

// ====== Inicio ======
pintar();
