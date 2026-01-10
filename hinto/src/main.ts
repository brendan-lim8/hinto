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
    <div class="textbox">
      <input type="text" id="simple-input" maxlength="5" minlength="5" placeholder="Enter 5-letter word"/>
    </div>
      <div class="card">
      <button id="counter" type="button">Enter</button>
    </div>
    <p class="gemini">Gemini text here</p>

  </div>
`


const input = document.querySelector<HTMLInputElement>('#simple-input')!;
const button = document.querySelector<HTMLButtonElement>('#counter')!;

let user_guess = '';

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
      user_guess = input.value.toUpperCase();
      console.log('User guess:', user_guess);
      input.value = ''; 
    }
  }
});


button.addEventListener('click', () => {
  if (input.value.length === 5)
  {
    user_guess = input.value.toUpperCase();
    console.log('User guess:', user_guess);
    input.value = ''; 
  }


});