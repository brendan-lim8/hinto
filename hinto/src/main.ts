import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
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

