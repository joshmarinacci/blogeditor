/**
 * Created by josh on 7/12/16.
 */

var fs = require('fs');
var ohm = require('ohm-js');
var assert = require('assert');

var gram = ohm.grammar(fs.readFileSync('draftversion/markdown.ohm').toString());
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
    image: function(_1, _2, text, _4, _5, url, _7) {
        return "<img src='"+url.toHTML()+"' alt='"+text.toHTML()+"'/>";
    },
    link: function(_1, text, _3, _4, url, _6) {
        return "<a href='"+url.toHTML()+"'>"+text.toHTML()+"</a>";
    },
    url: function(text) {
        return text.toHTML().join("")
    },
    desc: function(text) {
        return text.toHTML().join("")
    },
    _terminal: function() {
        return this.interval.contents.toString();
    }
});

//var test1 = fs.readFileSync("draftversion/tests/test1.md").toString();
var test2 = fs.readFileSync("draftversion/tests/test2.md").toString();

function test(input) {
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
    var result = sem2(match).toHTML();
    console.log("HTML is", result);
}

//test('p1\n\n');
//test('p1\np1\n\n');
//test('p1\np1\n\np2\n\n');
//test('p1\np1\n\np2\np2\n\n');

//bold
//test('*strong*\n\n');
//test('some *strong* text\n\n');
//test('some *strong* text\n\n and now some more text\n\n');
//console.log("test2 = -"+ test2+'-');

//block level image
test("![text](myimage.png)\n\n");

//inline url
test('link [here](http://website.tld)\n\n');



//test(test2);

