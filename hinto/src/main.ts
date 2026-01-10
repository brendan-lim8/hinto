import './style.css'
// import { getHint } from './hints.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<aside class="sidebar">
  <h2 class="howto">How to Play</h2>
  <ul>
    <li>Find the secret 5 letter word, you have unlimited guesses.</li>
    <li>Each guess will give you hints relating to the secret word.</li>
    <li>The dog will change its expression based on how hot or cold you are to the word</li>
  </ul>
</aside>  
<div class="content">
  <div class="header">
    <a>
      <img src="src/images/dog-huh.png" class="logo vanilla" alt="Hinto Logo" />
    </a>
    <h1>Hinto</h1>
    <p class="guess" id="guess-count">Guesses: 0</p>
  </div>
  <div class="textbox">
    <input type="text" id="simple-input" maxlength="20" minlength="3" placeholder="Enter word"/>
  </div>
  <div class="card">
    <button id="counter" type="button">Enter</button>
  </div>
  <p class="gemini"></p>
</div>
<div id="guess-list-container" style="position: fixed; right: 2rem; top: 2rem; width: 250px; border-left: 2px solid #e8b66e; padding-left: 1.5rem; max-height: 80vh; overflow-y: auto; background-color: #faf5f0; border-radius: 8px;">
  <h3 style="position: sticky; top: 0; background-color: #faf5f0; margin: 0; padding: 1rem 0; color: #e8b66e; font-weight: 600;">Your Guesses</h3>
  <ul id="guess-list" style="list-style: none; padding: 0; margin: 0; color: #242424;"></ul>
</div>
`

const input = document.querySelector<HTMLInputElement>('#simple-input')!;
const button = document.querySelector<HTMLButtonElement>('#counter')!;
const guessCountDisplay = document.querySelector<HTMLParagraphElement>('#guess-count')!;
const guessList = document.querySelector<HTMLUListElement>('#guess-list')!;
const geminiText = document.querySelector<HTMLParagraphElement>('.gemini')!;

let user_guess = '';
let count = 0;
let guessedWords: { guess: string, hint: string }[] = [];
let loadingInterval: ReturnType<typeof setInterval> | undefined;

function showLoadingIndicator(show: boolean) {
  input.disabled = show;
  button.disabled = show;
  if (show) {
    geminiText.textContent = 'Thinking';
    let dots = '';
    loadingInterval = setInterval(() => {
      dots += '.';
      if (dots.length > 3) {
        dots = '';
      }
      geminiText.textContent = `Thinking${dots}`;
    }, 300);
  } else {
    if (loadingInterval) {
      clearInterval(loadingInterval);
      loadingInterval = undefined;
    }
    input.focus();
  }
}

async function missingLetters() {
  geminiText.textContent = `Guess must be between 3 and 20 letters long.`;
}

async function guessWord() {
  user_guess = input.value.toLowerCase();

  // Check if word was already guessed
  if (guessedWords.some(item => item.guess === user_guess)) {
    geminiText.textContent = `Already guessed "${user_guess}"`;
    input.value = '';
    return;
  }

  // Add new guess
  count += 1;


  // Update display
  console.log('User guess:', user_guess, 'count:', count);
  guessCountDisplay.textContent = `Guesses: ${count}`;

  // Add to list (prepend to show latest first)
  const listItem = document.createElement('li');
  listItem.textContent = user_guess;
  listItem.style.padding = '0.5rem 0';
  guessList.prepend(listItem);

  // Fetch hint from backend
  showLoadingIndicator(true);
  const body = { guess: user_guess, target: target, history: guessedWords };
  try {
    const response = await fetch('https://hinto.friedmandaniel111.workers.dev/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log(data);

    if (data.result === 'correct') {
      // OTHER SUCCESS ACTIONS
      geminiText.textContent = `Congratulations! You guessed the word "${target}" in ${count} tries!`;
      input.disabled = true;
      button.disabled = true;
      return;
    }

    const hint = data.hint;
    geminiText.textContent = hint;
    guessedWords.push({ guess: user_guess, hint: hint });

    // USE THIS FOR PICTURE OF DOG BASED ON CLOSENESS (0 - 9)
    const closeness = data.closeness;
  } catch (error) {
    console.error('Error fetching data:', error);
    geminiText.textContent = 'Could not get hint.';
  } finally {
    showLoadingIndicator(false);
    // Clear input
    input.value = '';
  }
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
    if (input.value.length < 21 && input.value.length > 0) {
      guessWord()
    }
    else {
      missingLetters()
    }
  }
});


button.addEventListener('click', () => {
  if (input.value.length < 21 && input.value.length > 0) {
    guessWord()
  }
  else {
    missingLetters()
  }
});

// Fetch a target word
const response = await fetch('https://random-word-api.vercel.app/api?words=1&length=5');
const data = await response.json();
const target = data[0].toLowerCase();
console.log('Target word:', target);
