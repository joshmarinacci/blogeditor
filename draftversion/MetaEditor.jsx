class MetaEditor extends React.Component {
    render() {
        var post = this.props.post;
        return <div className="metadata-editor vbox">
            <div>date <b>{post.date}</b></div>
            <div>format <b>{post.format}</b></div>
            <div>slug name <b>{post.slug}</b></div>
            <div>path <b>{post.path}</b></div>
            <div>status <b>{post.status}</b></div>
            <div>type <b>{post.type}</b></div>
            <div>title <b>{post.title}</b></div>
            <div>tags <b>{post.tags}</b></div>
        </div>
    }
}
