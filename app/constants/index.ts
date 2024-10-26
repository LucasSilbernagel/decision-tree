export const TREE_CONSTANTS = {
  MIN_NODE_WIDTH: 300,
  VERTICAL_SPACING: 100,
  HORIZONTAL_SPACING: 100,
  WIDTH_MULTIPLIER: 1.5,
  MAX_DEPTH: 4,
  NODE_HEIGHT: 40,
} as const

export const EXAMPLE_TREE = `%7B"title"%3A"What%20should%20you%20have%20for%20lunch%3F"%2C"node"%3A%7B"id"%3A0%2C"text"%3A"Are%20you%20at%20home%3F"%2C"yes"%3A%7B"id"%3A1%2C"text"%3A"Do%20you%20have%20ingredients%20to%20make%20a%20sandwich%3F"%2C"yes"%3A%7B"id"%3A4%2C"text"%3A"Make%20a%20sandwich%20for%20lunch!"%2C"yes"%3Anull%2C"no"%3Anull%7D%2C"no"%3A%7B"id"%3A3%2C"text"%3A"Are%20you%20trying%20to%20eat%20healthy%3F"%2C"yes"%3A%7B"id"%3A6%2C"text"%3A"Order%20a%20salad%20or%20a%20rice%20bowl%20for%20delivery"%2C"yes"%3Anull%2C"no"%3Anull%7D%2C"no"%3A%7B"id"%3A5%2C"text"%3A"Order%20a%20burrito%20or%20a%20burger%20for%20delivery"%2C"yes"%3Anull%2C"no"%3Anull%7D%7D%2C"parentId"%3A0%7D%2C"no"%3A%7B"id"%3A2%2C"text"%3A"Do%20you%20want%20to%20go%20to%20a%20sit-down%20restaurant%3F"%2C"yes"%3A%7B"id"%3A8%2C"text"%3A"Are%20you%20trying%20to%20eat%20healthy%3F"%2C"yes"%3A%7B"id"%3A12%2C"text"%3A"Order%20a%20salad%2C%20or%20maybe%20some%20sushi"%2C"yes"%3Anull%2C"no"%3Anull%7D%2C"no"%3A%7B"id"%3A11%2C"text"%3A"Order%20some%20pasta"%2C"yes"%3Anull%2C"no"%3Anull%7D%7D%2C"no"%3A%7B"id"%3A7%2C"text"%3A"Are%20you%20trying%20to%20eat%20healthy%3F"%2C"yes"%3A%7B"id"%3A10%2C"text"%3A"Pick%20up%20a%20salad%20or%20a%20rice%20bowl"%2C"yes"%3Anull%2C"no"%3Anull%7D%2C"no"%3A%7B"id"%3A9%2C"text"%3A"Grab%20a%20slice%20of%20pizza!"%2C"yes"%3Anull%2C"no"%3Anull%7D%7D%2C"parentId"%3A0%7D%7D%7D`
