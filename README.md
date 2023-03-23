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

eg: python3 src/initilize-layout.py examples/batchtree/last-fm.dot examples/inputs/lastfm.json 
```

## Input Data

```
Output of the initialization which is of type .json will be the input
```

## Running

```
npm run delg inputfile(which is the output of the initialilzation above) outputfile
```

## Output Data

```
Outputs graph coordinates to form a network
```
