export const TREE_CONSTANTS = {
  MIN_NODE_WIDTH: 300,
  VERTICAL_SPACING: 150,
  HORIZONTAL_SPACING: 100,
  WIDTH_MULTIPLIER: 1,
  MAX_DEPTH: 4,
  NODE_HEIGHT: 40,
} as const

export const NEW_TREE = {
  title: { value: 'Decision Tree Title', isEditing: false },
  node: {
    id: 0,
    text: { value: 'Yes or no?', isEditing: false },
    yes: {
      id: 1,
      text: { value: 'Yes', isEditing: false },
      yes: null,
      no: null,
      parentId: 0,
    },
    no: {
      id: 2,
      text: { value: 'No', isEditing: false },
      yes: null,
      no: null,
      parentId: 0,
    },
  },
}

export const EXAMPLE_TREE = {
  title: {
    value: 'What should you have for lunch?',
    isEditing: false,
  },
  node: {
    id: 0,
    text: {
      value: 'Are you at home?',
      isEditing: false,
    },
    yes: {
      id: 1,
      text: {
        value: 'Do you have ingredients to make a sandwich?',
        isEditing: false,
      },
      yes: {
        id: 4,
        text: {
          value: 'Make a sandwich for lunch!',
          isEditing: false,
        },
        yes: null,
        no: null,
      },
      no: {
        id: 3,
        text: {
          value: 'Are you trying to eat healthy?',
          isEditing: false,
        },
        yes: {
          id: 6,
          text: {
            value: 'Order a salad or a rice bowl for delivery',
            isEditing: false,
          },
          yes: null,
          no: null,
        },
        no: {
          id: 5,
          text: {
            value: 'Order a burrito or a burger for delivery',
            isEditing: false,
          },
          yes: null,
          no: null,
        },
      },
      parentId: 0,
    },
    no: {
      id: 2,
      text: {
        value: 'Do you want to go to a sit-down restaurant?',
        isEditing: false,
      },
      yes: {
        id: 8,
        text: {
          value: 'Are you trying to eat healthy?',
          isEditing: false,
        },
        yes: {
          id: 12,
          text: {
            value: 'Order a salad, or maybe some sushi',
            isEditing: false,
          },
          yes: null,
          no: null,
        },
        no: {
          id: 11,
          text: {
            value: 'Order some pasta',
            isEditing: false,
          },
          yes: null,
          no: null,
        },
      },
      no: {
        id: 7,
        text: {
          value: 'Are you trying to eat healthy?',
          isEditing: false,
        },
        yes: {
          id: 10,
          text: {
            value: 'Pick up a salad or a rice bowl',
            isEditing: false,
          },
          yes: null,
          no: null,
        },
        no: {
          id: 9,
          text: {
            value: 'Grab a slice of pizza!',
            isEditing: false,
          },
          yes: null,
          no: null,
        },
      },
      parentId: 0,
    },
  },
}

export const SERIALIZED_EXAMPLE_TREE = `%7B%22title%22%3A%22What%20should%20you%20have%20for%20lunch%3F%22%2C%22node%22%3A%7B%22id%22%3A0%2C%22text%22%3A%22Are%20you%20at%20home%3F%22%2C%22yes%22%3A%7B%22id%22%3A1%2C%22text%22%3A%22Do%20you%20have%20ingredients%20to%20make%20a%20sandwich%3F%22%2C%22yes%22%3A%7B%22id%22%3A4%2C%22text%22%3A%22Make%20a%20sandwich%20for%20lunch!%22%2C%22yes%22%3Anull%2C%22no%22%3Anull%7D%2C%22no%22%3A%7B%22id%22%3A3%2C%22text%22%3A%22Are%20you%20trying%20to%20eat%20healthy%3F%22%2C%22yes%22%3A%7B%22id%22%3A6%2C%22text%22%3A%22Order%20a%20salad%20or%20a%20rice%20bowl%20for%20delivery%22%2C%22yes%22%3Anull%2C%22no%22%3Anull%7D%2C%22no%22%3A%7B%22id%22%3A5%2C%22text%22%3A%22Order%20a%20burrito%20or%20a%20burger%20for%20delivery%22%2C%22yes%22%3Anull%2C%22no%22%3Anull%7D%7D%2C%22parentId%22%3A0%7D%2C%22no%22%3A%7B%22id%22%3A2%2C%22text%22%3A%22Do%20you%20want%20to%20go%20to%20a%20sit-down%20restaurant%3F%22%2C%22yes%22%3A%7B%22id%22%3A8%2C%22text%22%3A%22Are%20you%20trying%20to%20eat%20healthy%3F%22%2C%22yes%22%3A%7B%22id%22%3A12%2C%22text%22%3A%22Order%20a%20salad%2C%20or%20maybe%20some%20sushi%22%2C%22yes%22%3Anull%2C%22no%22%3Anull%7D%2C%22no%22%3A%7B%22id%22%3A11%2C%22text%22%3A%22Order%20some%20pasta%22%2C%22yes%22%3Anull%2C%22no%22%3Anull%7D%7D%2C%22no%22%3A%7B%22id%22%3A7%2C%22text%22%3A%22Are%20you%20trying%20to%20eat%20healthy%3F%22%2C%22yes%22%3A%7B%22id%22%3A10%2C%22text%22%3A%22Pick%20up%20a%20salad%20or%20a%20rice%20bowl%22%2C%22yes%22%3Anull%2C%22no%22%3Anull%7D%2C%22no%22%3A%7B%22id%22%3A9%2C%22text%22%3A%22Grab%20a%20slice%20of%20pizza!%22%2C%22yes%22%3Anull%2C%22no%22%3Anull%7D%7D%2C%22parentId%22%3A0%7D%7D%7D`
