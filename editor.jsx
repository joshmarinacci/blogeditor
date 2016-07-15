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
    DraftEditorBlock,
    DraftEntity,
    Modifier
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
    if (type === 'unordered-list-item') return 'unordered-list-item';
}
var isCmd = KeyBindingUtil.hasCommandModifier;
function myKeyBindingFn(e) {
    //console.log("event = ", e.key, e.which, e.keyCode, e.charCode, e.shiftKey, e);
    if (e.keyCode === 66 /* `B` key */ && isCmd(e)) return 'style-bold'; // cmd B
    if (e.keyCode === 73 /* `I` key */ && isCmd(e)) return 'style-italic'; // cmd I
    if (e.keyCode === 67 /* `C` key */ && isCmd(e) && e.shiftKey === true)  return 'style-code'; //cmd-shift-C
    if (e.keyCode === 76 /* `L` key */ && isCmd(e) && e.shiftKey === true)  return 'style-link'; //cmd-shift-L
    if (e.keyCode === 75 /* `K` key */ && isCmd(e))  return 'style-link'; //cmd-shift-L
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
            },
            urlDialogVisible:false,
            urlDialogExistingText:"",
            urlDialogExistingLink:"",
            imageDialogVisible:false,
            isNew:false,
        };
        this.onChange = (editorState) => this.setState({editorState});
        this.logState = () => {
            const content = this.state.editorState.getCurrentContent();
            console.log(convertToRaw(content));
        };

        //console.log("fetching from the real blog");
        this.fetchPosts();
        //var blogid = "id_97493558";
        //var blogid = "id_65595712";
        //var blogid = "27fa3339-7119-492f-8f1e-3b6ce528310e";
        //var blogid = "9525084e-3239-45f8-812c-a8d3eec75cc7";
        //var blogid = "6dc47cd3-b5d0-44c7-9172-5640fdd225ef";
        var blogid = "a7900c5d-f19a-48a4-af23-80727aebcbb1";// beautiful lego 2: dark
        this.loadPostById(blogid);
    }
    fetchPosts() {
        utils.getJSON('/posts',(resp)=>{
            this.setState({
                posts:resp
            })
        });
    }

    editPost(post) {
        this.loadPostById(post.id);
    }
    loadPostById(blogid) {
        var self = this;
        utils.getJSON("/load?id="+blogid,(post) => {
            console.log("got a post",post);
            this.setState({post:post });
            var jraw = post.raw;
            if(post.format == 'markdown') {
                console.log("post is markdown. converting");
                MarkdownUtils.parseToJoshRaw(jraw, function(doc){
                    console.log("got back the doc",doc);
                    var raw = exporter.JoshRawToDraftRaw(doc);
                    var blocks = convertFromRaw(raw);
                    self.onChange(EditorState.createWithContent(blocks, self.decorator));
                });
            } else {
                var raw = exporter.JoshRawToDraftRaw(jraw);
                var blocks = convertFromRaw(raw);
                this.onChange(EditorState.createWithContent(blocks, this.decorator));
            }
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
        this.showUrlDialog();
    }
    getSelectedLinkKey() {
        var selection = this.state.editorState.getSelection();
        var content = this.state.editorState.getCurrentContent();
        var block = content.getBlockForKey(selection.getAnchorKey());
        var chars = block.getCharacterList().slice(selection.getStartOffset(), selection.getEndOffset());
        var entityKey = null;
        chars.some((v) => {
            entityKey = v.getEntity();
        });
        var text = block.getText().slice(selection.getStartOffset(), selection.getEndOffset());

        var ftext = "";
        block.findEntityRanges(
            (character) => {
                const entityKey = character.getEntity();
                return (entityKey !== null && Entity.get(entityKey).getType() === 'LINK');
            },
            (start,end) => {
                ftext = block.getText().slice(start,end);
            }
        );
        return {key:entityKey, text:ftext, url:Entity.get(entityKey).getData().url};
    }
    showUrlDialog() {
        //find link under the cursor
        if(RichUtils.currentBlockContainsLink(this.state.editorState)) {
            var ret = this.getSelectedLinkKey();
            this.setState({
                urlDialogVisible:true,
                urlDialogExistingLink:ret.url,
                urlDialogExistingText:ret.text,
                urlDialogUpdateExisting:true
            });
        } else {
            this.setState({
                urlDialogVisible: true,
                urlDialogExistingLink: "",
                urlDialogExistingText: "",
                urlDialogUpdateExisting: false
            });
        }
    }
    cancelUrlDialog() {
        this.setState({urlDialogVisible:false});
        this.refs.editor.focus();
    }
    okayUrlDialog(url) {
        this.setState({urlDialogVisible:false});
        this.refs.editor.focus();
        //have to do this part later, after the focus change, so the selection will be valid
        setTimeout(()=>{
            if(this.state.urlDialogUpdateExisting === true) {
                var editorState = this.state.editorState;
                var key = this.getSelectedLinkKey();
                var ent2 = Entity.replaceData(key,{url:url});
                var withoutLink = Modifier.applyEntity(editorState.getCurrentContent(), editorState.getSelection(), key);
                this.onChange(EditorState.push(editorState, withoutLink, 'apply-entity'));
                console.log("installed new url", url);
                return;
            }
            const entityKey = Entity.create('LINK', 'MUTABLE', {url: url});
            this.onChange(RichUtils.toggleLink(
                this.state.editorState,
                this.state.editorState.getSelection(),
                entityKey
            ));
        },100);
    }

    showImageDialog() {
        this.setState({
            imageDialogVisible:true
        })
    }
    cancelImageDialog() {
        this.setState({
            imageDialogVisible:false
        })

    }
    okayImageDialog(src){
        this.setState({
            imageDialogVisible:false
        });
        setTimeout(()=>{
            var type = 'image';
            //var src = "http://joshondesign.com/images/69312_IMG_3195.JPG";
            //var src = "https://www.packtpub.com/sites/default/files/3144_Three.js%20Cookbook.jpg";
            console.log('adding the src',src);
            const entityKey = Entity.create(type, 'IMMUTABLE', {src});
            this.onChange(AtomicBlockUtils.insertAtomicBlock(
                this.state.editorState,
                entityKey,
                ' '
            ));
        },100);
    }

    doLink(e) {
        this.showUrlDialog();
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

    setOrderedList() {
        this.toggleBlockType("ordered-list-item");
    }
    setUnorderedList() {
        this.toggleBlockType("unordered-list-item");
    }
    addMedia() {
        this.showImageDialog();
        /*
        var type = 'image';
        //var src = "http://joshondesign.com/images/69312_IMG_3195.JPG";
        var src = "https://www.packtpub.com/sites/default/files/3144_Three.js%20Cookbook.jpg";

        const entityKey = Entity.create(type, 'IMMUTABLE', {src});

        this.onChange(AtomicBlockUtils.insertAtomicBlock(
            this.state.editorState,
            entityKey,
            ' '
        ));
        */
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
        console.log("jraw = ", jraw);
        //var draw2 = exporter.JoshRawToDraftRaw(jraw);
        //this.onChange(EditorState.createWithContent(convertFromRaw(draw2), this.decorator));
    }

    doDiff() {
        const content = this.state.editorState.getCurrentContent();
        var draw = convertToRaw(content);
        var jraw = exporter.DraftRawToJoshRaw(draw);
        console.log("jraw = ", jraw);
        utils.getJSON("/load?id="+this.state.post.id,(post) => {
            console.log("got a post", post);
            var diff = DeepDiff.noConflict();
            var jraw2 = post.raw;
            console.log("diff = ",diff(jraw,jraw2));
            console.log("jraw2 = ", jraw2);
        });
    }

    doSave() {
        const content = this.state.editorState.getCurrentContent();
        var draw = convertToRaw(content);
        var jraw = exporter.DraftRawToJoshRaw(draw);
        console.log("jraw = ", jraw);
        var post = this.state.post;
        post.content = null;
        post.raw = jraw;
        //post.format = 'jsem';
        utils.postJSON('/save', post, (res) => {
            console.log("saved with result", res);
            if(this.state.isNew === true) {
                this.setState({isNew:false});
                console.log("it's a new doc. must refresh");
                this.fetchPosts();
            }
        });
    }

    doNew() {
        console.log("creating a new blog");
        const rawContent = {
            blocks: [
                {
                    text: (
                        'new document'
                    ),
                    type: 'unstyled'
                }
            ],
            entityMap: {

            }
        };
        const blocks = convertFromRaw(rawContent);
        this.onChange(EditorState.createWithContent(blocks, this.decorator));

        var post = {
            title:'no title set',
            slug:'no_slug_set',
            timestamp: moment().unix(),
            format : 'jsem',
            tags : [],
            status:'draft',
            id: 'id_'+Math.floor(Math.random()*100*1000*1000)
        };

        this.setState({
            isNew:true,
            post: post
        })
    }

    doDelete() {
        console.log("deleting the current blog",this.state.post);
        utils.postJSON("/delete?id="+this.state.post.id,{},(res) => {
            console.log("got the result of deleting",res);
            this.fetchPosts();
            const rawContent = {
                blocks: [
                    {
                        text: (
                            'new document'
                        ),
                        type: 'unstyled'
                    }
                ],
                entityMap: {

                }
            };
            const blocks = convertFromRaw(rawContent);
            this.onChange(EditorState.createWithContent(blocks, this.decorator));
        });
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
                    <button onClick={this.setOrderedList.bind(this)}>OL</button>
                    <button onClick={this.setUnorderedList.bind(this)}>UL</button>
                    <button onClick={this.addMedia.bind(this)}>image</button>
                    <button onClick={this.doLink.bind(this)}>link</button>
                    <button onClick={this.doExport.bind(this)}>export</button>
                    <button onClick={this.doDiff.bind(this)}>diff</button>
                    <button onClick={this.doSave.bind(this)}>save</button>
                    <button onClick={this.doNew.bind(this)}>new</button>
                    <button onClick={this.doDelete.bind(this)}>delete</button>
                </div>
                <div className="hbox grow">
                    <PostsList posts={this.state.posts} onSelectPost={this.editPost.bind(this)}/>
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
                <URLDialog
                    visible={this.state.urlDialogVisible}
                    link={this.state.urlDialogExistingLink}
                    text={this.state.urlDialogExistingText}
                    onCancel={this.cancelUrlDialog.bind(this)}
                    onAction={this.okayUrlDialog.bind(this)}
                />
                <ImageDialog
                    visible={this.state.imageDialogVisible}
                    onCancel={this.cancelImageDialog.bind(this)}
                    onAction={this.okayImageDialog.bind(this)}
                />
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
