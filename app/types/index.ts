export type NodeType = 'yes' | 'no' | 'root'

export type NodePosition = {
  x: number
  y: number
  type: NodeType
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
  type?: NodeType
}

export type DecisionTree = {
  title: {
    value: string
    isEditing: boolean
  }
  node: DecisionTreeNode
}

export type SerializedNode = {
  id: number
  text: string
  yes: SerializedNode | null
  no: SerializedNode | null
  parentId?: number
}

export type SerializedTree = {
  title: string
  node: SerializedNode
}
