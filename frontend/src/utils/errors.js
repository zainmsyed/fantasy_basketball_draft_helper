export class DataLoadError extends Error {
  constructor(message) { super(message); this.name = 'DataLoadError' }
}

export class ValidationError extends Error {
  constructor(message) { super(message); this.name = 'ValidationError' }
}

export class StorageError extends Error {
  constructor(message) { super(message); this.name = 'StorageError' }
}
