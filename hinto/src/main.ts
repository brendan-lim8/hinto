import './style.css'
import dogHuh from './images/dog-huh.png'
import hotdog from './images/hotdog.png'
import hothotdog from './images/hothotdog.png'
import colddog from './images/colddog.png'
import icecolddog from './images/icecolddog.png'
import dogcelebrate from './images/dogcelebrate.png'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<button class="sidebar-toggle" id="sidebar-toggle">☰</button>

<aside class="sidebar" id="sidebar">
  <h2 class="howto">How to Play</h2>
  <ul>
    <li>Find the secret word, you have unlimited guesses.</li>
    <li>Each guess will give you hints relating to the secret word.</li>
    <li>The dog will change its expression based on how hot or cold you are to the word</li>
  </ul>
</aside>

<div class="main-layout">

  <div class="center-content-wrapper">
    <div class="content">
      <div class="header">
        <div class="speech-bubble-container">
          <p class="gemini speech-bubble"></p>
          <a>
            <img src="${dogHuh}" class="logo vanilla" alt="Hinto Logo" />
          </a>
        </div>
        <h1>Hinto</h1>
        <p class="guess" id="guess-count">Guesses: 0</p>
        <p class="guess" id="word-length"></p>
      </div>

      <div class="textbox">
        <input type="text" id="simple-input" maxlength="20" minlength="3" placeholder="Enter word"/>
      </div>

      <div class="card">
        <button id="counter" type="button">Enter</button>
      </div>
    </div>
  </div>

  <div id="guess-list-container" class="guess-list-container">
    <h3>Your Guesses</h3>
    <ul id="guess-list"></ul>
  </div>

</div>
`

// Sidebar toggle
const sidebar = document.querySelector<HTMLElement>('#sidebar')!
const sidebarToggle = document.querySelector<HTMLButtonElement>('#sidebar-toggle')!

sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed')
  sidebarToggle.classList.toggle('collapsed')
})

const input = document.querySelector<HTMLInputElement>('#simple-input')!
const button = document.querySelector<HTMLButtonElement>('#counter')!
const guessCountDisplay = document.querySelector<HTMLParagraphElement>('#guess-count')!
const guessList = document.querySelector<HTMLUListElement>('#guess-list')!
const geminiText = document.querySelector<HTMLParagraphElement>('.gemini')!
const logoImg = document.querySelector<HTMLImageElement>('.logo')!

let user_guess = ''
let count = 0
let guessedWords: { guess: string, hint: string }[] = []
let loadingInterval: ReturnType<typeof setInterval> | undefined

function victory() {
  updateLogoBasedOnCloseness(10)
  logoImg.src = dogcelebrate
  geminiText.textContent = `Congratulations! You guessed the word "${target}" in ${count} tries!`
  geminiText.classList.add('active')

  input.style.display = 'none'
  button.style.display = 'none'

  const playAgainButton = document.createElement('button')
  playAgainButton.textContent = 'PLAY AGAIN'
  playAgainButton.id = 'play-again'
  playAgainButton.type = 'button'
  playAgainButton.addEventListener('click', () => location.reload())

  const card = document.querySelector<HTMLDivElement>('.card')!
  card.appendChild(playAgainButton)
}

function showLoadingIndicator(show: boolean) {
  input.disabled = show
  button.disabled = show
  if (show) {
    geminiText.textContent = 'Thinking'
    geminiText.classList.add('active')
    let dots = ''
    loadingInterval = setInterval(() => {
      dots += '.'
      if (dots.length > 3) dots = ''
      geminiText.textContent = `Thinking${dots}`
    }, 300)
  } else {
    if (loadingInterval) clearInterval(loadingInterval)
    loadingInterval = undefined
    input.focus()
  }
}

async function missingLetters() {
  geminiText.textContent = `Guess must be between 3 and 20 letters long.`
}

function updateLogoBasedOnCloseness(closeness: number) {
  let imageName = dogHuh

  if (closeness >= 9) imageName = hothotdog
  else if (closeness >= 6) imageName = hotdog
  else if (closeness === 5) imageName = dogHuh
  else if (closeness >= 3) imageName = colddog
  else if (closeness >= 1) imageName = icecolddog

  logoImg.src = imageName
}

async function guessWord() {
  user_guess = input.value.toLowerCase()

  if (guessedWords.some(item => item.guess === user_guess)) {
    geminiText.textContent = `Already guessed "${user_guess}"`
    input.value = ''
    return
  }

  count += 1
  guessCountDisplay.textContent = `Guesses: ${count}`

  const listItem = document.createElement('li')
  listItem.textContent = user_guess
  listItem.style.padding = '0.5rem 0'
  guessList.prepend(listItem)

  showLoadingIndicator(true)
  const body = { guess: user_guess, target: target, history: guessedWords }
  try {
    const response = await fetch('https://hinto.friedmandaniel111.workers.dev/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await response.json()
    if (data.result === 'correct') {
      victory()
      return
    }
    const hint = data.hint
    geminiText.textContent = hint
    geminiText.classList.add('active')
    guessedWords.push({ guess: user_guess, hint })

    const closeness = data.closeness
    updateLogoBasedOnCloseness(closeness)
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    showLoadingIndicator(false)
    input.value = ''
  }
}

input.addEventListener('input', (e) => {
  const target = e.target as HTMLInputElement
  target.value = target.value.replace(/[^A-Za-z]/g, '')
})

input.addEventListener('keypress', (e) => {
  if (!/[A-Za-z]/.test(e.key) && e.key !== 'Enter') e.preventDefault()
  if (e.key === 'Enter') {
    if (input.value.length < 21 && input.value.length > 0) guessWord()
    else missingLetters()
  }
})

button.addEventListener('click', () => {
  if (input.value.length < 21 && input.value.length > 0) guessWord()
  else missingLetters()
})

let target: string;

async function getRandomGameWord() {
  try {
    const response = await fetch('/words.txt');
    const text = await response.text();
    const words = text.split('\n').filter(word => word.trim() !== '');
    const randomWord = words[Math.floor(Math.random() * words.length)];
    return randomWord.toLowerCase();
  } catch (error) {
    console.error("Error fetching word from file:", error);
    return "coffee"; // Fallback word
  }
}

async function initializeGame() {
  target = await getRandomGameWord();
  console.log('Target word:', target);
  const wordLengthDisplay = document.querySelector<HTMLParagraphElement>('#word-length')!;
  wordLengthDisplay.textContent = `Word is ${target.length} letters long.`;
}

initializeGame();