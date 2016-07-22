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
                        type:'span',
                        style:'plain',
                        meta:{},
                        content:[
                            {
                                type: 'text',
                                text: 'some cool text'
                            }
                        ]
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
    console.log(JSON.stringify(josh2));
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
    console.log("result is", JSON.stringify(jroot2, null, '  '));
    assert.equal(jroot2.content[0].content.length, 1, "content of block too long");
}

function testOverlappingStyles() {
    //currently jraw gets confused and duplicates content
    var droot = {
        "entityMap": {},
        "blocks": [{
            "key": "2hjbc",
            "text": "foo bar baz",
            "type": "unstyled",
            "depth": 0,
            "inlineStyleRanges": [
                {"offset": 4, "length": 7, "style": "STRONG"},
                {"offset": 8, "length": 3, "style": "EMPHASIS"}],
            "entityRanges": []
        }]
    };
    var jroot = {
        "type": "root",
        "content": [{
            "type": "block",
            "style": "body",
            "content": [
                {"type": "text", "text": "foo "},
                {
                    "type": "span", "style": "strong", "meta": {},
                    "content": [{"type": "text", "text": "baz"}]
                }, {"type": "text", "text": "bar "},
                {
                    "type": "span", "style": "emphasis", "meta": {},
                    "content": [{"type": "text", "text": "baz"}]
                }]
        }]
    };
}

function testOverlappingStyles2() {

    var droot = {
        "entityMap": {},
        "blocks": [{
            "key": "5k69q",
            "text": "foo bar baz",
            "type": "unstyled",
            "depth": 0,
            "inlineStyleRanges": [
                {"offset": 0, "length": 11, "style": "STRONG"},
                {"offset": 4, "length": 3, "style": "EMPHASIS"}],
            "entityRanges": []
        }]
    };

    var jroot = {
        "type": "root",
        "content": [
            {
                "type": "block",
                "style": "body",
                "content": [
                    {
                        type: 'span',
                        style: 'plain',
                        meta: {},
                        content: [
                            {
                                type:'text',
                                text:''
                            },
                            {
                                "type": "span",
                                "style": "strong",
                                "meta": {},
                                "content": [
                                    {
                                        "type": "text",
                                        "text": "foo "
                                    },
                                    {
                                        "type": "span",
                                        "style": "emphasis",
                                        meta:{},
                                        content: [
                                            {
                                                "type": "text",
                                                "text": "bar"
                                            }
                                        ]
                                    },
                                    {
                                        "type": "text",
                                        "text": " baz"
                                    },
                                ]
                            },
                        ]
                    },
                ]
            }
        ]
    };

    var jroot2 = exporter.DraftRawToJoshRaw(droot);
    console.log(JSON.stringify(jroot2, null, '   '));
    assert.deepEqual(jroot2, jroot, 'overlapping styles are broken');
}


testJoshToDraft();
testStyledBlock();
//testOverlappingStyles();
testOverlappingStyles2();