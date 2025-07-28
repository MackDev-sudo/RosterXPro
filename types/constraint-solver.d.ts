declare module 'constraint-solver' {
  export class ConstraintSolver {
    constructor();
    variable(name: string, domain: number[]): Variable;
    add(constraint: Constraint): void;
    solve(): Record<string, number> | null;
    sum(variables: Variable[]): Expression;
    getVariable(name: string): Variable | undefined;
  }

  export class Variable {
    equals(value: number): Constraint;
    lessThanOrEquals(value: number): Constraint;
  }

  export class Expression {
    equals(value: number): Constraint;
    lessThanOrEquals(value: number): Constraint;
  }

  export class Constraint {}
}
