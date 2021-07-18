"use strict";

class Node {
  constructor() {
    this.INDENTATION = 2;
  }

  indent(indent) {
    return " ".repeat(this.INDENTATION * indent);
  }
}

class Text extends Node {
  constructor(content) {
    super();
    this.content = this._stripCommonIndentation(content);
  }

  _stripCommonIndentation(content) {
    var count = 0;
    var firstChar = true;
    for (const char of content) {
      if (firstChar && char == "\n") {continue}
      if (char == " ") {count += 1}
      else if (char == "\t") {count += this.INDENTATION}
      else {break}
      firstChar = false;
    }
    return content.split("\n").filter(line => line.trim()).map(line => line.slice(count)).join("\n");
  }

  render(indent=0) {
    return this.content.split("\n").map(line => this.indent(indent) + line).join("\n");
  }
}

class Cdata extends Node {
  constructor(child) {
    super();
    this.child = child;
  }

  render(indent=0) {
    var out = [];
    out.push(`${this.indent(indent)}<![CDATA[\n`);
    out.push(this.child.render(indent + 1));
    out.push(`\n${this.indent(indent)}]]>`);
    return out.join("");
  }
}

class Xml extends Node {
  constructor(tagName, attributes={}, children=[]) {
    super();
    this.tagName = tagName;
    this.attributes = attributes;
    this.children = children;
  }

  render(indent=0) {
    var attributesString = Object.keys(this.attributes).map(key => `${key}="${this.attributes[key]}"`).join(" ")
    var numChildren = this.children.length;
    var out = [];

    out.push(`${this.indent(indent)}<${this.tagName}${attributesString? " " + attributesString: ""}`);
    if (this.children.length != 0) {
      out.push(">");
      out.push("\n");
      for (const child of this.children) {
        if (child instanceof Array) {
          child.forEach(c => out.push(`${c.render(indent + 1)}\n`));
        } else if (child.render) {
          out.push(`${child.render(indent + 1)}\n`);
        }
      }
      out.push(this.indent(indent));
      out.push(`</${this.tagName}>`);
    }
    else {
      out.push(` />`);
    }

    return out.join("");
  }
}

if (require.main === module) {
  console.log(
    new Xml("svg", {"version": "1.1", "xmlns": "http://www.w3.org/2000/svg", "width": 104, "height": 104}, [
      new Xml("defs", {}, [
        new Xml("style", {"type": "text/css"}, [
          new Cdata(
            new Text(`
              rect {
                opacity: 0.8;
                fill: #6094CC;
                stroke-width: 1;
                stroke: #222222;
              }

              rect.port {
                opacity: 1;
                fill: #326CB2;
              }
            `)
          )
        ])
      ]),
      new Xml("g", {"transform": "translate(0,0)"}, [
        new Xml("polyline", {"points": "42,27 62,27", "id": "e1", "class": "edge"}),
        new Xml("polyline", {"points": "42,37 52,37 52,77 62,77", "id": "e2", "class": "edge"}),
        new Xml("rect", {"id": "n1", "class": "node", "x": "12", "y": "17", "width": "30", "height": "30"}),
        new Xml("rect", {"id": "n2", "class": "node", "x": "62", "y": "12", "width": "30", "height": "30"}),
        new Xml("rect", {"id": "n3", "class": "node", "x": "62", "y": "62", "width": "30", "height": "30"}),
      ])
    ]).render()
  )
}

exports = module.exports = {
  Xml,
  Text,
  Cdata
};
