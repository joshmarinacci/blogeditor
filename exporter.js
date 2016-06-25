/**
 * Created by josh on 6/24/16.
 */


var exporter = {
    JoshRawToDraftRaw: function(raw) {
        //console.log("Raw = ",raw);
        var start = 0;
        var blocks = [];
        var entityMap = {};
        for(var i=0; i<raw.content.length; i++) {
            var chunk = raw.content[i];
            var blk = flatten(chunk,start,entityMap);
            //console.log("blk = ",blk);
            blocks.push(blk);
        }
        return {
            blocks:blocks,
            entityMap:entityMap
        }

    },

    DraftRawToJoshRaw: function(blob) {
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

        console.log("doing an export");
        console.log("blob = ",blob);
        var blocks = blob.blocks.map((block)=>{
            var txt = block.text;
            var chunks = [];
            var last = 0;
            var cstyle = {};
            var chunk = {
                type:'text',
                text:"",
            };

            var stack = [];
            for(var i=0; i<block.text.length; i++) {
                var ch = block.text[i];
                //console.log('ch = ', ch);

                var r = styleChange(block,i);
                if(r.found) {
                    if(r.start) {
                        console.log("doing start", r.range);
                        chunks.push(chunk);
                        var span = {
                            type:'span',
                            style:'plain',
                            meta:{},
                            content:[]
                        };
                        if(typeof r.range.style !== 'undefined') {
                            console.log("doing a style change");
                            if(r.range.style == 'STRONG') {
                                span.style = 'strong';
                            }
                            if(r.range.style == 'EMPHASIS') {
                                span.style = 'emphasis';
                            }
                        }
                        if(typeof r.range.key !== 'undefined') {
                            console.log("it's a real entity");
                            var ent = blob.entityMap[r.range.key];
                            console.log("ent = ",ent);
                            if(ent.type == 'LINK') {
                                span.style = 'link';
                                span.meta.href = ent.data.url;
                            }
                        }
                        chunks.push(span);
                        stack.push(span);
                        chunk = {
                            type:'text',
                            text:ch
                        }
                    } else {
                        console.log("doing end", r.range);
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

            chunks.push(chunk);
            var blkout = {
                type:'block',
                style:'body',
                content: chunks
            };
            if(block.type == 'header-two') {
                blkout.style = 'subheader';
            }
            return blkout;
        });
        console.log("out = " + JSON.stringify({content:blocks},null,'  '));
        var bkx = {
            type:'root',
            content:blocks
        }
        return bkx;
    }
};


console.log("inside the exporter");


