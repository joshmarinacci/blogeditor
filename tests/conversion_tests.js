/**
 * Created by josh on 7/18/16.
 */
var exporter = require('../exporter');
var assert = require('assert');

function testJoshToDraft() {
    var josh = {
        type: 'root',
        content: [
            {
                type: 'block',
                style: 'body',
                content: [
                    {
                        type: 'text',
                        text: 'some cool text'
                    }
                ]
            }
        ]
    };
    console.log("josh is", josh);
    var draft = exporter.JoshRawToDraftRaw(josh);
    console.log("draft is", draft);
    var josh2 = exporter.DraftRawToJoshRaw(draft);
    console.log("josh2 is", josh2);
    assert.deepEqual(josh2, josh, 'basic conversion failed');
}

function testStyledBlock() {
    var jroot = {
        "type": "root",
        "content": [{
            "type": "block",
            "style": "body",
            "content": [
                {
                    "type": "text",
                    "text": ""
                },
                {
                "type": "span",
                "style": "emphasis",
                "meta": {},
                "content": [{"type": "text", "text": "new document stuff"}]
            }]
        }]
    };

    var droot = {
        "entityMap": {},
        "blocks": [{
            "key": "21iob",
            "text": "new document stuff",
            "type": "unstyled",
            "depth": 0,
            "inlineStyleRanges": [{"offset": 0, "length": 18, "style": "EMPHASIS"}],
            "entityRanges": []
        }]
    };
    var jroot2 = exporter.DraftRawToJoshRaw(droot);
    console.log("result is",JSON.stringify(jroot2,null,'  '));
    assert.equal(jroot2.content[0].content.length,1,"content of block too long");
}

//testJoshToDraft();
testStyledBlock();