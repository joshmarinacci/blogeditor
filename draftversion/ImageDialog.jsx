class ImageDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            src:""
        }
    }
    componentWillReceiveProps(props) {
        if(props.editing===true && props.block) {
            this.setState({
                src: Entity.get(props.block.getEntityAt(0)).getData().src
            })
        }
    }
    editedSrc() {
        this.setState({
            src:this.refs.src.value
        });
    }
    cancel() {
        this.props.onCancel();
    }
    okay() {
        this.props.onAction(this.refs.src.value);
    }
    render() {
        return <div className={"scrim " + (this.props.visible?"":"hidden")}>
            <div className="dialog image-dialog vbox">
                <h1>Edit Image</h1>
                <div className="hbox">
                    <b>alt</b>
                    <input type="text"/>
                </div>
                <div className="hbox">
                    <b>title</b>
                    <input type="text"/>
                </div>
                <div className="hbox">
                    <b>src</b>
                    <input type="text" ref="src" value={this.state.src} onChange={this.editedSrc.bind(this)}/>
                </div>
                <div className="hbox">
                    <span className="spacer"></span>
                    <button onClick={this.cancel.bind(this)}>Cancel</button>
                    <button onClick={this.okay.bind(this)}>Okay</button></div>
            </div>
        </div>
    }
}
