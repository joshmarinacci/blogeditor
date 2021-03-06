"use strict"

/**
 * Created by josh on 6/24/16.
 */

var j2d_style_map = {
    'strong':'STRONG',
    'emphasis':'EMPHASIS',
    'inline-code':'code-inline',
    'subheader':'header-two',
    'block-code':'code-block',
    'italic':'EMPHASIS',
//    'list-item':'ordered-list-item',
    'list-item':'unordered-list-item'
};

var d2j_style_map = {
    'STRONG':'strong',
    'BOLD':'strong',
    'EMPHASIS':'emphasis',
    'ITALIC':'emphasis',
    'code-inline':'inline-code'
};

var d2j_entity_map = {
    'LINK':'link'
};
var d2j_block_map = {
    'header-two':'subheader',
    'code-block':'block-code',
    'unordered-list-item':'list-item'
};

function styleChange(block,index) {
    for(var i=0; i<block.entityRanges.length; i++) {
        var r = block.entityRanges[i];
        if(r.offset == index) {
            return {
                found:true,
                range:r,
                start:true
            }
        }
        if(r.offset + r.length == index) {
            return {
                found:true,
                range:r,
                start:false
            }
        }
    }
    for(var i=0; i<block.inlineStyleRanges.length; i++) {
        var r = block.inlineStyleRanges[i];
        if(r.offset == index) {
            return {
                found:true,
                range:r,
                start:true
            }
        }
        if(r.offset + r.length == index) {
            return {
                found:true,
                range:r,
                start:false
            }
        }
    }

    return {
        found:false
    }
}

var exporter = {
    JoshRawToDraftRaw: function(raw) {
        var entityMap = {};
        var blocks = [];
        raw.content.forEach((chunk)=>{
            var img = null;
            var ic = function(imgtoadd,blk) {
                img = imgtoadd;
            };
            if(chunk.type == 'block' && chunk.style == 'unordered-list') {
                j2d_style_map['list-item'] = 'unordered-list-item';
                chunk.content.forEach((subchunk) => {
                    blocks.push(exporter.flatten(subchunk,0,entityMap,ic));
                });
                return;
            }
            if(chunk.type == 'block' && chunk.style == 'ordered-list') {
                j2d_style_map['list-item'] = 'ordered-list-item';
                chunk.content.forEach((subchunk) => {
                    blocks.push(exporter.flatten(subchunk,0,entityMap,ic));
                });
                return;
            }
            var retval = exporter.flatten(chunk,0,entityMap, ic);
            if(img !== null) {
                var src = img;
                if(src.indexOf("http://localhost/")==0) {
                    src = src.replace("http://localhost/","http://joshondesign.com/");
                }

                var key = Math.random()+"";
                entityMap[key] = {
                    type:'image',
                    mutability:'IMMUTABLE',
                    data: {src:src}
                };
                blocks.push({
                    type:'atomic',
                    inlineStyleRanges:[],
                    entityRanges:[{offset:0, length: 1, key:key}],
                    text:" "
                });
                return;
            }
            blocks.push(retval);
        });
        return {
            blocks:blocks,
            entityMap:entityMap
        }

    },
    flatten : function(node,start,entityMap,ic) {
        //console.log("flattening " +  node.type + " " + start);
        if(node.type == 'block') return exporter.j2d_block(node,start,entityMap,ic);
        if(node.type == 'span')  return exporter.j2d_span(node,start,entityMap,ic);
        if(node.type == 'text')  return exporter.j2d_text(node,start,ic);
        console.log("SHOULDNT BE HERE")
    },
    j2d_text: function(node,start, entityMap) {
        return {
            text: node.text,
            end: start + node.text.length,
            length: node.text.length
        };
    },
    j2d_span: function(node,start,entityMap,ic) {
        var span = {
            inlineStyleRanges :[],
            entityRanges : [],
            text:""
        };

        var realstart = start;
        node.content.forEach((ch) => {
            var res = exporter.flatten(ch,start,entityMap,ic);
            start = res.end;
            if(res.inlineStyleRanges) span.inlineStyleRanges = span.inlineStyleRanges.concat(res.inlineStyleRanges);
            if(res.entityRanges) span.entityRanges = span.entityRanges.concat(res.entityRanges)
            span.text += res.text;
        });
        if(node.style == 'image') {
            ic(node.meta.src);
        }
        if(node.style == 'link') {
            var key = Math.random()+"";
            var href = "";
            if(node.meta && node.meta.href) {
                href = node.meta.href;
            } else {
                console.log("WARNING. Link node without a meta or href");
            }
            entityMap[key] = {
                data: {url:href},
                mutability:'MUTABLE',
                type:'LINK'
            };
            var range = {
                offset:realstart,
                length:start-realstart,
                key:key
            };
            span.entityRanges.push(range);
        }
        if(j2d_style_map[node.style]) {
            var range = {
                offset:realstart,
                length:start-realstart,
                style: j2d_style_map[node.style]
            };
            span.inlineStyleRanges.push(range);
        }
        span.end = start;
        return span;
    },
    j2d_block: function(node,start, entityMap,ic) {
        var block = {
            type:'unstyled',
            inlineStyleRanges:[],
            entityRanges:[],
            text:""
        };
        //var children = [];
        node.content.forEach((ch) => {
            var res = exporter.flatten(ch,start,entityMap,ic);
            start = res.end;
            //console.log("block rs = ",start,res);
            if(res.inlineStyleRanges) {
                block.inlineStyleRanges = block.inlineStyleRanges.concat(res.inlineStyleRanges)
            }
            if(res.entityRanges) {
                block.entityRanges = block.entityRanges.concat(res.entityRanges)
            }
            block.text += res.text;
        });
        if(j2d_style_map[node.style]) block.type = j2d_style_map[node.style];
        return block;
    },


    d2j_block: function(bin, entityMap) {
        //create a basic block
        var bout = {
            type:'block',
            style:'body',
            content:[]
        };
        //if the block type matches a known Josh  style, use it
        if(d2j_block_map[bin.type]) bout.style = d2j_block_map[bin.type];
        //if atomic block, turn into image and return early
        if(bin.type == 'atomic') {
            let image_entity = entityMap[bin.entityRanges[0].key];
            console.log("saving with image src = ", image_entity.data.src);
            return {
                type:'block',
                style:'body',
                content:[{
                    type:'span',
                    style:'image',
                    content:[],
                    meta: {src: image_entity.data.src }
                }]
            };
        }

        //make a chunk
        var chunk = {
            type:'text',
            text:""
        };


        return processStyledBlock(bin, entityMap);
    },
    DraftRawToJoshRaw: function(blob) {
        var blocks = blob.blocks.map((block) => exporter.d2j_block(block,blob.entityMap));
        var bkx = {
            type:'root',
            content:blocks
        }
        return bkx;
    }
};

