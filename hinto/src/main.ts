import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a>
      <img src="src/images/dog-check.png" class="logo vanilla" alt="Habinu Logo" />
    </a>
    <h1>Hinto</h1>
    <div class="textbox">
      <label htmlFor="simple-input"></label>
      <input type="text" id="simple-input" placeholder="Enter 5 letter word.."/>
    </div>
      <div class="card">
      <button id="counter" type="button"></button>
    </div>

  </div>
`

