class URLDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            url:"",
            text:""
        }
    }
    componentWillReceiveProps(props) {
        if(props.visible === true) {
            setTimeout(()=>{
                this.refs.urlText.focus();
            },100);
        }
        this.setState({
            text: props.link.text,
            url: props.link.url
        });
    }
    editLink() {
        this.setState({
            url:this.refs.urlText.value
        })
    }
    cancel() {
        this.props.onCancel();
    }
    okay() {
        this.props.onAction(this.refs.urlText.value);
    }
    render() {
        return <div className={"scrim " + (this.props.visible?"":"hidden")}>
            <div className="dialog url-dialog vbox">
                <h1>Edit URL</h1>
                <div className="hbox">
                    <b>text</b>
                    <input type="text" value={this.state.text}/></div>
                <div className="hbox">
                    <b>link</b>
                    <input type="text" ref="urlText" value={this.state.url} onChange={this.editLink.bind(this)}/></div>
                <div className="hbox">
                    <span className="spacer"></span>
                    <button onClick={this.cancel.bind(this)}>Cancel</button>
                    <button onClick={this.okay.bind(this)}>Okay</button></div>
            </div>
        </div>
    }
}
