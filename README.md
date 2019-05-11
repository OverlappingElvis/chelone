# Chelone

## Introduction

Chelone is an interpreter for a subset of the Logo programming language (mostly the turtle parts) implemented in [chevrotain](https://raw.githubusercontent.com/SAP/chevrotain/).

## Usage

-   `npm install`
-   Example: `npm run turtle -- -P "repeat 4 [forward 100 right 90] -O output.svg"`
    -   If run without options (`npm run turtle`), will output a demo image to `turtle.svg`

## Implemented Commands

If you're not familiar with Logo or turtle graphics, check out the Logo Foundation's [Logo Primer](https://el.media.mit.edu/logo-foundation/what_is_logo/logo_primer.html).

### Drawing and Movement

-   `penup` (alias `pu`)
-   `pendown` (alias `pd`)
-   `forward <amount>` (alias `fd`)
-   `backward <amount>` (alias `bk`)
-   `right <degrees>` (alias `rt`)
-   `left <degrees>` (alias `lt`)
-   `home`
-   `setxy <x> <y>` (relative to the origin)

### Iteration, Procedures, Variables

-   `repeat <count> [<statements>]`
-   `to <procedure> :<input> <statements> end`
-   `make "<variable> <value>`

### Calculation

-   `+`, `-`, `*`, `/` (one operation per statement, no precedence or grouping)
-   `random <max>` (random integer from 0 to max exclusive)

### To Implement

-   Program flow and control
-   Additional drawing tools
