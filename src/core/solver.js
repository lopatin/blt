import {arr, objectValues} from 'core/utils';
import I from 'immutable';

const ops = {
  plus: '+',
  minus: '-',
  divide: '/',
  times: '*'
};
let opsInverted = {};
Object.keys(ops).forEach(key => {
  opsInverted[ops[key]] = key;
});

/**
 * An Expression can either be a root expression or a compound one. Root expressions are
 * variable identifiers, managed constants, or simple constants. Managed constants are
 * variables under the hood but simple are constants are not. Compound expressions consist
 * of a left and right child expression and a binary operator.
 */
class Expression {
  constructor(str, left = null, right = null, op = null) {
    this.str = str;
    this.template = null;
    this.left = left;
    this.right = right;
    this.op = op;
    this.managedConstantValue = null;
    this.simpleConstantValue = null;
  }

  // Parses str into a tree of expressions.
  parse() {
    let str = this.str.trim();

    // If it's surrounded with curlies, then it's a managed constant.
    if (str.length >= 2 && str[0] === '{' && str[str.length - 1] === '}') {
      this.managedConstantValue = parseFloat(str.slice(1, str.length - 1));
      this.template = '{const}';
      return this;

    // If it's a numeric string then it's a simple constant.
    } else if (str.match(/^[0-9]+(\.[0-9]+)?$/)) {
      this.simpleConstantValue = parseFloat(str);
      this.template = str;
      return this;

    // It's a variable identifier if it's only letters, numbers, and underscores.
    } else if (str.match(/^[a-zA-Z0-9_]+$/)) {
      this.varName = str;
      this.template = str;
      return this;
    }


    let inParen = false;
    let cursor = 0;
    let tokens = [];
    for (let i = 0; i < str.length; i++) {
      let ch = str[i];

      // First, handle parens.
      if (!inParen && ch === '(') {
        inParen = true;
        cursor = i + 1;
        continue;
      } else if (inParen && ch === ')') {
        inParen = false;
        tokens.push(new Expression(str.slice(cursor, i)).parse());
        cursor = i + 1;
        continue;
      }

      // If we reached an operator then tokenize it as well as whatever content is
      // between it and the cursor.
      if (opsInverted[ch]) {
        let extraExp = str.slice(cursor, i).trim();
        if (extraExp.length) {
          tokens.push(new Expression(extraExp).parse());
        }
        tokens.push(ch);
        cursor = i + 1;
      }
    }

    // And one last time for the last token if the expression is incomplete.
    if (!tokens.length || !!opsInverted[tokens[tokens.length - 1]]) {
      tokens.push(new Expression(str.slice(cursor)).parse());
    }

    // Now `tokens` contains an array that looks like:
    // [varExpr, '+', constExpr, '-', childExpr, '*', childExpr]
    // First do all multiplication/division.
    let plusAndMinusTokens = [];
    tokens.forEach(token => {
      plusAndMinusTokens.push(token);

      // Reduce the last three tokens if they can be multiplied or divided.
      if (plusAndMinusTokens.length >= 3) {
        let op = plusAndMinusTokens[plusAndMinusTokens.length - 2];
        if (op === ops.times || op === ops.divide) {
          let right = plusAndMinusTokens.pop();
          plusAndMinusTokens.pop();
          let left = plusAndMinusTokens.pop();
          plusAndMinusTokens.push(new Expression('', left, right, op));
        }
      }
    });




    // Next, reduce all the additions and subtractions.
    let o, r, finalExp;
    plusAndMinusTokens.forEach(token => {
      if (!finalExp) {
        finalExp = token;
      } else if (opsInverted[token]) {
        o = token;
      } else {
        finalExp = new Expression(null, finalExp, token, o);
      }
    });

    this.left = finalExp.left;
    this.right = finalExp.right;
    this.op = finalExp.op;
    this.managedConstantValue = finalExp.managedConstantValue;
    this.simpleConstantValue = finalExp.simpleConstantValue;

    return this;
  }

