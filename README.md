# ZMLT Desired Edge-Length Guided Layout

## Setup

Prerequisite: install node.js v16+

```bash
npm ci
```

## Initialization

```
input: dot formated file which is the network
output: json file which will be the input for the Algorithm

eg: python3 src/createInit.py examples/batchtree/last-fm.dot examples/inputs/lastfm.json 
```

## Input Data

```
dot formated file containing nodes and edges
```

## Running

```
npm run delg inputfile(which is the output of the initialilzation above) outputfile
```

## Output Data

```
Outputs graph coordinates to form a network
```
