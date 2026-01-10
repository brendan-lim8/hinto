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
      <input type="text" id="simple-input" maxlength="5" placeholder="Enter 5-letter word"/>
    </div>
      <div class="card">
      <button id="counter" type="button">Enter</button>
    </div>
    <p class=gemini >Gemini text here</p>

  </div>
`

