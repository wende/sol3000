/* @refresh reload */
import { render } from 'solid-js/web'
import './index.css'
import App from './App.jsx'

if (import.meta.env.DEV) {
  import("@treelocator/runtime").then(({ default: setupLocatorUI }) => {
    setupLocatorUI();
  }).catch(() => {});
}

const root = document.getElementById('root')

render(() => <App />, root)
