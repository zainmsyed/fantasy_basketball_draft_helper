import Alpine from 'alpinejs'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import './styles/main.css'
import 'tabulator-tables/dist/css/tabulator.min.css'

import { createDraftHelperStore } from './modules/ui/alpine-store.js'
import { PuntStrategyComponents } from './modules/punt-strategy/ui-components.js'

window.Tabulator = Tabulator

// Register punt strategy components
Alpine.data('CategorySelector', PuntStrategyComponents.CategorySelector)
Alpine.data('StrategyManager', PuntStrategyComponents.StrategyManager)
Alpine.data('StrategyPresets', PuntStrategyComponents.StrategyPresets)
Alpine.data('StrategyStats', PuntStrategyComponents.StrategyStats)

Alpine.data('draftHelper', createDraftHelperStore)
Alpine.start()

console.info('Frontend: Draft helper loaded')
