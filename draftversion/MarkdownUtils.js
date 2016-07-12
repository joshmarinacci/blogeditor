/**
 * Created by josh on 7/12/16.
 */

var MarkdownUtils = {
    parseToJoshRaw: function(input) {
        var gram = ohm.grammarFromScriptElement();//('draftversion/markdown.ohm');
        console.log("gram = ", gram);
        var sem = gram.semantics().addOperation('parse', {
            //doc: function(paras) {
            //    return "<div>\n"+paras.parse().join("\n")+"\n</div>";
            //},
            para: function(text, end) {
                return {
                    type:'block',
                    content:text.parse()
                };
            },
            plainrun: function(text) {
                return { type:'text', text:text.parse().join("")}
            },
            strong: function(_1,text,_2) {
                return {
                    type:'span',
                    style:'italic',
                    content: [
                        { type: 'text', text: text.parse().join("")}
                    ]
                }
            },
            _terminal: function() {
                return this.interval.contents.toString();
            }
        });
        var sem2 = gram.semantics().addOperation('toHTML', {
            doc: function(paras) {
                return "<div>\n"+paras.toHTML().join("\n")+"\n</div>";
            },
            para: function(text, end) {
                return "<p>"+text.toHTML().join("")+"</p>";
            },
            plainrun: function(text) {
                return text.toHTML().join("");
            },
            strong: function(_1, text, _3) {
                return "<strong>"+text.toHTML().join("")+"</strong>";
            },
            _terminal: function() {
                return this.interval.contents.toString();
            }
        });


        var end = input.slice(-2);
        if(end != "\n\n") {
            if(input.slice(-1) == "\n") {
                input += "\n";
            }else {
                input += "\n\n";
            }
        }
        var match = gram.match(input);
        if (match.failed()) return console.log("input failed to match " + input + match.message);
        var result = sem(match).parse();
        console.log("result is", JSON.stringify(result,null,'  '));
        var result2 = sem2(match).toHTML();
        console.log("HTML is", result2);
        return {
            type:'root',
            content: result
        }
    }
};
