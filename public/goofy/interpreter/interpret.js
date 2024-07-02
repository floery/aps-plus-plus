"use strict";

document.querySelector("#interpretButton").addEventListener("click", runCode);
function runCode() {
  let program = document.querySelector("#codeinput").innerText;
  let tokens = tokenize(program);
  document.querySelector("#tokens").innerText = "[" + tokens.join(", ") + "]";
  tokens = refineTokens(tokens);
  document.querySelector("#tokens2").innerText = JSON.stringify(tokens);
  let ast = parse(tokens);
  document.querySelector("#ast").innerText = JSON.stringify(ast);
  let result = interpreter(ast);
  document.querySelector("#value").innerText = JSON.stringify(result);
}

function tokenize(string) {
  let regexp =
    /("[^\n"]{0,}")|([0-9]{1,}\.[0-9]{1,})|(-{0,}[0-9]{1,})|([a-zA-Z_][0-9a-zA-Z_]{0,})|([+\-*\/]=)|[{}[\]+\-*\/=.,\(\)]/g;
  let tokens = string.match(regexp);
  if (string.match(/;/g)) {
    alert("LexerError: This isn't JavaScript");
    return [];
  }
  return tokens;
}
function refineTokens(tokens) {
  let output = [];
  tokens.forEach((t) => {
    if ("" + parseFloat(t) === t) {
      output.push({
        type: "numberToken",
        value: parseFloat(t),
      });
    } else if (["return", "switch", "break", "parameters"].includes(t)) {
      output.push({
        type: t + "Token",
        value: t,
      });
    } else if (["var"].includes(t)) {
      output.push({
        type: "variableDeclarationToken",
        value: t,
      });
    } else if (t[0] === '"') {
      output.push({
        type: "stringToken",
        value: t,
      });
    } else if (t === "{") {
      output.push({
        type: "braceToken",
        value: "open",
      });
    } else if (t === "}") {
      output.push({
        type: "braceToken",
        value: "close",
      });
    } else if (t === "(") {
      output.push({
        type: "bracketToken",
        value: "open",
      });
    } else if (t === ")") {
      output.push({
        type: "bracketToken",
        value: "close",
      });
    } else if (t.match(/([+\-*\/]=)/g)) {
      output.push({
        type: "binaryExprAssignmentToken",
        value: t,
      });
    } else if (t === "=") {
      output.push({
        type: "equalsToken",
        value: t,
      });
    } else if (t.match(/[+\-*\/]/g)) {
      output.push({
        type: "binaryExprToken",
        value: t,
      });
    } else if (t.match(/[+\-*\/=.,]/g)) {
      output.push({
        type: "specialToken",
        value: t,
      });
    } else {
      output.push({
        type: "identifierToken",
        value: t,
      });
    }
  });
  output.push({
    type: "endOfFileToken",
    value: "",
  });
  return output;
}

/* 
var fn = {
  parameters { name }
  print {
    "Hello, " name
  }
}
*/

const parse = (() => {
  let tokens;
  function parseStmt() {
    return parseExpr();
  }
  function parseExpr() {
    return parseParametersExpr();
  }
  function parseParametersExpr() {
    if (tokens[0].type === "parametersToken") {
      tokens.shift();
      return {
        type: "parameterExpr",
        parameters: parseExpr().value.map((o) => {
          return o.value;
        }),
      };
    }
    return parseSwitchExpr();
  }
  function parseSwitchExpr() {
    if (tokens[0].type === "switchToken") {
      tokens.shift();
      let blocks = [parseExpr(), parseExpr(), parseExpr()];
      let cases = [];
      for (let i = 0; i < blocks[1].value.length; i += 2) {
        cases.push({
          test: blocks[1].value[i],
          consequent: blocks[1].value[i + 1],
        });
      }
      return {
        type: "switchExpr",
        discriminant: blocks[0],
        cases: cases,
        default: blocks[2],
      };
    }
    return parseReturnExpr();
  }
  function parseReturnExpr() {
    let value = parseFunctionCallExpr();
    if (
      value.type === "return" &&
      tokens[0].type === "braceToken" &&
      tokens[0].value === "open"
    ) {
      return {
        type: "returnExpr",
        block: parseExpr(),
      };
    }
    return value;
  }
  function parseFunctionCallExpr() {
    let value = parseAdditiveExpr();
    if (
      value.type === "identifier" &&
      tokens[0].type === "braceToken" &&
      tokens[0].value === "open"
    ) {
      return {
        type: "functionCallExpr",
        name: value.value,
        block: parseExpr(),
      };
    }
    return value;
  }
  function parseAdditiveExpr() {
    let left = parseMultiplicativeExpr();
    while (tokens[0].value === "+" || tokens[0].value === "-") {
      const operator = tokens.shift().value;
      const right = parseMultiplicativeExpr();

      left = {
        type: "binaryExpr",
        operator: operator,
        left: left,
        right: right,
      };
    }

    return left;
  }
  function parseMultiplicativeExpr() {
    let left = parsePrimaryExpr();
    while (tokens[0].value === "*" || tokens[0].value === "/") {
      const operator = tokens.shift().value;
      const right = parsePrimaryExpr();

      left = {
        type: "binaryExpr",
        operator: operator,
        left: left,
        right: right,
      };
    }

    return left;
  }
  function parsePrimaryExpr() {
    let tk = tokens[0].type;
    switch (tk) {
      case "returnToken":
        tokens.shift();
        return {
          type: "returnStmt",
          value: "return",
        };
      case "breakToken":
        tokens.shift();
        return {
          type: "breakStmt",
          value: "break",
        };
      case "identifierToken":
        if (tokens[1].type === "equalsToken") {
          let variable = tokens.shift().value;
          tokens.shift();
          let value = parseExpr();
          return {
            type: "variableAssignment",
            name: variable,
            value: value,
          };
        }
        return {
          type: "identifier",
          value: tokens.shift().value,
        };
      case "numberToken":
        return {
          type: "numericLiteral",
          value: parseFloat(tokens.shift().value),
        };
      case "stringToken":
        return {
          type: "stringLiteral",
          value: tokens.shift().value,
        };
      case "bracketToken":
        if (tokens[0].value === "open") {
          tokens.shift();
          const value = parseExpr();
          tokens.shift();
          return value;
        }
        break;
      case "braceToken":
        if (tokens[0].value === "open") {
          let stmt = {
            type: "blockStmt",
            value: [],
          };
          let safetyLimit = 0;
          tokens.shift();
          blockStmtRepeat: while (safetyLimit < 4096 && tokens[0] != null) {
            if (
              tokens[0].type === "braceToken" &&
              tokens[0].value === "close"
            ) {
              break blockStmtRepeat;
            }
            stmt.value.push(parseExpr());
            safetyLimit++;
          }
          if (safetyLimit >= 4096) {
            alert(
              "ParsingError: Block statement too large or closing brace missing"
            );
          }
          tokens.shift();
          return stmt;
        }
        break;
      case "variableDeclarationToken":
        tokens.shift();
        let variable = tokens[0].value;
        tokens.shift();
        tokens.shift();
        let value = parseExpr();
        if (value.type === "blockStmt") {
          let stmt = {
            type: "functionDeclaration",
            name: variable,
            statements: [],
            parameters: [],
          };
          value.value.forEach((subStmt) => {
            if (subStmt.type === "parameterExpr") {
              stmt.parameters = subStmt.parameters;
            } else {
              stmt.statements.push(subStmt);
            }
          });
          return stmt;
        }
        return {
          type: "variableDeclaration",
          name: variable,
          value: value,
        };
        break;
      default:
        alert("ParsingError: Unknown token type " + tk);
        tokens.shift();
        return {};
    }
  }
  return (tks) => {
    try {
      tokens = tks;

      let program = {
        type: "program",
        statements: [],
      };

      while (tokens[0].type !== "endOfFileToken") {
        program.statements.push(parseStmt());
      }

      return program;
    } catch (e) {
      alert(e);
    }
  };
})();

