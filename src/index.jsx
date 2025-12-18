import setupLocatorUI from "@treelocator/runtime";
/* @refresh reload */
import { render } from 'solid-js/web'
import './index.css'
import App from './App.jsx'

if (import.meta.env.DEV) {
  setupLocatorUI();
}

const root = document.getElementById('root')

render(() => <App />, root)