  managedConstantValues() {
    if (this.managedConstantValue !== null) {
      return [this.managedConstantValue];
    } else if (this.left && this.right) {
      return [...this.left.managedConstantValues(), ...this.right.managedConstantValues()];
    } else {
      return [];
    }
  }

  vars() {
    if (this.varName) {
      return [this.varName];
    } else if (this.left && this.right) {
      return [...this.left.vars(), ...this.right.vars()];
    } else {
      return [];
    }
  }

  buildCassowaryExpr(vars, constantSupplier) {
    if (this.managedConstantValue !== null) {
      return constantSupplier();
    } else if (this.simpleConstantValue !== null) {
      let x = new V.c.Expression(this.simpleConstantValue);
      return x;
    } else if (this.varName) {
      return V.c.Expression.fromVariable(vars[this.varName]);
    } else {
      let l = this.left.buildCassowaryExpr(vars, constantSupplier);
      let r = this.right.buildCassowaryExpr(vars, constantSupplier);
      if (this.op === ops.plus) {
        return V.c.plus(l, r);
      } else if (this.op === ops.minus) {
        return V.c.minus(l, r);
      } else if (this.op === ops.times) {
        return V.c.times(l, r);
      } else if (this.op === ops.divide) {
        return V.c.divide(l, r);
      }
    }
  }
}

const strengths = {
  strong: '!!',
  medium: '!',
  weak: '~'
};

const comparators = {
  'geq': '>=',
  'leq': '<=',
  'eq': '='
};

class Constraint {
  constructor(str) {
    this.str = str;
    this.left = null;
    this.right = null;
    this.comparator = null;
    this.strength = null;
    this.template = null;
  }

  // Some example constraints:
  // "x = y + 5" default strength (required)
  // "!! z = t + 89" strong
  // "! (z + 30) - x = t" medium
  // "~ z >= t + (y / 33)" weak
  parse() {
    let str = this.str.trim();

    // Determine the constraint strength and remove the strength indicator from the string.
    Object.keys(strengths).forEach(strengthName => {
      const strength = strengths[strengthName];
      if (!this.strength && str.slice(0, strength.length) === strength) {
        this.strength = strengthName;
        str = str.slice(strength.length);
      }
    });

    // Determine the comparator.
    Object.keys(comparators).forEach(opName => {
      const comparator = comparators[opName];
      if (!this.comparator && str.indexOf(comparator) !== -1) {
        this.comparator = comparator;
        let [leftStr, rightStr] = str.split(comparator);
        this.left = new Expression(leftStr).parse();
        this.right = new Expression(rightStr).parse();
      }
    });

    this.template = `${this.strength}${this.left.template}${this.comparator}${this.right.template}`;

    return this;
  }

  managedConstantValues() {
    return [
      ...this.left.managedConstantValues(),
      ...this.right.managedConstantValues()
    ];
  }

  vars() {
    return [
      ...this.left.vars(),
      ...this.right.vars()
    ];
  }

  buildCassowaryConstraint(vars, managedConstants) {
    let constantCounter = 0;
    const constantSupplier = () => {
      let c = managedConstants[constantCounter];
      constantCounter++;
      return c;
    };

    let leftExpr = this.left.buildCassowaryExpr(vars, constantSupplier);
    let rightExpr = this.right.buildCassowaryExpr(vars, constantSupplier);

    if (this.comparator === comparators.eq) {
      return new V.c.Equation(leftExpr, rightExpr, V.c.Strength[this.strength]);
    } else if (this.comparator === comparators.geq) {
      return new V.c.Inequality(leftExpr, V.c.GEQ, rightExpr, V.c.Strength[this.strength]);
    } else if (this.comparator === comparators.leq) {
      return new V.c.Inequality(leftExpr, V.c.LEQ, rightExpr, V.c.Strength[this.strength]);
    }
  }
}

/**
 * A System contains a set of named Cassowary variables and a set of constraints that
 * define relations for them. This class wraps the Cassowary solver.
 */
