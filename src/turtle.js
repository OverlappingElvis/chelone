module.exports = class Turtle {

  constructor (options) {

    this.bounds = {
      x: 1000,
      y: 1000
    }

    this.x = this.bounds.x / 2
    this.y = this.bounds.y / 2

    this.heading = 90
    this.previousHeading = 90
    this.penDown = true

    this.segments = []
  }

  render () {

    return [`<svg viewBox="0 0 ${this.bounds.x} ${this.bounds.y}" xmlns="http://www.w3.org/2000/svg">`, ...this.segments, `</svg>`].join(``)
  }

  setNewCoordinates ({ x, y }) {

    const oldX = this.x
    const newX = this.x + x

    const oldY = this.y
    const newY = this.y + y

    if (this.penDown === true) {

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

    const sign = direction === `left` ? 1 : -1

    const newAngle = this.heading + (sign * degrees)

    this.heading = this.normalizeHeading(newAngle)
  }
}