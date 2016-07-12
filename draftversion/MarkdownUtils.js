/**
 * Created by josh on 7/12/16.
 */

var MarkdownUtils = {
    parseToJoshRaw: function(input, cb) {
        //var gram = ohm.grammarFromScriptElement();//('draftversion/markdown.ohm');
        utils.getTextRelative("draftversion/markdown.ohm", (text) => {
            var gram = ohm.grammar(text);
            var sem = this.makeParseSemantics(gram);
            var end = input.slice(-2);
            if (end != "\n\n") {
                if (input.slice(-1) == "\n") {
                    input += "\n";
                } else {
                    input += "\n\n";
                }
            }
            var match = gram.match(input);
            if (match.failed()) return console.log("input failed to match " + input + match.message);
            var result = sem(match).parse();
            cb({
                type: 'root',
                content: result
            });
        });
    },
    makeParseSemantics: function(gram) {
        var sem = gram.semantics().addOperation('parse', {
            para: function(text, end, end2) {
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
            image: function(_1, _2, text, _4, _5, url, _7) {
                //console.log("got some text:'",text.parse(),"' url = ", url.parse());
                return {
                    type:'span',
                    style:'image',
                    content:[],
                    meta:{
                        alt:text.parse(),
                        src:url.parse()
                    }
                }
            },
            link: function(_1, text, _3, _4, url, _6) {
                return {
                    type:'span',
                    style:'link',
                    content:[{
                        type:'text',
                        text:text.parse()
                    }],
                    meta: {
                        href:url.parse()
                    }
                }
            },
            url: function(text) {
                return text.parse().join("")
            },
            desc: function(text) {
                return text.parse().join("")
            },
            _terminal: function() {
                return this.interval.contents.toString();
            }
        });
        return sem;
    }
};


if(typeof module !== 'undefined') module.exports = MarkdownUtils;