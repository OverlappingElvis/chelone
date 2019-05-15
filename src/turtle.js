module.exports = class Turtle {

  constructor (options) {

    this.bounds = {
      x: 1000,
      y: 1000
    }

    this.x = 500
    this.y = 500

    this.heading = 90
    this.previousHeading = 90

    this._penDown = true

    this.segments = []
  }

  get origin () {

    return {
      x: 500,
      y: 500
    }
  }

  render () {

    return [`<svg viewBox="0 0 ${this.bounds.x} ${this.bounds.y}" xmlns="http://www.w3.org/2000/svg">`, ...this.segments, `</svg>`].join(``)
  }

  move (direction, length) {

    const sign = [`forward`, `fd`].includes(direction) ? -1 : 1

    const offset = this.getCoordinatesOffset(sign * length)

    this.setNewCoordinates(offset)
  }

  // Reset turtle position and direction, but don't change pen state or direction
  home () {

    this.setNewCoordinates(this.origin, true)
  }

  penDown () {

    this._penDown = true
  }

  penUp () {

    this._penDown = false
  }

  // Set new coordinates relative to origin, but don't change pen state or direction
  setXY ({ x, y }) {

    this.setNewCoordinates({
      x: this.origin.x + x,
      y: this.origin.y + y
    }, true)
  }

  setNewCoordinates ({ x, y }, absolute) {

    const oldX = this.x
    const newX = absolute ? x : this.x + x

    const oldY = this.y
    const newY = absolute ? y : this.y + y

    if (this._penDown === true) {

      this.segments.push(`<line x1="${oldX.toFixed(0)}" y1="${oldY.toFixed(0)}" x2="${newX.toFixed(0)}" y2="${newY.toFixed(0)}" stroke="black" />`)
    }

    this.x = newX
    this.y = newY
  }

  getCoordinatesOffset (length) {

    // Math.cos and Math.sin take radians as input so convert from degrees
    return {
      x: length * Math.cos(this.heading * (Math.PI / 180)),
      y: length * Math.sin(this.heading * (Math.PI / 180))
    }
  }

  normalizeHeading (degrees) {

    if (degrees < 0) {

      return this.normalizeHeading(360 + degrees)
    }

    if (degrees > 360) {

      return this.normalizeHeading(degrees - 360)
    }

    if (degrees === 360) {

      return 0
    }

    return degrees
  }

  setHeading (direction, degrees) {

    this.previousHeading = this.heading

    const sign = [`left`, `lt`].includes(direction) ? -1 : 1

    const newAngle = this.heading + (sign * degrees)

    this.heading = this.normalizeHeading(newAngle)
  }

  setAbsoluteHeading(degrees) {

    const newHeading = this.normalizeHeading(degrees)

    this.previousHeading = newHeading
    this.heading = newHeading
  }
}