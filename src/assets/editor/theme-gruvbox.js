ace.define("ace/theme/gruvbox.css",["require","exports","module"], function(require, exports, module){module.exports = `
.ace-gruvbox 
.ace_gutter-active-line {
  background-color: #3C3836;
}

.ace-gruvbox {
  color: #EBDAB4;
  background-color: #1D2021;
}

.ace-gruvbox .ace_invisible {
  color: #504945;
}

.ace-gruvbox 
.ace_marker-layer 
.ace_selection {
  background: rgba(179, 101, 57, 0.75)
}

.ace-gruvbox.ace_multiselect .ace_selection.ace_start {
  box-shadow: 0 0 3px 0px #002240;
}

.ace-gruvbox .ace_keyword {
  color: #8ec07c;
}

.ace-gruvbox .ace_comment {
  font-style: italic;
  color: #928375;
}

.ace-gruvbox .ace-statement {
  color: red;
}

.ace-gruvbox 
.ace_variable {
  color: #84A598;
}

.ace-gruvbox 
.ace_variable.ace_language {
  color: #D2879B;
}

.ace-gruvbox .ace_constant {
  color: #C2859A;
}
.ace-gruvbox 
.ace_constant.ace_language {
  color: #C2859A;
}

.ace-gruvbox .ace_constant.ace_numeric {
  color: #C2859A;
}

.ace-gruvbox 
.ace_string {
  color: #B8BA37;
}

.ace-gruvbox 
.ace_support {
  color: #F9BC41;
}

.ace-gruvbox 
.ace_support.ace_function {
  color: #F84B3C;
}

.ace-gruvbox 
.ace_storage {
  color: #8FBF7F;
}

.ace-gruvbox .ace_keyword.ace_operator {
  color: #EBDAB4;
}

.ace-gruvbox 
.ace_punctuation.ace_operator {
  color: yellow;
}

.ace-gruvbox .ace_marker-layer 
.ace_active-line {
  background: #3C3836;
}

.ace-gruvbox .ace_marker-layer
.ace_error-line {
  background: #ab1616; position: absolute; z-index: 2;
}

.ace-gruvbox .ace_marker-layer
.ace_highlight-line{
  background: #525924; position: absolute; z-index: 2;
}

.ace-gruvbox .ace_marker-layer
.ace_breakpoint-line {
  background: #004f70; position: absolute; z-index: 2;
}

.ace-gruvbox .ace_marker-layer
.ace_selected-word {
  border-radius: 4px;
  border: 8px solid #3f475d;
}

.ace-gruvbox 
.ace_print-margin {
  width: 5px;
  background: #3C3836;
}

.ace-gruvbox .ace_indent-guide {
  background: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWNQUFD4z6Crq/sfAAuYAuYl+7lfAAAAAElFTkSuQmCC\") right repeat-y;
}

.ace-gruvbox 
.ace_indent-guide-active {
  background: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAAZSURBVHjaYvj///9/hivKyv8BAAAA//8DACLqBhbvk+/eAAAAAElFTkSuQmCC\") right repeat-y;}



.ace_gutter-cell.ace_breakpoint::before{
  content: "🔴";
  position: absolute;
  left: 5%;
}
`;

});

ace.define("ace/theme/gruvbox",["require","exports","module","ace/theme/gruvbox.css","ace/lib/dom"], function(require, exports, module){exports.isDark = true;
exports.cssClass = "ace-gruvbox";
exports.cssText = require("./gruvbox.css");
var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass, false);

});                (function() {
                    ace.require(["ace/theme/gruvbox"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            