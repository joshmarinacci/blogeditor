class URLDialog extends React.Component {
    cancel() {
        this.props.onCancel();
    }
    okay() {
        this.props.onAction(this.refs.urlText.value);
    }
    render() {
        return <div className={"scrim " + (this.props.visible?"":"hidden")}>
            <div className="url-dialog vbox">
                <h2>Edit URL</h2>
                <div className="hbox"><b>text</b><input type="text"/></div>
                <div className="hbox"><b>link</b><input type="text" ref="urlText"/></div>
                <div className="hbox">
                    <button onClick={this.cancel.bind(this)}>Cancel</button>
                    <button onClick={this.okay.bind(this)}>Okay</button></div>
            </div>
        </div>
    }
}
