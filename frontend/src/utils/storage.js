export function loadUIState() {
  try {
    const raw = localStorage.getItem('draft_helper_state') || sessionStorage.getItem('draft_helper_state')
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    console.warn('loadUIState failed', err)
    return null
  }
}

export function saveUIState(state) {
  try {
    try {
      localStorage.setItem('draft_helper_state', JSON.stringify(state))
    } catch (e) {
      // fallback to sessionStorage
      sessionStorage.setItem('draft_helper_state', JSON.stringify(state))
    }
  } catch (err) {
    console.warn('saveUIState failed', err)
  }
}
