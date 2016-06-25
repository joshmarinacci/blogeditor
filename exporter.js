/**
 * Created by josh on 6/24/16.
 */

var j2d_style_map = {
    'strong':'STRONG',
    'emphasis':'EMPHASIS',
    'inline-code':'code-inline',
    'subheader':'header-two',
    'block-code':'code-block'
};

var d2j_style_map = {
    'STRONG':'strong',
    'BOLD':'strong',
    'EMPHASIS':'emphasis',
    'code-inline':'inline-code'
};

var d2j_entity_map = {
    'LINK':'link'
};
var d2j_block_map = {
    'header-two':'subheader',
    'code-block':'block-code'
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
        var blocks = raw.content.map((chunk)=>{
            return exporter.flatten(chunk,0,entityMap);
        });
        return {
            blocks:blocks,
            entityMap:entityMap
        }

    },
    flatten : function(node,start,entityMap) {
        //console.log("flattening " +  node.type + " " + start);
        if(node.type == 'block') return exporter.j2d_block(node,start,entityMap);
        if(node.type == 'span')  return exporter.j2d_span(node,start,entityMap);
        if(node.type == 'text')  return exporter.j2d_text(node,start);
        console.log("SHOULDNT BE HERE")
    },
    j2d_text: function(node,start, entityMap) {
        return {
            text: node.text,
            end: start + node.text.length,
            length: node.text.length
        };
    },
    j2d_span: function(node,start,entityMap) {
        var span = {
            inlineStyleRanges :[],
            entityRanges : [],
            text:""
        };

        var realstart = start;
        node.content.forEach((ch) => {
            var res = exporter.flatten(ch,start,entityMap);
            start = res.end;
            if(res.inlineStyleRanges) span.inlineStyleRanges = span.inlineStyleRanges.concat(res.inlineStyleRanges);
            if(res.entityRanges) span.entityRanges = span.entityRanges.concat(res.entityRanges)
            span.text += res.text;
        });
        if(node.style == 'link') {
            var key = Math.random()+"";
            entityMap[key] = {
                data: {url:node.meta.href},
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
    j2d_block: function(node,start, entityMap) {
        var block = {
            type:'unstyled',
            inlineStyleRanges:[],
            entityRanges:[],
            text:""
        };
        //var children = [];
        node.content.forEach((ch) => {
            var res = exporter.flatten(ch,start,entityMap);
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
        var bout = {
            type:'block',
            style:'unstyled',
            content:[]
        };
        if(d2j_block_map[bin.type]) bout.style = d2j_block_map[bin.type];
        var chunk = {
            type:'text',
            text:""
        };

        var stack = [];
        for(var i=0; i<bin.text.length; i++) {
            var ch = bin.text[i];
            var r = styleChange(bin,i);
            if(r.found) {
                if(r.start) {
                    bout.content.push(chunk);
                    var span = {
                        type:'span',
                        style:'plain',
                        meta:{},
                        content:[]
                    };
                    if(typeof r.range.style !== 'undefined') {
                        if(d2j_style_map[r.range.style]) span.style = d2j_style_map[r.range.style];
                    }
                    if(typeof r.range.key !== 'undefined') {
                        var ent = entityMap[r.range.key];
                        console.log("ent = ",ent);
                        if(d2j_entity_map[ent.type]) {
                            span.style = d2j_entity_map[ent.type];
                            span.meta.href = ent.data.url;
                        }
                    }
                    bout.content.push(span);
                    stack.push(span);
                    chunk = {
                        type:'text',
                        text:ch
                    }
                } else {
                    var span = stack.pop();
                    span.content.push(chunk);
                    chunk = {
                        type:'text',
                        text:ch
                    }
                }
            } else {
                chunk.text += ch;
            }
        }

        bout.content.push(chunk);
        return bout;
    },
    DraftRawToJoshRaw: function(blob) {

        console.log("doing an export");
        console.log("blob = ",blob);
        var blocks = blob.blocks.map((block) => exporter.d2j_block(block,blob.entityMap));
        console.log("out = " + JSON.stringify({content:blocks},null,'  '));
        var bkx = {
            type:'root',
            content:blocks
        }
        return bkx;
    }
};


console.log("inside the exporter");


