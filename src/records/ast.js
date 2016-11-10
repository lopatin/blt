import I from 'immutable';

export const ComponentDef = I.Record({
  _type: 'ComponentDef',
  path: null, // String
  render: null, // { Element | null }
  // May be partially filled in before transformation.
  decorators: null, // { []Decorator | null }
  // Null before transformation, but child Element decorators may be extracted using this.
  subComponents: null, // { []ComponentDef | null }
});

export const Element = I.Record({
  _type: 'Element',
  componentPath: null, // String
  children: null, // { []Element | null }
  // Must be null after transformation extracts these to the ComponentDef.
  decorators: I.fromJS([]), // []Decorator
  // Every element is defined in some kind of PropScope.
  scope: null, // PropScope
});

export const Decorator = I.Record({
  _type: 'Decorator',
  path: null, // String
  input: null, // PropScope
  output: null, // PropScope
});

export const PropScope = I.Record({
  _type: 'PropScope',
  props: I.fromJS([]), // []Prop
});

export const Prop = I.Record({
  _type: 'Prop',
  id: null, // String
  name: null, // String
});









// const GrammarNode = new I.Record({
//   expands: null,        // I.List
// });

// const VisualGrammar = new I.Map()
//     .set(Constraints,
//       I.List.of(
//         new GrammarNode({
//           key: 'constraints',
//           expands: I.List.of(Constraint)
//         })
//       ),
//       withProps({
//         template: vals => vals.join('\n')
//       })(ASTTextEditor))
//     .set(Constraint,
//       I.List.of(
//         new GrammarNode({
//           key: 'strength',
//           availableVals: I.List.of('weak', 'medium', 'strong', 'required')
//         }),
//         new GrammarNode({
//           key: 'expr',
//           expands: I.List.of(ConstraintAssignmentExpr, ConstraintComparisonExpr)
//         })
//       ));














const Grammar = I.Map.of(
  Constraints, I.List.of(Constraint, Constraints),
  Constraint, I.List.of(Strength),
  Strength, I.List.of(ConstraintAssignmentExpr, ConstraintComparisonExpr));

export const Constraints = I.Record({
  _type: 'Constraints',
  constraints: new Constraint(), // { Constraints | Constraint }
});

export const Constraint = I.Record({
  _type: 'Constraint',
  expr: null, // { Strength }
});

export const Strength = I.Record({
  _type: 'Strength',
  _vals: I.List.of('weak', 'medium', 'strong', 'required'),
  expr: null, // { ConstraintAssignmentExpr | ConstraintComparisonExpr }
});

export const ConstraintAssignmentExpr = I.Record({
  _type: 'ConstraintAssignmentExpr',
  left: null, // ConstraintIdent
  right: null, // { BinaryConstraintExpr | UnaryConstraintExpr }
});

export const ConstraintComparisonExpr = I.Record({
  _type: 'ConstraintComparisonExpr',
  op: null, // '<=', '>='
  left: null, // { BinaryConstraintExpr | UnaryConstraintExpr }
  right: null, // { BinaryConstraintExpr | UnaryConstraintExpr }
});

export const BinaryConstraintExpr = I.Record({
  _type: 'BinaryConstraintExpr',
  expr: null, // { LeftConstBinaryExpr | RightConstBinaryExpr }
});

export const RightConstBinaryExpr = I.Record({
  _type: 'RightConstBinaryExpr',
  op: null, // '+', '-', '/', '*'
  left: null, // { BinaryConstraintExpr | UnaryConstraintExpr }
  right: null, // ConstConstraintExpr
});

export const LeftConstBinaryExpr = I.Record({
  _type: 'LeftConstBinaryExpr',
  op: null, // '+', '-', '/', '*'
  left: null, // ConstConstraintExpr
  right: null, // { BinaryConstraintExpr | UnaryConstraintExpr }
});

export const ConstBinaryConstraintExpr = I.Record({
  _type: 'ConstBinaryConstraintExpr',
  op: null, // '+', '-', '/', '*'
  left: null, // { ConstBinaryConstraintExpr | ConstUnaryConstraintExpr }
  right: null, // { ConstBinaryConstraintExpr | ConstUnaryConstraintExpr }
});

export const ConstConstraintExpr = I.Record({
  _type: 'ConstConstraintExpr',
  expr: null, // { ConstUnaryConstraintExpr | ConstBinaryConstraintExpr }
});

export const ConstUnaryConstraintExpr = I.Record({
  _type: 'ConstUnaryConstraintExpr',
  expr: null, // { Const | Prop | ConstParensConstraintExpr }
});

export const ConstParensConstraintExpr = I.Record({
  _type: 'ConstParensConstraintExpr',
  expr: null, // ConstConstraintExpr
});

export const UnaryConstraintExpr = I.Record({
  _type: 'UnaryConstraintExpr',
  operation: null, // { ParensConstraintExpr | IdentConstraintExpr | ConstConstraintExpr }
});

export const ParensConstraintExpr = I.Record({
  _type: 'ParensConstraintExpr',
  operation: null, // { BinaryConstraintExpr | UnaryConstraintExpr }
});

export const IdentConstraintExpr = I.Record({
  _type: 'IdentConstraintExpr',
  value: null, // String
});
