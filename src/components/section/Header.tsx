import { dropdown, metadata } from '~/secret/config'
import { For, onMount } from 'solid-js'

import './Header.css'

export default function Header() {
  onMount(() => {})
  return (
    <header>
      <div class='container container-horizontal' style='justify-content: space-evenly;'>
        <a class='container-horizontal' href='/'>
          <img src='/karnas.jpg' alt='Logo Karnas' draggable='false' />
          <h2>Sindangkasih</h2>
        </a>
        <div class='container-horizontal'>
          <For each={Object.keys(dropdown)} fallback={<div>Loading...</div>}>
            {(menu) =>
              typeof dropdown[menu] === 'object' ? (
                <sl-dropdown>
                  <sl-button class='menu-button' slot='trigger' caret>
                    {menu}
                  </sl-button>
                  <sl-menu>
                    <For each={Object.keys(dropdown[menu])}>
                      {(submenu) => (
                        <a href={dropdown[menu][submenu]}>
                          <sl-menu-item class='menu-item'>{submenu}</sl-menu-item>
                        </a>
                      )}
                    </For>
                  </sl-menu>
                </sl-dropdown>
              ) : (
                <a href={dropdown[menu]} tabindex='-1'>
                  <sl-button class='menu-button'>{menu}</sl-button>
                </a>
              )
            }
          </For>
        </div>
      </div>
    </header>
  )
}
