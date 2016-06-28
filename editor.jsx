'use strict';

const styleMap = {
    'STRIKETHROUGH': {
        textDecoration: 'line-through',
    },
    'EMPHASIS': {
        fontStyle: 'italic'
    },
    'LINK': {
        color: 'red'
    },
    'STRONG': {
        fontWeight: 'bold',
    },
    'code-inline': {
        fontFamily: 'monospace',
        backgroundColor:'yellow'
    }


};

var config = {password:"foo"};

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
    AtomicBlockUtils,
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
    if (type === 'unstyled')     return 'body';
    if (type === 'code-block')   return 'code-block';
    if (type === 'header-one')   return 'header-one';
    if (type === 'header-two')   return 'header-two';
    if (type === 'header-three') return 'header-three';
}
var isCmd = KeyBindingUtil.hasCommandModifier;
function myKeyBindingFn(e) {
    //console.log("event = ", e.key, e.which, e.keyCode, e.charCode, e.shiftKey, e);
    if (e.keyCode === 66 /* `B` key */ && isCmd(e)) return 'style-bold';
    if (e.keyCode === 73 /* `B` key */ && isCmd(e)) return 'style-italic';
    if (e.keyCode === 67 /* `B` key */ && isCmd(e) && e.shiftKey === true)  return 'style-code';
    if (e.keyCode === 76 /* `B` key */ && isCmd(e) && e.shiftKey === true)  return 'style-link'; //cmd-shift-L
    return getDefaultKeyBinding(e);
}

function mediaBlockRenderer(block) {
    if (block.getType() === 'atomic') {
        return {
            component: Image,
            editable: false
        };
    }
    return null;
}

const Image = (props) => {
    const entity = Entity.get(props.block.getEntityAt(0));
    const {src} = entity.getData();
    return <img src={src} style={styles.media} />;
};

function findLinkEntities(contentBlock, callback) {
    contentBlock.findEntityRanges(
        (character) => {
            const entityKey = character.getEntity();
            return (
                entityKey !== null &&
                Entity.get(entityKey).getType() === 'LINK'
            );
        },
        callback
    );
}

const Link = (props) => {
    const {url} = Entity.get(props.entityKey).getData();
    return (
        <a href={url}>
            {props.children}
        </a>
    );
};

class App extends React.Component {
    constructor(props) {
        super(props);
        const blocks = convertFromRaw(rawContent);
        this.decorator = new CompositeDecorator([
            {
                strategy: findLinkEntities,
                component: Link
            }
        ]);
        this.state = {
            editorState: EditorState.createWithContent(blocks, this.decorator),
            posts:[],
            post: {
                title:"foo"
            }
        };
        this.onChange = (editorState) => this.setState({editorState});
        this.logState = () => {
            const content = this.state.editorState.getCurrentContent();
            console.log(convertToRaw(content));
        };

        //console.log("fetching from the real blog");
        utils.getJSON('/posts',(resp)=>{
            this.setState({
                posts:resp
            })
        });
        //var blogid = "id_97493558";
        //var blogid = "id_65595712";
        var blogid = "9525084e-3239-45f8-812c-a8d3eec75cc7";
        var self = this;


        utils.getJSON("/load?id="+blogid,(post) => {
            console.log("got a post",post);
            this.setState({post:post });
            var raw = exporter.JoshRawToDraftRaw(post.raw);
            console.log("raw = ", raw);
            var blocks = convertFromRaw(raw);
            this.onChange(EditorState.createWithContent(blocks, this.decorator));
        });

    }

    loadContent(cont) {
        this.onChange(EditorState.createWithContent(cont, this.decorator));
    }
    componentDidMount() {
       //exporter.runTests(this);
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
    doInlineLink() {
        console.log("making an inline link");
        const entityKey = Entity.create('LINK', 'MUTABLE', {url: "http://www.pubnub.com/"});
        this.onChange(RichUtils.toggleLink(
            this.state.editorState,
            this.state.editorState.getSelection(),
            entityKey
        ));
    }
    doLink(e) {
        /*
        console.log("making a link");
        const entityKey = Entity.create('LINK', 'MUTABLE', {url: "http://www.pubnub.com/"});
        console.log("selection = ",this.state.editorState.getSelection());
        */
        /*
        const selstate = new SelectionState({
            anchorKey: blockKey,
            anchorOffset: 0,
            focusKey: blockKey,
            focusOffset: block.getLength(),
        });

        this.onChange(RichUtils.toggleLink(
            this.state.editorState,
            selstate,
            entityKey
        ));*/
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

    addMedia() {
        var type = 'image';
        //var src = "http://joshondesign.com/images/69312_IMG_3195.JPG";
        var src = "https://www.packtpub.com/sites/default/files/3144_Three.js%20Cookbook.jpg";

        const entityKey = Entity.create(type, 'IMMUTABLE', {src});

        this.onChange(AtomicBlockUtils.insertAtomicBlock(
            this.state.editorState,
            entityKey,
            ' '
        ));
    }


    handleKeyCommand(command) {
        console.log("got a command", command);
        if(command === 'style-bold') this.toggleInline('BOLD');
        if(command === 'style-italic') this.toggleInline('ITALIC');
        if(command === 'style-code') this.toggleInline('CODE');
        if(command === 'style-link') this.doInlineLink();
        return false;
    }

    doExport() {
        const content = this.state.editorState.getCurrentContent();
        var draw = convertToRaw(content);
        var jraw = exporter.DraftRawToJoshRaw(draw);
        var draw2 = exporter.JoshRawToDraftRaw(jraw);
        this.onChange(EditorState.createWithContent(convertFromRaw(draw2), this.decorator));
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
                    <button onClick={this.addMedia.bind(this)}>image</button>
                    <button onClick={this.doLink.bind(this)}>link</button>
                    <button onClick={this.doExport.bind(this)}>export</button>
                    <button onClick={this.logState}>special paste</button>
                </div>
                <div className="hbox grow">
                    <PostsList posts={this.state.posts}/>
                    <div className="draftjs">
                        <Editor
                            editorState={this.state.editorState}
                            onChange={this.onChange}
                            keyBindingFn={myKeyBindingFn}
                            handleKeyCommand={this.handleKeyCommand.bind(this)}
                            blockStyleFn={myBlockStyleFn}
                            blockRendererFn={mediaBlockRenderer}
                            customStyleMap={styleMap}
                            ref="editor"
                        />
                    </div>
                    <MetaEditor post={this.state.post}/>
                </div>
            </div>
        );
    }


}



const styles = {
    root: {
        fontFamily: '\'Georgia\', serif',
        padding: 20,
        width: 600,
    },
    buttons: {
        marginBottom: 10,
    },
    urlInputContainer: {
        marginBottom: 10,
    },
    urlInput: {
        fontFamily: '\'Georgia\', serif',
        marginRight: 10,
        padding: 3,
    },
    editor: {
        border: '1px solid #ccc',
        cursor: 'text',
        minHeight: 80,
        padding: 10,
    },
    button: {
        marginTop: 10,
        textAlign: 'center',
    },
    link: {
        color: '#3b5998',
        textDecoration: 'underline',
    },
};


ReactDOM.render(
    <App/>,
    document.getElementById('target')
);
