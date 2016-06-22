'use strict';

const {
    CompositeDecorator,
    Editor,
    EditorState,
    EditorBlock,
    Entity,
    RichUtils,
    DefaultDraftBlockRenderMap,
    getDefaultKeyBinding,
    KeyBindingUtil,
    convertToRaw,
    convertFromRaw,
    DraftEditorBlock
    } = Draft;

const rawContent = {
    blocks: [
        {
            text: (
                'this is some bold text'
            ),
            type: 'unstyled'
        }
    ],
    entityMap: {

    }
};

function myBlockStyleFn(contentBlock) {
    const type = contentBlock.getType();
    if (type === 'unstyled') return 'body';
    if (type === 'code-block') return 'code-block';
}
var isCmd = KeyBindingUtil.hasCommandModifier;
function myKeyBindingFn(e) {
    //console.log("event = ", e.key, e.which, e.keyCode, e.charCode, e.shiftKey, e);
    if (e.keyCode === 66 /* `B` key */ && isCmd(e)) return 'style-bold';
    if (e.keyCode === 73 /* `B` key */ && isCmd(e)) return 'style-italic';
    if (e.keyCode === 67 /* `B` key */ && isCmd(e) && e.shiftKey === true)  return 'style-code';
    return getDefaultKeyBinding(e);
}

class MyComponent extends React.Component {
    constructor(props) {
        super(props);
        const blocks = convertFromRaw(rawContent);
        this.state = {
            editorState: EditorState.createWithContent(blocks)
        };
        this.onChange = (editorState) => this.setState({editorState});
        this.logState = () => {
            const content = this.state.editorState.getCurrentContent();
            console.log(convertToRaw(content));
        };
    }

    toggleBlockType(blockType) {
        //console.log("invoking toggle block type", this, JSON.stringify(blockType));
        this.onChange(
            RichUtils.toggleBlockType(
                this.state.editorState,
                blockType
            )
        );
    }
    toggleInline(style) {
        console.log('styilng with',style);
        this.onChange(
            RichUtils.toggleInlineStyle(
                this.state.editorState,
                style)
        )
    }

    setH1() {
        this.toggleBlockType('header-one');
    }
    setH2() {
        this.toggleBlockType('header-two');
    }
    setH3() {
        this.toggleBlockType('header-three');
    }
    setCodeBlock() {
        this.toggleBlockType('code-block');
    }
    setBody() {
        this.toggleBlockType('unstyled');
    }



    handleKeyCommand(command) {
        console.log("got a command", command);
        if(command === 'style-bold') this.toggleInline('BOLD');
        if(command === 'style-italic') this.toggleInline('ITALIC');
        if(command === 'style-code') this.toggleInline('CODE');
        return false;
    }

    doExport() {
        console.log("doing an export");
        const content = this.state.editorState.getCurrentContent();
        var blob = convertToRaw(content);
        var blocks = blob.blocks.map((block)=>{
            var txt = block.text;
            var chunks = [];
            var last = 0;
            block.inlineStyleRanges.forEach(function(range) {
                var before = txt.substring(last,range.offset);
                chunks.push({
                    type:'text',
                    text:before
                });
                var middle = txt.substring(range.offset,range.offset+range.length);
                chunks.push({
                    type:'span',
                    style:'foo',
                    content:[
                        {
                            type:'text',
                            text:middle
                        }
                    ]
                });
                console.log("range is",range);
                last = range.offset + range.length;
            });
            chunks.push({
                type:'text',
                text:txt.substring(last)
            });
            return {
                type:'block',
                style:'body',
                content: chunks
            }
        });
        console.log("out = " + JSON.stringify({content:blocks},null,'  '));
    }
    render() {
        const {editorState} = this.state;
        return (<div className="main vbox">
                <div className="toolbar">
                    <button onClick={this.logState}>log state</button>
                    <button onClick={this.setH1.bind(this)}>H1</button>
                    <button onClick={this.setH2.bind(this)}>H2</button>
                    <button onClick={this.setH3.bind(this)}>H3</button>
                    <button onClick={this.setBody.bind(this)}>body</button>
                    <button onClick={this.setCodeBlock.bind(this)}>code block</button>
                    <button onClick={this.logState}>UL</button>
                    <button onClick={this.logState}>image</button>
                    <button onClick={this.logState}>link</button>
                    <button onClick={this.doExport.bind(this)}>export</button>
                    <button onClick={this.logState}>special paste</button>
                </div>
                <div className="hbox">
                <div className="draftjs">
                    <Editor
                        editorState={this.state.editorState}
                        onChange={this.onChange}
                        keyBindingFn={myKeyBindingFn}
                        handleKeyCommand={this.handleKeyCommand.bind(this)}
                        blockStyleFn={myBlockStyleFn}
                        ref="editor"
                    />
                </div>
                <div className="links">
                    list of links go here
                </div>
                </div>
            </div>
        );
    }
}
ReactDOM.render(
    <MyComponent/>,
    document.getElementById('target')
);
