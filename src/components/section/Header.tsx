import { dropdown, metadata } from '~/lib/backend/server.config'
import { createSignal, For, onMount } from 'solid-js'

import './Header.css'

export default function Header() {
  onMount(() => {})

  function register() {
    const nickname = document.querySelector(
      '#register-container sl-input[label="Nickname"]'
    ) as HTMLInputElement
    const email = document.querySelector(
      '#register-container sl-input[label="Email"]'
    ) as HTMLInputElement
    const password = document.querySelector(
      '#register-container sl-input[label="Password"]'
    ) as HTMLInputElement

    fetch('/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nickname: nickname.value,
        email: email.value,
        password: password.value,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message)
        if (data.error) {
          console.error('Register error:', data.message)
        }
      })
  }

  function login() {
    const email = document.querySelector(
      '#login-container sl-input[label="Email"]'
    ) as HTMLInputElement
    const password = document.querySelector(
      '#login-container sl-input[label="Password"]'
    ) as HTMLInputElement

    fetch(`/auth?email=${email.value}&password=${password.value}`)
      .then((response) => response.json())
      .then((data) => {
        alert(data.message)
        if (data.error) {
          console.error('Login error:', data.message)
        }
      })
  }

  return (
    <header>
      <div class='container container-horizontal' style='justify-content: space-evenly;'>
        <a class='container-horizontal' href='/'>
          <img src='/karnas.jpg' alt='Logo Karnas' draggable='false' />
          <h2>Sindangkasih</h2>
        </a>
        <div class='container-horizontal'>
          <For
            each={Object.keys(dropdown())}
            fallback={<sl-spinner style='font-size: 2rem;'></sl-spinner>}>
            {(menu) =>
              typeof dropdown()[menu] === 'object' ? (
                <sl-dropdown>
                  <sl-button class='menu-button' slot='trigger' caret>
                    {menu}
                  </sl-button>
                  <sl-menu>
                    <For each={Object.keys(dropdown()[menu])}>
                      {(submenu) => (
                        <a href={dropdown()[menu][submenu]}>
                          <sl-menu-item class='menu-item'>{submenu}</sl-menu-item>
                        </a>
                      )}
                    </For>
                  </sl-menu>
                </sl-dropdown>
              ) : (
                <a href={dropdown()[menu]} tabindex='-1'>
                  <sl-button class='menu-button'>{menu}</sl-button>
                </a>
              )
            }
          </For>
        </div>
        <sl-dropdown id='account-dropdown' distance='8'>
          <sl-avatar id='avatar' label='User avatar' slot='trigger'></sl-avatar>
          <sl-card>
            <sl-tab-group>
              <sl-tab slot='nav' panel='login'>
                Login
              </sl-tab>
              <sl-tab slot='nav' panel='register'>
                Register
              </sl-tab>
              <div style='height: 6px'></div>
              <sl-tab-panel name='login'>
                <div id='login-container'>
                  <sl-input type='email' label='Email' placeholder='you@example.com'></sl-input>
                  <br />
                  <sl-input type='password' label='Password' placeholder='Password'></sl-input>
                  <sl-divider style='margin: 1.5em 0;' />
                  <sl-button variant='primary' style='width: 100%;' onClick={login}>
                    Login
                  </sl-button>
                </div>
              </sl-tab-panel>
              <sl-tab-panel name='register'>
                <div id='register-container'>
                  <sl-input type='text' label='Nickname' placeholder='Nickname'></sl-input>
                  <br />
                  <sl-input type='email' label='Email' placeholder='you@example.com'></sl-input>
                  <br />
                  <sl-input type='password' label='Password' placeholder='Password'></sl-input>
                  <sl-divider style='margin: 1.5em 0;' />
                  <sl-button variant='primary' style='width: 100%;' onClick={register}>
                    Create account
                  </sl-button>
                </div>
              </sl-tab-panel>
            </sl-tab-group>
          </sl-card>
        </sl-dropdown>
      </div>
    </header>
  )
}
