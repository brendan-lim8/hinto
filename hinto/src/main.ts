import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<aside class="sidebar">
      <h2 class="howto">How to Play</h2>
      <ul>
        <li>Find the secret 5 letter word, you have unlimited guesses.</li>
        <li>Each guess will give you a hints relating to the secret word.</li>
        <li>The dog will also change its expression based on how hot or cold you are to the word/li>
      </ul>
    </aside>  
<div class="content">
    <a>
      <img src="src/images/dog-check.png" class="logo vanilla" alt="Habinu Logo" />
    </a>
    <h1>Hinto</h1>
    <p id="guess-count">Guesses: 0</p>
    <div class="textbox">
      <input type="text" id="simple-input" maxlength="5" minlength="5" placeholder="Enter 5-letter word"/>
    </div>
      <div class="card">
        <button id="counter" type="button">Enter</button>
      </div>
      <p class="gemini"></p>
    </div>
    <div id="guess-list-container" style="position: fixed; right: 2rem; top: 2rem; width: 250px; border-left: 1px solid #444; padding-left: 1rem; max-height: 80vh; overflow-y: auto;">
      <h3 style="position: sticky; top: 0; background-color: #242424; margin: 0; padding: 1rem 0;">Your Guesses</h3>
      <ul id="guess-list" style="list-style: none; padding: 0; margin: 0;"></ul>
    </div>
  </div>
`

const input = document.querySelector<HTMLInputElement>('#simple-input')!;
const button = document.querySelector<HTMLButtonElement>('#counter')!;
const guessCountDisplay = document.querySelector<HTMLParagraphElement>('#guess-count')!;
const guessList = document.querySelector<HTMLUListElement>('#guess-list')!;
const geminiText = document.querySelector<HTMLParagraphElement>('.gemini')!;

let user_guess = '';
let count = 0;
let guessedWords: string[] = [];

async function missingLetters(){
  geminiText.textContent = `Need 5 letters`;
}
async function guessWord(){
  user_guess = input.value.toLowerCase();
  
  // Check if word was already guessed
  if (guessedWords.includes(user_guess)) {
    geminiText.textContent = `Already guessed "${user_guess}"`;
    input.value = '';
    return;
  }
  
  // Add new guess
  count+=1; 
  guessedWords.push(user_guess);
  
  // Update display
  console.log('User guess:', user_guess, 'count:', count);
  guessCountDisplay.textContent = `Guesses: ${count}`;
  
  // Add to list (prepend to show latest first)
  const listItem = document.createElement('li');
  listItem.textContent = user_guess;
  listItem.style.padding = '0.5rem 0';
  guessList.prepend(listItem);
  
  // Clear message and input
  geminiText.textContent = '';
  input.value = '';
}

input.addEventListener('input', (e) => {
  const target = e.target as HTMLInputElement;
  target.value = target.value.replace(/[^A-Za-z]/g, '');
});

input.addEventListener('keypress', (e) => {
  if (!/[A-Za-z]/.test(e.key) && e.key !== 'Enter') {
    e.preventDefault();
  }
  
  if (e.key === 'Enter') {
    if (input.value.length === 5){
      guessWord()
    }
    else{
      missingLetters()
    }
  }
});


button.addEventListener('click', () => {
  if (input.value.length === 5)
  {
    guessWord()
  }
  else{
    missingLetters()
  }
});