function processStyledBlock(bin, entityMap) {
    var block = {
        type:'block',
        style:'body',
        content:[]
    };
    var chunk = {
        type:'text',
        text:''
    };
    var span = {
        type:'span',
        style:'plain',
        meta:{},
        content:[]
    };
    block.content.push(span);
    span.content.push(chunk);

    var stack = [];
    stack.peek = function() {
        return this[this.length-1];
    };
    stack.push(span);
    for(var i=0; i<bin.text.length; i++) {
        var ch = bin.text[i];
        var r = styleChange(bin,i);
        //if a style change
        if(r.found) {
            if(r.start) {
                var sp2 = { type:'span', style:'plain', meta:{}, content:[]};
                if(typeof r.range.style !== 'undefined') {
                    if(d2j_style_map[r.range.style]) sp2.style = d2j_style_map[r.range.style];
                }
                if(typeof r.range.key !== 'undefined') {
                    var ent = entityMap[r.range.key];
                    if(d2j_entity_map[ent.type]) {
                        sp2.style = d2j_entity_map[ent.type];
                        sp2.meta.href = ent.data.url;
                    }
                }
                var spp = stack.peek();
                spp.content.push(sp2);
                stack.push(sp2);
                chunk = makeChunk();
                sp2.content.push(chunk);
                chunk.text += ch;
            } else {
                var sp2 = stack.pop();
                chunk = makeChunk();
                stack.peek().content.push(chunk);
                chunk.text += ch;
            }
        } else {
            chunk.text += ch;
        }
    }
    /*
    make an initial chunk, put into the block
    for each letter index in the block
        find the style changes at this index
        if start a new style
            add a span to the block
            make a new chunk in the span
        add text to current chunk

     */
    if(d2j_block_map[bin.type]) block.style = d2j_block_map[bin.type];
    return block;
}

function makeChunk() {
    return { type:'text', text:''};
}

console.log("inside the exporter");



if(typeof module !== 'undefined') {
    module.exports = exporter;
}