export class System {
  constructor(constraintSpecs) {
    this.constraints = {};
    this.cassowaryConstraints = {};
    this.solver = new V.c.SimplexSolver();
    this.vars = {};
    this.managedConstants = {};

    // Add initial constraints.
    constraintSpecs.forEach(constraintSpec => {
      arr(constraintSpec).forEach(constr => {
        this._addConstraint(new Constraint(constr).parse());
      });
    });
  }

  // Takes a fresh set of constraints and updates the system to match it.
  updateConstraints(constraintSpecs) {
    let newConstraints = {};
    constraintSpecs.forEach(constraintSpec => {
      arr(constraintSpec).forEach(constr => {
        let constraintObj = new Constraint(constr).parse();
        let tmpl = constraintObj.template;
        newConstraints[tmpl] = constraintObj;
      });
    });

    // First remove extraneous constraints from the solver.
    Object.keys(this.constraints).forEach(existingConstraintKey => {
      if (!newConstraints[existingConstraintKey]) {
        this._rmConstraint(existingConstraintKey);
      }
    });

    // (Const variable, suggestion value) pairs.
    let suggestions = [];

    // Add new constraints and update managed constants of existing ones.
    Object.keys(newConstraints).forEach(newConstraintKey => {
      let newConstraint = newConstraints[newConstraintKey];
      if (!this.constraints[newConstraintKey]) {
        this._addConstraint(newConstraint);
      } else {
        let existingConstants = this.managedConstants[newConstraintKey];
        let newConstantValues = newConstraint.managedConstantValues();
        existingConstants.forEach((existingConstant, i) => {
          if (!V.c.approx(existingConstant.value, newConstantValues[i])) {
            suggestions.push({
              constant: existingConstant,
              targetValue: newConstantValues[i]
            });
          }
        });
      }
    });

    // Add edit vars for managed constants, begin edit, suggest updated vals, end edit, resolve.
    if (suggestions.length > 0) {
      suggestions.forEach(suggestion => {
        this.solver.addEditVar(suggestion.constant);
      });
      this.solver.beginEdit();
      suggestions.forEach(suggestion => {
        this.solver.suggestValue(suggestion.constant, suggestion.targetValue);
      });
      this.solver.endEdit();
      this.solver.resolve();
    }
  }

  solution() {
    let sol = {};
    Object.keys(this.vars).forEach(varName => {
      sol[varName] = this.vars[varName].value;
    });
    return sol;
  }

  // Adds the constraint to the system. It must already be parsed. Automatically adds
  // variables to the system.
  _addConstraint(constraint) {
    this.constraints[constraint.template] = constraint;
    this.managedConstants[constraint.template] =
        constraint.managedConstantValues().map(value => new V.c.Variable({value}));
    // this.solver.addStay(this.managedConstants[constraint.template]);

    // Add any vars that don't exist yet.
    objectValues(this.constraints).forEach(constraint => {
      constraint.vars().forEach(v => {
        if (!this.vars[v]) {
          this.vars[v] = new V.c.Variable({value: 0});
          this.solver.addStay(this.vars[v]);
        }
      });
    });

    // Now build the cassowary constraint object and add it the solver.
    let cConstraint = this.cassowaryConstraints[constraint.template] =
        constraint.buildCassowaryConstraint(
          this.vars,
          this.managedConstants[constraint.template]);
    this.solver.addConstraint(cConstraint);
  }

  // Remove a constraint from the system. Automatically removes extraneous variables.
  _rmConstraint(constraintTmpl) {
    let constraint = this.constraints[constraintTmpl];
    this.solver.removeConstraint(this.cassowaryConstraints[constraintTmpl]);
    delete this.constraints[constraintTmpl];
    delete this.managedConstants[constraintTmpl];
    delete this.cassowaryConstraints[constraintTmpl];

    // Remove unused vars.
    let newVars = {};
    objectValues(this.constraints).forEach(constraint => {
      constraint.vars().forEach(v => {
        newVars[v] = this.vars[v];
      });
    });
    this.vars = newVars;
  }
}
