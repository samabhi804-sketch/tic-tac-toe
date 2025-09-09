// Simple Tic Tac Toe with two-player local and single-player (unbeatable AI via minimax).
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const modeSelect = document.getElementById('mode');

let board = Array(9).fill(null); // null | 'X' | 'O'
let currentPlayer = 'X';
let playing = true;
let mode = 'pvp'; // 'pvp' or 'cpu'

// Winning combinations
const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function renderBoard(){
  boardEl.innerHTML = '';
  board.forEach((cell, idx) => {
    const cellEl = document.createElement('button');
    cellEl.className = 'cell' + (cell ? ' disabled' : '');
    cellEl.dataset.index = idx;
    cellEl.type = 'button';
    cellEl.innerText = cell || '';
    cellEl.addEventListener('click', onCellClick);
    boardEl.appendChild(cellEl);
  });
}

function onCellClick(e){
  const idx = Number(e.currentTarget.dataset.index);
  if(!playing || board[idx]) return;

  playMove(idx, currentPlayer);

  if(playing && mode === 'cpu' && currentPlayer === 'O'){
    // If it's now O's turn and CPU is O, let it think (in next event loop)
    setTimeout(() => {
      const move = bestMove(board, 'O');
      if(move != null) playMove(move, 'O');
    }, 200);
  }
}

function playMove(idx, player){
  if(board[idx] || !playing) return;
  board[idx] = player;
  const res = checkGame(board);
  if(res.winner){
    playing = false;
    highlightWinning(res.line);
    statusEl.innerText = `${res.winner} wins!`;
  } else if(res.tie){
    playing = false;
    statusEl.innerText = `It's a tie.`;
  } else {
    currentPlayer = player === 'X' ? 'O' : 'X';
    statusEl.innerText = `${currentPlayer}'s turn`;
    // If CPU mode and it's CPU's turn and player is human
    if(mode === 'cpu' && currentPlayer === 'O'){
      // Let the CPU move (unbeatable)
      setTimeout(() => {
        const move = bestMove(board, 'O');
        if(move != null) playMove(move, 'O');
      }, 200);
    }
  }
  renderBoard();
}

function highlightWinning(line){
  if(!line) return;
  line.forEach(i => {
    const el = boardEl.querySelector(`[data-index="${i}"]`);
    if(el) el.classList.add('win');
  });
}

// Return {winner: 'X'|'O'|null, line: [i,i,i]|null, tie: boolean}
function checkGame(b){
  for(const line of wins){
    const [a,b1,c] = line;
    if(b[a] && b[a] === b[b1] && b[a] === b[c]){
      return { winner: b[a], line, tie: false };
    }
  }
  if(b.every(Boolean)) return { winner: null, line: null, tie: true };
  return { winner: null, line: null, tie: false };
}

// Minimax for Tic Tac Toe, returns index of best move for player ('X' or 'O')
function bestMove(sboard, player){
  // If board empty, prefer center
  if(sboard.every(x => x === null)) return 4;

  const opponent = player === 'X' ? 'O' : 'X';

  function minimax(b, depth, isMaximizing){
    const res = checkGame(b);
    if(res.winner === player) return 10 - depth;
    if(res.winner === opponent) return depth - 10;
    if(res.tie) return 0;

    const avail = b.map((v,i)=> v === null ? i : null).filter(i => i !== null);

    if(isMaximizing){
      let best = -Infinity;
      for(const i of avail){
        b[i] = player;
        const score = minimax(b, depth+1, false);
        b[i] = null;
        best = Math.max(best, score);
      }
      return best;
    } else {
      let best = Infinity;
      for(const i of avail){
        b[i] = opponent;
        const score = minimax(b, depth+1, true);
        b[i] = null;
        best = Math.min(best, score);
      }
      return best;
    }
  }

  let bestScore = -Infinity;
  let move = null;
  for(let i=0;i<9;i++){
    if(sboard[i] === null){
      sboard[i] = player;
      const score = minimax(sboard, 0, false);
      sboard[i] = null;
      if(score > bestScore){
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function reset(){
  board = Array(9).fill(null);
  currentPlayer = 'X';
  playing = true;
  statusEl.innerText = `${currentPlayer}'s turn`;
  renderBoard();
}

// Event listeners
restartBtn.addEventListener('click', reset);
modeSelect.addEventListener('change', (e) => {
  mode = e.target.value;
  reset();
});

// Initialize
renderBoard();
statusEl.innerText = `${currentPlayer}'s turn`;

// If mode is CPU and CPU plays first (if you want CPU to play X change logic) currently CPU is O.