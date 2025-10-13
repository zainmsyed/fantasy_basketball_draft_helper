import Alpine from 'alpinejs'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import './styles/main.css'
import 'tabulator-tables/dist/css/tabulator.min.css'

import { createDraftHelperStore } from './modules/ui/alpine-store.js'

window.Tabulator = Tabulator

Alpine.data('draftHelper', createDraftHelperStore)
Alpine.start()

console.log('Frontend: Draft helper loaded')