const interpreter = (() => {
  let variables = {};
  function evalExpr(expr) {
    switch (expr.type) {
      case "identifier":
        {
          let output = variables[expr.value];
          return evalExpr(output);
        }
        break;
      case "functionCallExpr":
        {
          let output = evalStmt(expr);
          return output;
        }
        break;
      case "binaryExpr":
        {
          let left = evalExpr(expr.left);
          let right = evalExpr(expr.right);
          switch (expr.operator) {
            case "+": {
              return {
                type: "number",
                value: left.value + right.value,
              };
            }
            case "-": {
              return {
                type: "number",
                value: left.value - right.value,
              };
            }
            case "*": {
              return {
                type: "number",
                value: left.value * right.value,
              };
            }
            case "/": {
              return {
                type: "number",
                value: left.value / right.value,
              };
            }
          }
        }
        break;
      case "numericLiteral":
        {
          return {
            type: "number",
            value: expr.value,
          };
        }
        break;
      case "stringLiteral":
        {
          return {
            type: "string",
            value: expr.value,
          };
        }
        break;
    }
  }
  let lastOutput;
  function evalStmt(stmt) {
    switch (stmt.type) {
      case "switchExpr":
        {
          let discriminant = stmt.discriminant;
          let cases = stmt.cases;
          let defaultCase = stmt.default;
          for (let i = 0; i < cases.length; i++) {
            let currentCase = cases[i];
            alert(evalExpr(currentCase));
            if (
              evalExpr(currentCase.test.value[0]) === evalExpr(discriminant)
            ) {
              evalStmt(currentCase.consequent);
            }
          }
        }
        break;
      case "functionCallExpr":
        {
          switch (stmt.name) {
            case "print":
              {
                let values = stmt.block.value;
                let output = "";
                values.forEach((value) => {
                  let res = evalExpr(value);
                  switch (res.type) {
                    case "number":
                      {
                        output += res.value;
                      }
                      break;
                    case "string":
                      {
                        output += res.value.slice(1, -1);
                      }
                      break;
                  }
                });
                alert(output);
                lastOutput = {
                  type: "string",
                  value: output,
                };
              }
              break;
          }
        }
        break;
      case "variableDeclaration":
        {
          variables[stmt.name] = stmt.value;
          let res = evalExpr(stmt.value);
          switch (res.type) {
            case "number":
              {
                lastOutput = res.value;
              }
              break;
            case "string":
              {
                lastOutput = res.value.slice(1, -1);
              }
              break;
          } // ?
        }
        break;
      case "variableAssignment":
        {
          if (variables[stmt.name] == null) {
            alert(
              "InterpreterError: The name " +
                stmt.name +
                " does not exist in the current scope"
            );
            return {};
          }
          variables[stmt.name] = stmt.value;
          let res = evalExpr(stmt.value);
          switch (res.type) {
            case "number":
              {
                lastOutput = res.value;
              }
              break;
            case "string":
              {
                lastOutput = res.value.slice(1, -1);
              }
              break;
          }
        }
        break;
    }
    return lastOutput;
  }
  return (ast) => {
    variables = [];
    if (ast.type !== "program") {
      alert("InterpreterError: Unexpected AST node type " + ast.type);
      return;
    }
    if (!Array.isArray(ast.statements)) {
      alert(
        "InterpreterError: Unexpected AST statements list type " +
          typeof ast.statements
      );
      return;
    }
    lastOutput = "";
    ast.statements.forEach(evalStmt);
    return lastOutput;
  };
})();
