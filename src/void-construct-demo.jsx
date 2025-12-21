/* @refresh reload */
import { render } from 'solid-js/web';
import './index.css';
import './components/game/VoidConstructStation.css';
import VoidConstructStation from './components/game/VoidConstructStation.jsx';

const root = document.getElementById('root');

render(() => <VoidConstructStation />, root);
