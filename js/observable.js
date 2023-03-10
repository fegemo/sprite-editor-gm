export class Observable {
  #value
  
  constructor(value) {
    this.#value = value
    this.listeners = []
  }
  
  get() {
    return this.#value
  }
  
  set(updated) {
    if (updated === this.#value) {
      return
    }
    
    const previousValue = this.#value
    this.#value = updated

    // need to use vanilla for in reverse because some listener might reduce the
    // listeners array size (such as with the computed progress observable)
    for (let c = this.listeners.length - 1; c >= 0; c--) {
      this.listeners[c](updated, previousValue, this)
    }
  }
  
  addListener(listener) {
    this.listeners.push(listener)
  }
  
  removeListener(listener) {
    const index = this.listeners.indexOf(listener)
    if (index >= 0) {
      this.listeners.splice(index, 1)
    }
  }
}

export class ComputedProgressObservable extends Observable {
  #observables

  constructor(observables = []) {
    super(0)
    this.#observables = observables

    this.watchIndividualProgress = this.watchIndividualProgress.bind(this)
    observables.forEach(obs => obs.addListener(this.watchIndividualProgress))
  }

  watchIndividualProgress(progress, previous, observable) {
    const increment = (progress - previous) / this.#observables.length
    this.set(Math.min(1, this.get() + increment))

    if (progress >= 1) {
      observable.removeListener(this.watchIndividualProgress)
    }
  }
}
