# blt

System Overview:

An editor that builds a representation the source AST of React JS program. At first, the editor
only knows how to build the AST via built-in components that spit out source code which is compiled
via Sweet.js. This also means that they can freely use built-in macros, when necessary.

Eventually, the editor will be able to build and use composite components. These are compositions of
the built-ins and may not use macros, therefore they do not have the power to emit raw source code
themselves.

Decorators (aka higher-order components) are the logic layer. Standard library includes helpers from
recompose as well as some custom ones. As soon as


 - Sweet.js macros custom written
 - Internal components custom written which generate macro calls
   - Protects against Sweet.js compiler errors
 - Public components may be composed of the internal ones

Old System Overview:
 - UI that saves the source code of a language that compiles to React source code
 - Core Babylon AST extensible via macros, a.k.a. AST transformations
 - Compiles to both runtime JS classes and JSON, which compiles to JS code for deployment

Type system:
 - A concrete type is something that the compiler has built in code for
 - A type alias can always be traced to a concrete type
 - AST nodes represented via immutable maps
 - Root node of AST is always a Component

Validate props statically:
 - Allow props to be unannotated
 - Should correspond to/be compilable to PropTypes?
 - Missing required prop
 - Wrong type

Concrete types:
 - TypeRef
 - Union
 - Any
 - ComponentClass
 - FunctionalComponent
 - ReactElement
 - Prop
 - Decorator
 - String
 - Number
 - Boolean
 - Object
 - Array
 - Function
 - Lambda
 - DateTime
 - NumberLiteral
 - StringLiteral
 - BooleanLiteral
 - MapLiteral
 - ListLiteral

Scope:
 - Scopes are used during compilation to store references to built objects

Sample AST:
{
	"_type": "Component",
	"name": "MyProject",
	"props": {
		"_type": "Map",
		"keyType": {
			"_type": "TypeRef",
			"value": "internal.String"
		},
		"valType": {
			"_type": "TypeRef",
			"value": "internal.Prop"
		},
		"properties": {
			"onChange": {
				"_type": "PropType",
				"value": {
					"_type": "TypeRef",
					"value": "some.package.CustomFuncType"
				},
				"required": true
			}
		}
	},
	"render": {
		"_type": "ReactElement",
		"elementType": {
			"_type": "TypeRef",
			"value": "standard.Div"
		},
		"props": {
			"_type": "Object",
			"keyType": {
				"_type": "TypeRef",
				"value": "internal.String"
			},
			"valType": {
				"_type": "TypeRef",
				"value": "internal.Any"
			},
			"properties": {
				"className": {
					"_type": "internal.String",
					"value": "some css class"
				}
			}
		},
		"children": {
		}
	}
}
