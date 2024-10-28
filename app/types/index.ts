export type NodePosition = {
  x: number
  y: number
  type: 'yes' | 'no' | 'root'
}

export type DecisionTreeNode = {
  id: number
  text: {
    value: string
    isEditing: boolean
  }
  yes: DecisionTreeNode | null
  no: DecisionTreeNode | null
  parentId?: number
}

export type DecisionTree = {
  title: {
    value: string
    isEditing: boolean
  }
  node: DecisionTreeNode
}
